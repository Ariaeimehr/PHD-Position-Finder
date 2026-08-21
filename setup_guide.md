# 🎓 PhD Position Hunter: Complete Setup & Deployment Guide

Automated daily search for fully-funded PhD positions worldwide (**strictly excluding the United States**) in:
1. **Federated Learning**
2. **Human Activity Recognition (HAR)**
3. **Transformer Models & Deep Learning**

---

## ⚡ Quick Start (Local Machine)

### 1. Prerequisites
Ensure you have Python 3.9+ installed:
```bash
python3 --version
```

### 2. Install Dependencies
```bash
# Clone or navigate to the directory
cd phd_hunter

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your preferred notification settings (see below).

### 4. Run the Script
```bash
python phd_hunter.py
```

---

## 🤖 1. Setting up Telegram Bot Notifications

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the prompts to choose a name and username for your bot.
3. BotFather will provide an **API Token** (e.g., `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`). Copy this into `.env` as `TELEGRAM_BOT_TOKEN`.
4. Start a chat with your new bot by clicking its link and sending `/start`.
5. To get your personal **Chat ID**:
   - Message `@userinfobot` or `@GetMyIDBot` on Telegram.
   - It will reply with your numerical ID (e.g., `987654321`).
   - Copy this into `.env` as `TELEGRAM_CHAT_ID`.
6. Set `TELEGRAM_ENABLED=true` in your `.env`.

---

## 📧 2. Setting up Email Notifications (Gmail SMTP)

1. Enable 2-Step Verification on your Google Account: [myaccount.google.com/security](https://myaccount.google.com/security)
2. Generate an **App Password**:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
   - Enter an app name (e.g., "PhD Hunter Bot").
   - Google will generate a 16-character password (e.g., `abcd efgh ijkl mnop`).
3. Fill in `.env`:
   ```env
   EMAIL_ENABLED=true
   SMTP_SERVER="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USE_TLS=true
   SMTP_SENDER_EMAIL="your_gmail@gmail.com"
   SMTP_PASSWORD="your_16_character_app_password"
   EMAIL_RECIPIENT="where_to_receive@example.com"
   ```

---

## 🐳 3. Running with Docker / Docker Compose

### Using Docker Compose (Recommended):
```bash
# Start in background
docker compose up -d

# View real-time logs
docker compose logs -f

# Stop
docker compose down
```

The `./data` volume automatically stores your SQLite database (`phd_positions.db`) so positions are never sent twice even after container restarts!

---

## ☁️ 4. 100% Free Serverless Scheduling via GitHub Actions

You don't need a running server. GitHub Actions can run this scraper every morning for free:

1. Push this folder to a private GitHub repository.
2. Go to repository **Settings** &rarr; **Secrets and variables** &rarr; **Actions** &rarr; **New repository secret**.
3. Add your secrets:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `TELEGRAM_ENABLED` (`true`)
   - `EMAIL_ENABLED` / `SMTP_*` (optional)
4. The workflow in `.github/workflows/daily_phd_search.yml` will automatically trigger every day at 07:00 UTC and cache previously seen positions.

---

## 🐧 5. Linux Cron Job Setup (Alternative)

If you prefer standard Linux cron on an existing VPS or Raspberry Pi:
```bash
crontab -e
```
Add the following line to run at 8:00 AM daily:
```cron
0 8 * * * cd /home/user/phd_hunter && /home/user/phd_hunter/venv/bin/python -c "from phd_hunter import PhDHunterPipeline; PhDHunterPipeline().run_daily_search()" >> /home/user/phd_hunter/cron.log 2>&1
```
