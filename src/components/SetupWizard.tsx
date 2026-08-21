import React, { useState } from "react";
import { 
  BookOpen, 
  Send, 
  Mail, 
  Container, 
  Clock, 
  Terminal, 
  Copy, 
  Check, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export const SetupWizard: React.FC = () => {
  const [activeGuide, setActiveGuide] = useState<"telegram" | "email" | "local" | "docker" | "github" | "cron">("telegram");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCommand = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <span>Interactive Setup, API Keys & Continuous Deployment Guide</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Detailed walkthroughs with copyable shell commands for Telegram BotFather, Gmail App Passwords, Docker Compose, Linux systemd/cron, and 100% free serverless GitHub Actions.
          </p>
        </div>
      </div>

      {/* Guide Selector Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setActiveGuide("telegram")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeGuide === "telegram"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Send className="w-4 h-4 text-sky-300" />
          <span>1. Telegram Bot (Recommended)</span>
        </button>

        <button
          onClick={() => setActiveGuide("github")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeGuide === "github"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>2. Free GitHub Actions Cron</span>
        </button>

        <button
          onClick={() => setActiveGuide("local")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeGuide === "local"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Terminal className="w-4 h-4 text-blue-300" />
          <span>3. Run Locally (Python venv)</span>
        </button>

        <button
          onClick={() => setActiveGuide("docker")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeGuide === "docker"
              ? "bg-teal-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Container className="w-4 h-4 text-teal-300" />
          <span>4. Docker & Compose</span>
        </button>

        <button
          onClick={() => setActiveGuide("email")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeGuide === "email"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Mail className="w-4 h-4 text-emerald-300" />
          <span>5. Gmail SMTP Email</span>
        </button>

        <button
          onClick={() => setActiveGuide("cron")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeGuide === "cron"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Clock className="w-4 h-4 text-amber-300" />
          <span>6. Linux Cron Daemon</span>
        </button>
      </div>

      {/* Guide Content Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        
        {/* TELEGRAM GUIDE */}
        {activeGuide === "telegram" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">How to Set Up Telegram Bot Notifications</h3>
            </div>

            <ol className="space-y-4 text-xs text-slate-300 leading-relaxed list-decimal list-inside">
              <li className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <strong>Create your Bot via @BotFather:</strong>
                <p className="text-slate-400 mt-1">
                  Open Telegram, search for <code>@BotFather</code>, and send <code>/newbot</code>. Follow the prompts to name your bot (e.g., <em>"My PhD Vacancies Hunter"</em>).
                </p>
                <p className="text-sky-300 mt-1 font-mono text-[11px]">
                  BotFather will reply with an API Token: e.g. <code>123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ</code>
                </p>
              </li>

              <li className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <strong>Start a Chat with Your Bot:</strong>
                <p className="text-slate-400 mt-1">
                  Click the link given by BotFather (<code>t.me/YourBotUsername</code>) and press <strong>/start</strong>. This authorizes the bot to message you.
                </p>
              </li>

              <li className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <strong>Obtain Your Numerical Chat ID:</strong>
                <p className="text-slate-400 mt-1">
                  Search for <code>@userinfobot</code> or <code>@GetMyIDBot</code> on Telegram and press /start. It will return your ID (e.g., <code>987654321</code>).
                </p>
              </li>

              <li className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <strong>Add Credentials to .env:</strong>
                <div className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-emerald-400 mt-2 relative">
                  <div>TELEGRAM_ENABLED=true</div>
                  <div>TELEGRAM_BOT_TOKEN="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"</div>
                  <div>TELEGRAM_CHAT_ID="987654321"</div>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* GITHUB ACTIONS GUIDE */}
        {activeGuide === "github" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">100% Free Serverless Scheduling via GitHub Actions</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              You do <strong>not</strong> need a paid server or continuous laptop running. GitHub provides free Actions runner minutes that will wake up every morning, run the Python scraper, and send your Telegram/Email alerts automatically!
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <strong>Step 1: Push the repository to GitHub</strong>
                <p className="text-slate-400 mt-1">
                  Make the repository private so your settings and secrets remain secure.
                </p>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <strong>Step 2: Add Secrets to GitHub</strong>
                <p className="text-slate-400 mt-1">
                  Go to <strong>Settings</strong> &rarr; <strong>Secrets and variables</strong> &rarr; <strong>Actions</strong> &rarr; <strong>New repository secret</strong>.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                  <div className="bg-slate-950 p-2 rounded text-indigo-300">TELEGRAM_BOT_TOKEN</div>
                  <div className="bg-slate-950 p-2 rounded text-indigo-300">TELEGRAM_CHAT_ID</div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <strong>Step 3: Automated Daily Trigger</strong>
                <p className="text-slate-400 mt-1">
                  The included file <code>.github/workflows/daily_phd_search.yml</code> runs every day at 07:00 UTC and caches previously seen positions in GitHub Actions Cache!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LOCAL RUN GUIDE */}
        {activeGuide === "local" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Running Locally on macOS / Linux / Windows</h3>
            </div>

            <div className="space-y-3">
              {[
                { title: "1. Create Virtual Environment", cmd: "python3 -m venv venv\nsource venv/bin/activate" },
                { title: "2. Install Dependencies", cmd: "pip install -r requirements.txt" },
                { title: "3. Copy & Configure .env", cmd: "cp .env.example .env\n# Edit .env with your Telegram bot credentials" },
                { title: "4. Launch Hunter Script", cmd: "python phd_hunter.py" }
              ].map((step, idx) => (
                <div key={idx} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <div className="text-xs font-bold text-slate-200">{step.title}</div>
                  <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-emerald-400 mt-2 flex items-center justify-between">
                    <pre className="whitespace-pre">{step.cmd}</pre>
                    <button
                      onClick={() => copyCommand(step.cmd, idx)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy command"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCKER GUIDE */}
        {activeGuide === "docker" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Container className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Running with Docker & Docker Compose</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Docker keeps the Python daemon running in the background with auto-restart on system boot. The SQLite database is safely mounted to <code>./data</code> so position history is never lost.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="text-xs font-bold text-slate-200">Start in Detached Mode (Background)</div>
                <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-emerald-400 mt-2 flex items-center justify-between">
                  <code>docker compose up -d</code>
                  <button onClick={() => copyCommand("docker compose up -d", 10)} className="text-slate-400 hover:text-white">
                    {copiedIndex === 10 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="text-xs font-bold text-slate-200">Stream Live Crawler Logs</div>
                <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-emerald-400 mt-2 flex items-center justify-between">
                  <code>docker compose logs -f</code>
                  <button onClick={() => copyCommand("docker compose logs -f", 11)} className="text-slate-400 hover:text-white">
                    {copiedIndex === 11 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMAIL GUIDE */}
        {activeGuide === "email" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Gmail SMTP App Password Configuration</h3>
            </div>

            <ol className="space-y-3 text-xs text-slate-300 leading-relaxed list-decimal list-inside">
              <li className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                Go to your Google Account security settings and enable <strong>2-Step Verification</strong>.
              </li>
              <li className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                Visit <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-blue-400 underline">myaccount.google.com/apppasswords</a> and create an App Password named "PhD Hunter".
              </li>
              <li className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                Google will generate a 16-letter password (e.g. <code>abcd efgh ijkl mnop</code>). Use this as your <code>SMTP_PASSWORD</code> in <code>.env</code>.
              </li>
            </ol>
          </div>
        )}

        {/* CRON GUIDE */}
        {activeGuide === "cron" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Linux Crontab Setup</h3>
            </div>

            <p className="text-xs text-slate-400">
              Run <code>crontab -e</code> on your Linux server or Raspberry Pi and add the following entry to trigger daily at 08:00 AM:
            </p>

            <div className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-amber-400 flex items-center justify-between overflow-x-auto">
              <code>0 8 * * * cd /home/user/phd_hunter && /home/user/phd_hunter/venv/bin/python phd_hunter.py &gt;&gt; /home/user/phd_hunter/cron.log 2&gt;&amp;1</code>
              <button onClick={() => copyCommand("0 8 * * * cd /home/user/phd_hunter && /home/user/phd_hunter/venv/bin/python phd_hunter.py >> /home/user/phd_hunter/cron.log 2>&1", 20)} className="text-slate-400 hover:text-white shrink-0 ml-2">
                {copiedIndex === 20 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
