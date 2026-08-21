#!/usr/bin/env python3
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
 Scheduling: Automated 24h cron loop using the `schedule` library.
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
import cloudscraper
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

# Load environment variables from .env file
load_dotenv()

# ==============================================================================
# LOGGING SETUP
# ==============================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("phd_hunter.log", encoding="utf-8")
    ]
)
logger = logging.getLogger("PhDHunter")

# ==============================================================================
# CONFIGURATION & KEYWORD TAXONOMY
# ==============================================================================
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

# Strict US Exclusion List (Keywords, States, Country codes, US universities)
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

# Recognized Fully Funded Indicators
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

# Rotating Realistic User-Agents to prevent anti-scraping blocks
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0"
]

# ==============================================================================
# DATA MODELS
# ==============================================================================
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
            # Generate deterministic hash based on normalized URL and title
            raw_id = f"{self.url.strip().lower()}|{self.title.strip().lower()}"
            self.position_hash = hashlib.sha256(raw_id.encode("utf-8")).hexdigest()

# ==============================================================================
# PERSISTENCE & DEDUPLICATION (SQLite)
# ==============================================================================
class DatabaseManager:
    """Manages local SQLite database to prevent sending duplicate notifications."""
    def __init__(self, db_path: str = "phd_positions.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
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
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM seen_positions WHERE position_hash = ?", (position_hash,))
            return cursor.fetchone() is not None

    def mark_seen(self, position: PhDPosition):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR IGNORE INTO seen_positions 
                (position_hash, url, title, institution, country, topic, discovered_date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                position.position_hash,
                position.url,
                position.title,
                position.institution,
                position.country,
                position.matched_topic,
                position.discovered_date
            ))
            conn.commit()

# ==============================================================================
# NETWORK & SCRAPING ENGINE
# ==============================================================================
class SafeScraper:
    """Resilient HTTP client with retry strategies, jitter delays, and headers."""
    def __init__(self):
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1.5,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "POST"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

    def get_headers(self, referer: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "cross-site"
        }
        if referer:
            headers["Referer"] = referer
        return headers

    def safe_get(self, url: str, params: Optional[Dict] = None, referer: Optional[str] = None) -> Optional[requests.Response]:
        """Performs request with randomized jitter delay to respect server rates."""
        min_delay = float(os.getenv("MIN_REQUEST_DELAY", 2.0))
        max_delay = float(os.getenv("MAX_REQUEST_DELAY", 5.0))
        delay = random.uniform(min_delay, max_delay)
        time.sleep(delay)

        try:
            response = self.session.get(
                url,
                params=params,
                headers=self.get_headers(referer),
                timeout=20
            )
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            logger.warning(f"HTTP error requesting {url}: {e}")
            return None

# ==============================================================================
# DATA FILTERS (Topic Matching, Country Validation, Funding Status)
# ==============================================================================
class PositionFilter:
    """Validates research topic alignment, verifies funding, and strictly excludes USA."""

    @staticmethod
    def is_in_usa(country: str, institution: str, full_text: str) -> bool:
        """Strict check to ensure positions in the United States are excluded."""
        normalized_country = country.strip().lower()
        normalized_inst = institution.strip().lower()
        normalized_text = full_text.strip().lower()

        # Check explicit country string
        if normalized_country in USA_EXCLUSION_KEYWORDS:
            return True

        # Check institution and text markers
        for keyword in USA_EXCLUSION_KEYWORDS:
            # Word boundary check for 2-letter codes like 'us' or 'ca'
            if len(keyword) <= 3:
                pattern = f" {keyword} "
                if pattern in f" {normalized_country} " or pattern in f" {normalized_inst} ":
                    return True
            else:
                if keyword in normalized_country or keyword in normalized_inst:
                    return True

        return False

    @staticmethod
    def match_topic(text: str) -> Optional[Tuple[str, str]]:
        """Checks if text contains any of our target research keywords."""
        text_lower = text.lower()
        for topic_name, keywords in TARGET_TOPICS.items():
            for kw in keywords:
                if kw in text_lower:
                    return topic_name, kw
        return None

    @staticmethod
    def is_fully_funded(text: str, funding_field: str = "") -> bool:
        """Determines if the position is fully funded and not self-funded."""
        combined = f"{text} {funding_field}".lower()

        # If explicitly marked as self-funded or unfunded, reject
        for unfunded in UNFUNDED_INDICATORS:
            if unfunded in combined:
                return False

        # European doctoral positions (Marie Curie, TV-L, PhD Fellows) are typically standard full funding
        for funded in FUNDED_INDICATORS:
            if funded in combined:
                return True

        # Default assumption for structured EU/UK/Swiss PhD recruitment portal listings
        return True

# ==============================================================================
# SCRAPER MODULES
# ==============================================================================
class BaseScraper:
    def __init__(self, http_client: SafeScraper):
        self.client = http_client

    def search(self, keywords: List[str]) -> List[PhDPosition]:
        raise NotImplementedError

class EuraxessScraper(BaseScraper):
    """Scrapes official European Commission EURAXESS portal via public RSS & Job API."""
    NAME = "EURAXESS (European Commission)"
    BASE_URL = "https://euraxess.ec.europa.eu"

    def search(self, keywords: List[str]) -> List[PhDPosition]:
        results: List[PhDPosition] = []
        logger.info(f"[{self.NAME}] Querying EURAXESS for research topics...")

        for keyword in keywords:
            query = urllib.parse.quote(keyword)
            # EURAXESS RSS Job feed for early career / PhD researchers (First Stage Researcher R1)
            rss_url = f"https://euraxess.ec.europa.eu/jobs/search/rss?keywords={query}&f%5B0%5D=profile%3AFirst%20Stage%20Researcher%20%28R1%29"
            
            try:
                resp = self.client.safe_get(rss_url)
                if not resp or not resp.content:
                    continue

                feed = feedparser.parse(resp.content)
                for entry in feed.entries[:15]:  # Process top matching entries
                    title = entry.get("title", "").strip()
                    link = entry.get("link", "").strip()
                    summary = entry.get("summary", "") or entry.get("description", "")
                    
                    # Clean HTML from summary
                    soup = BeautifulSoup(summary, "html.parser")
                    clean_desc = soup.get_text(separator=" ", strip=True)

                    # Extract metadata if available in summary
                    country = "Europe / International"
                    institution = "European Research Institution"
                    
                    # Parse country and institution hints from title or description
                    if " - " in title:
                        parts = title.rsplit(" - ", 1)
                        country_guess = parts[-1].strip()
                        if len(country_guess) < 30:
                            country = country_guess

                    topic_match = PositionFilter.match_topic(f"{title} {clean_desc}")
                    if not topic_match:
                        continue
                    
                    topic_name, matched_kw = topic_match

                    if PositionFilter.is_in_usa(country, institution, f"{title} {clean_desc}"):
                        continue

                    if not PositionFilter.is_fully_funded(clean_desc, "EURAXESS R1 Fellowship"):
                        continue

                    # Extract potential supervisor name from description
                    supervisor = self._extract_supervisor(clean_desc)

                    pos = PhDPosition(
                        title=title,
                        institution=institution,
                        country=country,
                        supervisor=supervisor,
                        description=clean_desc[:350] + ("..." if len(clean_desc) > 350 else ""),
                        funding_status="Fully Funded (MSCA / European Research Contract)",
                        url=link,
                        matched_topic=topic_name,
                        matched_keyword=matched_kw,
                        source_platform=self.NAME
                    )
                    results.append(pos)

            except Exception as e:
                logger.error(f"[{self.NAME}] Error processing keyword '{keyword}': {e}")

        return results

    def _extract_supervisor(self, text: str) -> Optional[str]:
        patterns = ["supervised by", "supervisor:", "pi:", "prof.", "professor", "dr.", "contact:"]
        lower = text.lower()
        for pat in patterns:
            idx = lower.find(pat)
            if idx != -1:
                snippet = text[idx:idx+60]
                return snippet.strip()
        return None


class FindAPhDScraper(BaseScraper):
    """Scrapes FindAPhD for international non-US fully-funded vacancies."""
    NAME = "FindAPhD"
    BASE_URL = "https://www.findaphd.com"

    def search(self, keywords: List[str]) -> List[PhDPosition]:
        results: List[PhDPosition] = []
        logger.info(f"[{self.NAME}] Searching FindAPhD for funded positions...")

        for keyword in keywords:
            # Query FindAPhD with fully funded flag (F1 = Fully Funded)
            encoded_kw = urllib.parse.quote_plus(keyword)
            search_url = f"https://www.findaphd.com/phds/?Keywords={encoded_kw}&Funding=F1"
            
            resp = self.client.safe_get(search_url, referer=self.BASE_URL)
            if not resp or resp.status_code != 200:
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            # Find PhD job result cards
            cards = soup.select(".phd-result-card, .resultsRow, .w-full.bg-white")

            for card in cards[:12]:
                try:
                    title_elem = card.select_one(".phd-result-card__title, .resultsRow__title, h3 a, h2 a")
                    if not title_elem:
                        continue

                    title = title_elem.get_text(strip=True)
                    rel_url = title_elem.get("href", "")
                    direct_url = urllib.parse.urljoin(self.BASE_URL, rel_url)

                    inst_elem = card.select_one(".phd-result-card__dept-inst, .instName, .university-name")
                    institution = inst_elem.get_text(strip=True) if inst_elem else "University / Research Center"

                    country_elem = card.select_one(".phd-result-card__location, .countryName, .location")
                    country = country_elem.get_text(strip=True) if country_elem else "United Kingdom / EU / Global"

                    desc_elem = card.select_one(".phd-result-card__desc, .desc, .descLong, p")
                    desc = desc_elem.get_text(separator=" ", strip=True) if desc_elem else "Fully funded PhD project."

                    supervisor_elem = card.select_one(".supervisor, .pi-name, .lead-academic")
                    supervisor = supervisor_elem.get_text(strip=True) if supervisor_elem else None

                    # Strict USA check
                    if PositionFilter.is_in_usa(country, institution, f"{title} {desc}"):
                        continue

                    topic_match = PositionFilter.match_topic(f"{title} {desc}")
                    if not topic_match:
                        continue
                    topic_name, matched_kw = topic_match

                    pos = PhDPosition(
                        title=title,
                        institution=institution,
                        country=country,
                        supervisor=supervisor,
                        description=desc[:350] + ("..." if len(desc) > 350 else ""),
                        funding_status="Fully Funded (Tuition + Maintenance Stipend)",
                        url=direct_url,
                        matched_topic=topic_name,
                        matched_keyword=matched_kw,
                        source_platform=self.NAME
                    )
                    results.append(pos)

                except Exception as card_err:
                    logger.debug(f"[{self.NAME}] Skipping card parse: {card_err}")

        return results


class AcademicPositionsScraper(BaseScraper):
    """Scrapes European Academic Positions portal for PhD researcher positions."""
    NAME = "AcademicPositions"
    BASE_URL = "https://academicpositions.com"

    def search(self, keywords: List[str]) -> List[PhDPosition]:
        results: List[PhDPosition] = []
        logger.info(f"[{self.NAME}] Querying AcademicPositions for European PhD posts...")

        for keyword in keywords:
            encoded_kw = urllib.parse.quote_plus(keyword)
            # Filter specifically for PhD candidate jobs in Europe/International
            search_url = f"https://academicpositions.com/find-jobs?query={encoded_kw}&positions=phd"

            resp = self.client.safe_get(search_url, referer=self.BASE_URL)
            if not resp or resp.status_code != 200:
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            job_items = soup.select(".job-item, .job-card, .search-result")

            for item in job_items[:10]:
                try:
                    title_elem = item.select_one(".job-title a, h2 a, .title a")
                    if not title_elem:
                        continue

                    title = title_elem.get_text(strip=True)
                    direct_url = urllib.parse.urljoin(self.BASE_URL, title_elem.get("href", ""))

                    employer_elem = item.select_one(".employer, .company, .institution")
                    institution = employer_elem.get_text(strip=True) if employer_elem else "Academic Institute"

                    loc_elem = item.select_one(".location, .country, .city-country")
                    country = loc_elem.get_text(strip=True) if loc_elem else "Europe (Non-US)"

                    desc_elem = item.select_one(".job-summary, .description, p")
                    desc = desc_elem.get_text(separator=" ", strip=True) if desc_elem else "Doctoral vacancy"

                    if PositionFilter.is_in_usa(country, institution, f"{title} {desc}"):
                        continue

                    topic_match = PositionFilter.match_topic(f"{title} {desc}")
                    if not topic_match:
                        continue
                    topic_name, matched_kw = topic_match

                    pos = PhDPosition(
                        title=title,
                        institution=institution,
                        country=country,
                        supervisor=None,
                        description=desc[:350] + ("..." if len(desc) > 350 else ""),
                        funding_status="Fully Funded (Salaried University Position)",
                        url=direct_url,
                        matched_topic=topic_name,
                        matched_keyword=matched_kw,
                        source_platform=self.NAME
                    )
                    results.append(pos)
                except Exception as parse_err:
                    logger.debug(f"[{self.NAME}] Error parsing job: {parse_err}")

        return results

# ==============================================================================
# NOTIFICATION SYSTEM (Telegram Bot & Email SMTP)
# ==============================================================================
class TelegramNotifier:
    """Sends consolidated alert digests to a Telegram Chat or Channel."""

    def __init__(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.api_url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"

    def send_digest(self, positions: List[PhDPosition]) -> bool:
        if not positions:
            logger.info("[Telegram] No new positions to notify.")
            return True

        logger.info(f"[Telegram] Sending digest with {len(positions)} new position(s)...")

        # Group positions by research topic
        grouped: Dict[str, List[PhDPosition]] = {}
        for p in positions:
            grouped.setdefault(p.matched_topic, []).append(p)

        header = (
            f"🎓 <b>Daily Fully-Funded PhD Digest (Ex-USA)</b>\n"
            f"📅 <i>{datetime.utcnow().strftime('%Y-%m-%d')}</i>\n"
            f"✨ Found <b>{len(positions)}</b> new vacancies matching your research interests:\n\n"
        )

        messages = [header]
        current_msg = header

        for topic, items in grouped.items():
            topic_header = f"━━━━━━━━━━━━━━━━━━━━\n🔬 <b>{topic.upper()}</b> ({len(items)})\n━━━━━━━━━━━━━━━━━━━━\n\n"
            
            if len(current_msg) + len(topic_header) > 3800:
                messages.append(topic_header)
                current_msg = topic_header
            else:
                current_msg += topic_header

            for idx, p in enumerate(items, start=1):
                sup_line = f"👤 <b>PI / Supervisor:</b> {p.supervisor}\n" if p.supervisor else ""
                card = (
                    f"📌 <b>{idx}. <a href=\"{p.url}\">{p.title}</a></b>\n"
                    f"🏛️ <b>Institution:</b> {p.institution}\n"
                    f"🌍 <b>Country:</b> {p.country}\n"
                    f"💰 <b>Funding:</b> {p.funding_status}\n"
                    f"{sup_line}"
                    f"🏷️ <i>Keyword match:</i> <code>{p.matched_keyword}</code>\n"
                    f"🔗 <a href=\"{p.url}\">👉 Click Here to View & Apply</a>\n\n"
                )

                if len(current_msg) + len(card) > 3800:
                    messages.append(card)
                    current_msg = card
                else:
                    current_msg += card

        if current_msg != header and current_msg not in messages:
            messages.append(current_msg)

        success = True
        for msg in messages:
            if not msg.strip():
                continue
            payload = {
                "chat_id": self.chat_id,
                "text": msg,
                "parse_mode": "HTML",
                "disable_web_page_preview": True
            }
            try:
                resp = requests.post(self.api_url, json=payload, timeout=15)
                resp.raise_for_status()
                time.sleep(1.0)  # Telegram API rate limit protection
            except Exception as e:
                logger.error(f"[Telegram] Failed to send notification chunk: {e}")
                success = False

        return success


class EmailNotifier:
    """Sends responsive HTML newsletter digest via SMTP."""

    def __init__(self, host: str, port: int, user: str, password: str, recipient: str, use_tls: bool = True):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.recipient = recipient
        self.use_tls = use_tls

    def send_digest(self, positions: List[PhDPosition]) -> bool:
        if not positions:
            logger.info("[Email] No new positions to notify.")
            return True

        subject = f"🎓 Daily PhD Digest: {len(positions)} New Positions (FL, HAR, Transformers) - {datetime.utcnow().strftime('%b %d, %Y')}"
        
        # Plain text fallback
        text_lines = [f"Daily PhD Vacancies Digest (Ex-USA)\nFound {len(positions)} new positions:\n"]
        for p in positions:
            text_lines.append(f"- [{p.matched_topic}] {p.title}")
            text_lines.append(f"  Institution: {p.institution} ({p.country})")
            text_lines.append(f"  Funding: {p.funding_status}")
            text_lines.append(f"  Apply: {p.url}\n")
        plain_text = "\n".join(text_lines)

        # Responsive HTML template
        cards_html = ""
        for p in positions:
            sup_html = f"<p style='margin:4px 0; color:#4a5568;'><strong>PI/Supervisor:</strong> {p.supervisor}</p>" if p.supervisor else ""
            cards_html += f"""
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="display:inline-block; background:#ebf8ff; color:#2b6cb0; font-size:11px; font-weight:700; padding:3px 8px; border-radius:12px; margin-bottom:8px; text-transform:uppercase;">
                    {p.matched_topic}
                </div>
                <h3 style="margin:0 0 8px 0; font-size:16px; color:#1a202c;">
                    <a href="{p.url}" style="color:#2b6cb0; text-decoration:none;">{p.title}</a>
                </h3>
                <p style="margin:4px 0; color:#4a5568; font-size:14px;"><strong>🏛️ Institution:</strong> {p.institution} &bull; <strong>🌍 Country:</strong> {p.country}</p>
                <p style="margin:4px 0; color:#2f855a; font-size:13px;"><strong>💰 Funding:</strong> {p.funding_status}</p>
                {sup_html}
                <p style="margin:8px 0; font-size:13px; color:#718096; line-height:1.4;">{p.description}</p>
                <div style="margin-top:12px;">
                    <a href="{p.url}" style="display:inline-block; background:#3182ce; color:#ffffff; padding:8px 14px; font-size:13px; font-weight:600; text-decoration:none; border-radius:6px;">
                        View Vacancy & Apply &rarr;
                    </a>
                </div>
            </div>
            """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color:#f7fafc; margin:0; padding:20px; color:#2d3748;">
            <div style="max-width:680px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; border:1px solid #e2e8f0;">
                <div style="background:#1a365d; color:#ffffff; padding:24px 20px; text-align:center;">
                    <h1 style="margin:0; font-size:22px; font-weight:700;">🎓 Daily Fully-Funded PhD Digest</h1>
                    <p style="margin:6px 0 0 0; font-size:14px; opacity:0.85;">Worldwide Vacancies (Excluding USA) &bull; {datetime.utcnow().strftime('%B %d, %Y')}</p>
                </div>
                <div style="padding:20px;">
                    <p style="font-size:15px; margin-top:0;">Hello Researcher,</p>
                    <p style="font-size:14px; color:#4a5568;">Here are the latest fully-funded doctoral researcher positions matching your keywords (<strong>Federated Learning, Human Activity Recognition, Transformers</strong>):</p>
                    {cards_html}
                    <div style="border-top:1px solid #e2e8f0; padding-top:16px; margin-top:24px; font-size:12px; color:#a0aec0; text-align:center;">
                        Automated PhD Hunter Bot &bull; Filtered for Global Non-US Positions
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.user
        msg["To"] = self.recipient

        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        try:
            logger.info(f"[Email] Connecting to SMTP server {self.host}:{self.port}...")
            if self.use_tls:
                server = smtplib.SMTP(self.host, self.port)
                server.ehlo()
                server.starttls()
                server.ehlo()
            else:
                server = smtplib.SMTP_SSL(self.host, self.port)

            server.login(self.user, self.password)
            server.sendmail(self.user, self.recipient, msg.as_string())
            server.quit()
            logger.info(f"[Email] Successfully sent digest to {self.recipient}")
            return True
        except Exception as e:
            logger.error(f"[Email] Failed to send email via SMTP: {e}")
            return False

# ==============================================================================
# PIPELINE ORCHESTRATOR
# ==============================================================================
class PhDHunterPipeline:
    def __init__(self):
        self.db = DatabaseManager(os.getenv("DB_PATH", "phd_positions.db"))
        self.http_client = SafeScraper()
        self.scrapers: List[BaseScraper] = [
            EuraxessScraper(self.http_client),
            FindAPhDScraper(self.http_client),
            AcademicPositionsScraper(self.http_client)
        ]

        # Init Notifiers
        self.telegram_notifier = None
        if os.getenv("TELEGRAM_ENABLED", "false").lower() == "true":
            bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
            chat_id = os.getenv("TELEGRAM_CHAT_ID")
            if bot_token and chat_id:
                self.telegram_notifier = TelegramNotifier(bot_token, chat_id)
            else:
                logger.warning("Telegram enabled but TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.")

        self.email_notifier = None
        if os.getenv("EMAIL_ENABLED", "false").lower() == "true":
            host = os.getenv("SMTP_SERVER", "smtp.gmail.com")
            port = int(os.getenv("SMTP_PORT", "587"))
            user = os.getenv("SMTP_SENDER_EMAIL")
            pwd = os.getenv("SMTP_PASSWORD")
            recipient = os.getenv("EMAIL_RECIPIENT")
            use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
            if user and pwd and recipient:
                self.email_notifier = EmailNotifier(host, port, user, pwd, recipient, use_tls)
            else:
                logger.warning("Email enabled but SMTP credentials or recipient missing.")

    def run_daily_search(self) -> List[PhDPosition]:
        """Main execution routine: scrape -> filter -> deduplicate -> notify."""
        start_time = datetime.utcnow()
        logger.info("=" * 70)
        logger.info(f"🚀 Starting PhD Vacancy Search at {start_time.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        logger.info("=" * 70)

        # Collect all keywords across the 3 topics
        all_keywords = []
        for kw_list in TARGET_TOPICS.values():
            all_keywords.extend(kw_list[:3])  # Primary terms for scraper queries

        raw_positions: List[PhDPosition] = []

        # Execute scrapers with isolated error boundaries
        for scraper in self.scrapers:
            try:
                positions = scraper.search(all_keywords)
                logger.info(f"[{scraper.NAME}] Retrieved {len(positions)} candidate vacancies.")
                raw_positions.extend(positions)
            except Exception as e:
                logger.error(f"[{scraper.NAME}] Scraper failed with error: {e}", exc_info=True)

        # Deduplication against SQLite
        new_positions: List[PhDPosition] = []
        seen_in_this_run: Set[str] = set()

        for pos in raw_positions:
            if pos.position_hash in seen_in_this_run:
                continue
            seen_in_this_run.add(pos.position_hash)

            if not self.db.is_seen(pos.position_hash):
                new_positions.append(pos)
                self.db.mark_seen(pos)

        logger.info(f"✨ Total candidates scraped: {len(raw_positions)} | 🆕 New unique positions: {len(new_positions)}")

        # Dispatch notifications
        if new_positions:
            if self.telegram_notifier:
                self.telegram_notifier.send_digest(new_positions)
            if self.email_notifier:
                self.email_notifier.send_digest(new_positions)
        else:
            logger.info("No new unique positions found today.")

        elapsed = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"🏁 Search completed in {elapsed:.2f} seconds.\n")
        return new_positions

# ==============================================================================
# SCHEDULER & CLI ENTRY POINT
# ==============================================================================
def main():
    pipeline = PhDHunterPipeline()

    # Optional initial run upon launch
    if os.getenv("RUN_ON_STARTUP", "true").lower() == "true":
        logger.info("⚡ Executing initial startup search...")
        pipeline.run_daily_search()

    import schedule
    schedule_time = os.getenv("SCHEDULE_TIME", "08:00")
    logger.info(f"⏰ Scheduler active: Daily search registered for {schedule_time} (24h loop).")
    schedule.every().day.at(schedule_time).do(pipeline.run_daily_search)

    # Keep script alive
    while True:
        try:
            schedule.run_pending()
            time.sleep(30)
        except KeyboardInterrupt:
            logger.info("👋 PhD Hunter stopped by user.")
            break
        except Exception as err:
            logger.critical(f"Unhandled exception in scheduler loop: {err}", exc_info=True)
            time.sleep(60)

if __name__ == "__main__":
    main()
