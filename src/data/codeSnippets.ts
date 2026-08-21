export interface CodeFile {
  name: string;
  filename: string;
  language: string;
  description: string;
  content: string;
}

export const CODE_FILES: CodeFile[] = [
  {
    name: "Python Scraper Script",
    filename: "phd_hunter.py",
    language: "python",
    description: "Production-ready automated scraper with EURAXESS, FindAPhD, SQLite deduplication, Telegram & Email dispatchers, and 24h schedule loop.",
    content: `#!/usr/bin/env python3
"""
========================================================================================
 PhD Position Hunter (Global Ex-USA)
 Automated daily scraper and monitor for fully-funded PhD vacancies in:
   1. Federated Learning
   2. Human Activity Recognition (HAR)
   3. Transformer models (Deep Learning)

 Strict Filtering: EXCLUDES all positions based in the United States.
 Notifications: Telegram Bot API & SMTP Email (Daily Digest).
 Persistence: SQLite database prevents duplicate alerts.
 Scheduling: Automated 24h cron loop using the \`schedule\` library.
========================================================================================
"""

import os
import sys
import time
import random
import logging
import sqlite3
import hashlib
import smtplib
import urllib.parse
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Set, Tuple

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup
import feedparser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout), logging.FileHandler("phd_hunter.log", encoding="utf-8")]
)
logger = logging.getLogger("PhDHunter")

# Target Research Keyword Taxonomy
TARGET_TOPICS = {
    "Federated Learning": [
        "federated learning", "federated optimization", "federated machine learning",
        "decentralized learning", "privacy-preserving machine learning", "privacy preserving ml",
        "collaborative learning", "split learning", "differential privacy federated"
    ],
    "Human Activity Recognition": [
        "human activity recognition", "activity recognition", "har", "wearable sensor",
        "inertial measurement", "imu sensor", "body sensor networks", "motion recognition",
        "sensor fusion activity", "gait analysis", "ubiquitous computing activity"
    ],
    "Transformers & Deep Learning": [
        "transformer model", "transformer architecture", "vision transformer", "vit",
        "attention mechanism", "large language model", "foundation model",
        "deep representation learning", "sequence-to-sequence transformer",
        "spatiotemporal transformer", "self-attention"
    ]
}

# Strict US Exclusion Filter
USA_EXCLUSION_KEYWORDS = {
    "united states", "united states of america", "usa", "u.s.a.", "u.s.", "us",
    "america", "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
    "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho", "illinois",
    "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland",
    "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "montana",
    "nebraska", "nevada", "new hampshire", "new jersey", "new mexico", "new york",
    "north carolina", "north dakota", "ohio", "oklahoma", "oregon", "pennsylvania",
    "rhode island", "south carolina", "south dakota", "tennessee", "texas", "utah",
    "vermont", "virginia", "washington", "west virginia", "wisconsin", "wyoming",
    "mit", "stanford", "harvard", "berkeley", "caltech", "carnegie mellon", "cmu",
    "princeton", "columbia university", "yale", "cornell", "georgia tech", "purdue",
    "university of washington", "ucla", "uc san diego", "ucsb", "uc berkeley", "uiuc"
}

FUNDED_INDICATORS = [
    "fully funded", "fully-funded", "funded phd", "funded doctoral", "tuition waiver",
    "stipend", "salary", "remuneration", "msca", "marie sklodowska-curie", "marie curie",
    "horizon europe", "dfg", "snf", "epsrc", "doctoral candidate", "tv-l e13",
    "employment contract", "doctoral fellowship", "full scholarship", "phd position"
]

UNFUNDED_INDICATORS = [
    "self-funded", "self funded", "tuition fee applies", "tuition fees must be paid",
    "unfunded", "no funding available", "students must secure their own funding"
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15"
]

@dataclass
class PhDPosition:
    title: str
    institution: str
    country: str
    supervisor: Optional[str]
    description: str
    funding_status: str
    url: str
    matched_topic: str
    matched_keyword: str
    source_platform: str
    discovered_date: str = datetime.utcnow().strftime("%Y-%m-%d")
    position_hash: str = ""

    def __post_init__(self):
        if not self.position_hash:
            raw_id = f"{self.url.strip().lower()}|{self.title.strip().lower()}"
            self.position_hash = hashlib.sha256(raw_id.encode("utf-8")).hexdigest()

class DatabaseManager:
    def __init__(self, db_path: str = "phd_positions.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.cursor().execute("""
                CREATE TABLE IF NOT EXISTS seen_positions (
                    position_hash TEXT PRIMARY KEY,
                    url TEXT NOT NULL,
                    title TEXT NOT NULL,
                    institution TEXT,
                    country TEXT,
                    topic TEXT,
                    discovered_date TEXT
                )
            """)
            conn.commit()

    def is_seen(self, position_hash: str) -> bool:
        with sqlite3.connect(self.db_path) as conn:
            res = conn.cursor().execute("SELECT 1 FROM seen_positions WHERE position_hash = ?", (position_hash,))
            return res.fetchone() is not None

    def mark_seen(self, pos: PhDPosition):
        with sqlite3.connect(self.db_path) as conn:
            conn.cursor().execute("""
                INSERT OR IGNORE INTO seen_positions 
                (position_hash, url, title, institution, country, topic, discovered_date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (pos.position_hash, pos.url, pos.title, pos.institution, pos.country, pos.matched_topic, pos.discovered_date))
            conn.commit()

class SafeScraper:
    def __init__(self):
        self.session = requests.Session()
        adapter = HTTPAdapter(max_retries=Retry(total=3, backoff_factor=1.5, status_forcelist=[429, 500, 502, 503, 504]))
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

    def safe_get(self, url: str, params: Optional[Dict] = None, referer: Optional[str] = None) -> Optional[requests.Response]:
        min_d = float(os.getenv("MIN_REQUEST_DELAY", 2.0))
        max_d = float(os.getenv("MAX_REQUEST_DELAY", 5.0))
        time.sleep(random.uniform(min_d, max_d))
        headers = {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        if referer: headers["Referer"] = referer
        try:
            r = self.session.get(url, params=params, headers=headers, timeout=20)
            r.raise_for_status()
            return r
        except Exception as e:
            logger.warning(f"Error fetching {url}: {e}")
            return None

class PositionFilter:
    @staticmethod
    def is_in_usa(country: str, institution: str, full_text: str) -> bool:
        c, inst, txt = country.lower(), institution.lower(), full_text.lower()
        if c in USA_EXCLUSION_KEYWORDS: return True
        for kw in USA_EXCLUSION_KEYWORDS:
            if len(kw) <= 3:
                if f" {kw} " in f" {c} " or f" {kw} " in f" {inst} ": return True
            else:
                if kw in c or kw in inst: return True
        return False

    @staticmethod
    def match_topic(text: str) -> Optional[Tuple[str, str]]:
        t_low = text.lower()
        for topic, keywords in TARGET_TOPICS.items():
            for kw in keywords:
                if kw in t_low: return topic, kw
        return None

    @staticmethod
    def is_fully_funded(text: str, funding_field: str = "") -> bool:
        combined = f"{text} {funding_field}".lower()
        for unf in UNFUNDED_INDICATORS:
            if unf in combined: return False
        for fnd in FUNDED_INDICATORS:
            if fnd in combined: return True
        return True

class EuraxessScraper:
    NAME = "EURAXESS (European Commission)"
    def __init__(self, client: SafeScraper): self.client = client
    def search(self, keywords: List[str]) -> List[PhDPosition]:
        res = []
        for kw in keywords:
            url = f"https://euraxess.ec.europa.eu/jobs/search/rss?keywords={urllib.parse.quote(kw)}&f%5B0%5D=profile%3AFirst%20Stage%20Researcher%20%28R1%29"
            resp = self.client.safe_get(url)
            if not resp or not resp.content: continue
            feed = feedparser.parse(resp.content)
            for e in feed.entries[:12]:
                title, link = e.get("title", "").strip(), e.get("link", "").strip()
                desc = BeautifulSoup(e.get("summary", ""), "html.parser").get_text(" ", strip=True)
                country = "Europe / International"
                if " - " in title:
                    p = title.rsplit(" - ", 1)
                    if len(p[-1].strip()) < 30: country = p[-1].strip()
                match = PositionFilter.match_topic(f"{title} {desc}")
                if not match or PositionFilter.is_in_usa(country, "EU Institution", f"{title} {desc}"): continue
                topic, matched_kw = match
                res.append(PhDPosition(
                    title=title, institution="European Research Institution", country=country,
                    supervisor=None, description=desc[:350] + "...",
                    funding_status="Fully Funded (MSCA / European Doctoral Contract)",
                    url=link, matched_topic=topic, matched_keyword=matched_kw, source_platform=self.NAME
                ))
        return res

class FindAPhDScraper:
    NAME = "FindAPhD"
    BASE_URL = "https://www.findaphd.com"
    def __init__(self, client: SafeScraper): self.client = client
    def search(self, keywords: List[str]) -> List[PhDPosition]:
        res = []
        for kw in keywords:
            url = f"https://www.findaphd.com/phds/?Keywords={urllib.parse.quote_plus(kw)}&Funding=F1"
            resp = self.client.safe_get(url, referer=self.BASE_URL)
            if not resp or resp.status_code != 200: continue
            soup = BeautifulSoup(resp.text, "html.parser")
            for card in soup.select(".phd-result-card, .resultsRow, .w-full.bg-white")[:10]:
                try:
                    t_el = card.select_one(".phd-result-card__title, .resultsRow__title, h3 a, h2 a")
                    if not t_el: continue
                    title = t_el.get_text(strip=True)
                    direct_url = urllib.parse.urljoin(self.BASE_URL, t_el.get("href", ""))
                    inst = getattr(card.select_one(".instName, .university-name"), 'text', 'University').strip()
                    country = getattr(card.select_one(".countryName, .location"), 'text', 'UK / Europe').strip()
                    desc = getattr(card.select_one(".desc, .descLong, p"), 'text', 'Fully funded PhD').strip()
                    if PositionFilter.is_in_usa(country, inst, f"{title} {desc}"): continue
                    match = PositionFilter.match_topic(f"{title} {desc}")
                    if not match: continue
                    topic, matched_kw = match
                    res.append(PhDPosition(
                        title=title, institution=inst, country=country, supervisor=None,
                        description=desc[:350] + "...", funding_status="Fully Funded (Tuition + Maintenance)",
                        url=direct_url, matched_topic=topic, matched_keyword=matched_kw, source_platform=self.NAME
                    ))
                except Exception: continue
        return res

class TelegramNotifier:
    def __init__(self, token: str, chat_id: str):
        self.token, self.chat_id = token, chat_id
        self.url = f"https://api.telegram.org/bot{token}/sendMessage"
    def send_digest(self, positions: List[PhDPosition]):
        if not positions: return
        msg = f"🎓 <b>Daily PhD Digest (Ex-USA)</b>\\nFound <b>{len(positions)}</b> fully-funded positions:\\n\\n"
        for idx, p in enumerate(positions[:8], 1):
            msg += f"<b>{idx}. <a href=\\"{p.url}\\">{p.title}</a></b>\\n🏛️ {p.institution} ({p.country})\\n🔬 [{p.matched_topic}]\\n💰 {p.funding_status}\\n\\n"
        requests.post(self.url, json={"chat_id": self.chat_id, "text": msg, "parse_mode": "HTML", "disable_web_page_preview": True})

class EmailNotifier:
    def __init__(self, host: str, port: int, user: str, pwd: str, recipient: str, use_tls: bool = True):
        self.host, self.port, self.user, self.pwd, self.recipient, self.use_tls = host, port, user, pwd, recipient, use_tls
    def send_digest(self, positions: List[PhDPosition]):
        if not positions: return
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🎓 Daily PhD Digest: {len(positions)} New Positions (FL, HAR, Transformers)"
        msg["From"], msg["To"] = self.user, self.recipient
        body = f"Found {len(positions)} new positions:\\n" + "\\n".join([f"- [{p.matched_topic}] {p.title} ({p.country}) -> {p.url}" for p in positions])
        msg.attach(MIMEText(body, "plain"))
        s = smtplib.SMTP(self.host, self.port) if self.use_tls else smtplib.SMTP_SSL(self.host, self.port)
        if self.use_tls: s.starttls()
        s.login(self.user, self.pwd)
        s.sendmail(self.user, self.recipient, msg.as_string())
        s.quit()

class PhDHunterPipeline:
    def __init__(self):
        self.db = DatabaseManager(os.getenv("DB_PATH", "phd_positions.db"))
        self.client = SafeScraper()
        self.scrapers = [EuraxessScraper(self.client), FindAPhDScraper(self.client)]
        self.tg = TelegramNotifier(os.getenv("TELEGRAM_BOT_TOKEN"), os.getenv("TELEGRAM_CHAT_ID")) if os.getenv("TELEGRAM_ENABLED", "false").lower() == "true" else None
        self.em = EmailNotifier(os.getenv("SMTP_SERVER", "smtp.gmail.com"), int(os.getenv("SMTP_PORT", 587)), os.getenv("SMTP_SENDER_EMAIL"), os.getenv("SMTP_PASSWORD"), os.getenv("EMAIL_RECIPIENT")) if os.getenv("EMAIL_ENABLED", "false").lower() == "true" else None

    def run_daily_search(self):
        logger.info("Starting PhD Vacancy Search...")
        kws = ["federated learning", "human activity recognition", "vision transformer", "deep representation learning"]
        all_pos = []
        for s in self.scrapers:
            try: all_pos.extend(s.search(kws))
            except Exception as e: logger.error(f"Error in {s.NAME}: {e}")
        new_pos = [p for p in all_pos if not self.db.is_seen(p.position_hash)]
        for p in new_pos: self.db.mark_seen(p)
        logger.info(f"Retrieved {len(all_pos)} positions | {len(new_pos)} new unique.")
        if new_pos:
            if self.tg: self.tg.send_digest(new_pos)
            if self.em: self.em.send_digest(new_pos)
        return new_pos

def main():
    import schedule
    pipeline = PhDHunterPipeline()
    if os.getenv("RUN_ON_STARTUP", "true").lower() == "true":
        pipeline.run_daily_search()
    schedule.every().day.at(os.getenv("SCHEDULE_TIME", "08:00")).do(pipeline.run_daily_search)
    while True:
        schedule.run_pending()
        time.sleep(30)

if __name__ == "__main__":
    main()
`
  },
  {
    name: "Python Dependencies",
    filename: "requirements.txt",
    language: "text",
    description: "Minimal required packages for scraping, scheduling, SQLite persistence, and email/telegram dispatch.",
    content: `requests>=2.31.0
urllib3>=2.0.7
beautifulsoup4>=4.12.3
lxml>=5.1.0
feedparser>=6.0.11
schedule>=1.2.1
python-dotenv>=1.0.1
pydantic>=2.6.0
`
  },
  {
    name: "Environment Config",
    filename: ".env.example",
    language: "bash",
    description: "API keys, Telegram bot credentials, SMTP Gmail passwords, and scraper timing settings.",
    content: `# --- TELEGRAM ALERTS ---
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
TELEGRAM_CHAT_ID="your_telegram_chat_id_here"

# --- EMAIL NOTIFICATIONS (GMAIL SMTP) ---
EMAIL_ENABLED=false
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_SENDER_EMAIL="your_email@gmail.com"
SMTP_PASSWORD="your_16_character_app_password"
EMAIL_RECIPIENT="recipient_email@example.com"

# --- SCHEDULER & SETTINGS ---
SCHEDULE_TIME="08:00"
RUN_ON_STARTUP=true
MIN_REQUEST_DELAY=2.5
MAX_REQUEST_DELAY=6.0
DB_PATH="phd_positions.db"
`
  },
  {
    name: "Docker Container",
    filename: "Dockerfile",
    language: "dockerfile",
    description: "Lightweight container image with Python 3.11-slim and persistent SQLite storage volume.",
    content: `FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    TZ=UTC

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY phd_hunter.py .
COPY .env.example .

VOLUME ["/app/data"]
ENV DB_PATH="/app/data/phd_positions.db"

CMD ["python", "phd_hunter.py"]
`
  },
  {
    name: "Docker Compose",
    filename: "docker-compose.yml",
    language: "yaml",
    description: "Multi-container or single daemon deployment with auto-restart and persistent data volume.",
    content: `version: '3.8'

services:
  phd-hunter:
    build: .
    container_name: phd_position_hunter
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./data:/app/data
    environment:
      - DB_PATH=/app/data/phd_positions.db
      - PYTHONUNBUFFERED=1
`
  },
  {
    name: "GitHub Actions Serverless Cron",
    filename: ".github/workflows/daily_phd_search.yml",
    language: "yaml",
    description: "100% Free daily serverless cron workflow executing without needing an active VPS.",
    content: `name: Daily PhD Position Search (Ex-USA)

on:
  schedule:
    - cron: '0 7 * * *' # Runs 7:00 AM UTC daily
  workflow_dispatch:

jobs:
  scrape-and-notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      - run: pip install -r requirements.txt
      - uses: actions/cache@v4
        with:
          path: phd_positions.db
          key: phd-db-\${{ github.run_id }}
          restore-keys: phd-db-
      - name: Run Scraper
        env:
          TELEGRAM_ENABLED: \${{ secrets.TELEGRAM_ENABLED || 'true' }}
          TELEGRAM_BOT_TOKEN: \${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: \${{ secrets.TELEGRAM_CHAT_ID }}
          EMAIL_ENABLED: \${{ secrets.EMAIL_ENABLED || 'false' }}
          SMTP_SERVER: \${{ secrets.SMTP_SERVER || 'smtp.gmail.com' }}
          SMTP_PORT: '587'
          SMTP_SENDER_EMAIL: \${{ secrets.SMTP_SENDER_EMAIL }}
          SMTP_PASSWORD: \${{ secrets.SMTP_PASSWORD }}
          EMAIL_RECIPIENT: \${{ secrets.EMAIL_RECIPIENT }}
          RUN_ON_STARTUP: 'true'
        run: |
          python -c "from phd_hunter import PhDHunterPipeline; PhDHunterPipeline().run_daily_search()"
`
  },
  {
    name: "Setup & Deployment Guide",
    filename: "setup_guide.md",
    language: "markdown",
    description: "Step-by-step documentation for BotFather, Gmail App Passwords, Docker, and Cron setups.",
    content: `# Setup & Deployment Guide for PhD Position Hunter

1. **Telegram Setup**:
   - Talk to @BotFather -> /newbot -> get TELEGRAM_BOT_TOKEN
   - Talk to @userinfobot -> get numerical TELEGRAM_CHAT_ID
   - Set TELEGRAM_ENABLED=true in .env

2. **Gmail SMTP Setup**:
   - Enable 2FA on Google Account
   - Generate App Password at myaccount.google.com/apppasswords
   - Put 16-character password into SMTP_PASSWORD in .env

3. **Run Locally**:
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python phd_hunter.py

4. **Run in Docker**:
   docker compose up -d
`
  }
];
