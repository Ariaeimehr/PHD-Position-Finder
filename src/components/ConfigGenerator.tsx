import React, { useState } from "react";
import { ScraperConfig } from "../types";
import { 
  Settings, 
  Send, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  KeyRound, 
  Sliders,
  Sparkles,
  Bot
} from "lucide-react";

export const ConfigGenerator: React.FC = () => {
  const [config, setConfig] = useState<ScraperConfig>({
    telegramEnabled: true,
    telegramBotToken: "7123456789:AAFl78g9JkLmnOPQRstUvwXYZ_123456",
    telegramChatId: "987654321",
    emailEnabled: false,
    smtpServer: "smtp.gmail.com",
    smtpPort: 587,
    smtpSenderEmail: "researcher@gmail.com",
    smtpPassword: "abcd efgh ijkl mnop",
    emailRecipient: "traoquach31@gmail.com",
    scheduleTime: "08:00",
    minDelay: 2.5,
    maxDelay: 6.0,
    runOnStartup: true
  });

  const [copied, setCopied] = useState<boolean>(false);

  const generateEnvContent = () => {
    return `# ==============================================================================
# PhD Position Hunter - Custom Generated Configuration
# ==============================================================================

# --- TELEGRAM ALERTS ---
TELEGRAM_ENABLED=${config.telegramEnabled ? "true" : "false"}
TELEGRAM_BOT_TOKEN="${config.telegramBotToken}"
TELEGRAM_CHAT_ID="${config.telegramChatId}"

# --- EMAIL NOTIFICATIONS (SMTP) ---
EMAIL_ENABLED=${config.emailEnabled ? "true" : "false"}
SMTP_SERVER="${config.smtpServer}"
SMTP_PORT=${config.smtpPort}
SMTP_USE_TLS=true
SMTP_SENDER_EMAIL="${config.smtpSenderEmail}"
SMTP_PASSWORD="${config.smtpPassword}"
EMAIL_RECIPIENT="${config.emailRecipient}"

# --- SCHEDULER & CRAWLER SETTINGS ---
SCHEDULE_TIME="${config.scheduleTime}"
RUN_ON_STARTUP=${config.runOnStartup ? "true" : "false"}
MIN_REQUEST_DELAY=${config.minDelay}
MAX_REQUEST_DELAY=${config.maxDelay}
DB_PATH="phd_positions.db"
`;
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(generateEnvContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadEnv = () => {
    const blob = new Blob([generateEnvContent()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = ".env";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>Interactive Environment (.env) & Scheduler Configurator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure your Telegram bot tokens, Gmail SMTP app passwords, crawl jitter delay boundaries, and daily 24h schedule triggers. Download ready-to-run <code>.env</code> files instantly.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCopyEnv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-all shadow-sm active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Copied .env Content!" : "Copy .env"}</span>
          </button>

          <button
            onClick={handleDownloadEnv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-sm active:scale-95 shadow-blue-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .env File</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Configuration Controls (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Telegram Settings Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Telegram Bot Notifications</h3>
                  <p className="text-[11px] text-slate-400">Instant HTML message alerts with direct application links</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.telegramEnabled}
                  onChange={(e) => setConfig({ ...config, telegramEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {config.telegramEnabled && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Telegram Bot Token (from @BotFather)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={config.telegramBotToken}
                      onChange={(e) => setConfig({ ...config, telegramBotToken: e.target.value })}
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Telegram Chat ID (from @userinfobot)
                  </label>
                  <div className="relative">
                    <Bot className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={config.telegramChatId}
                      onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
                      placeholder="987654321 or @your_channel"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Email Settings Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Email Digest Notifications (SMTP)</h3>
                  <p className="text-[11px] text-slate-400">Formatted daily newsletter sent to your personal inbox</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.emailEnabled}
                  onChange={(e) => setConfig({ ...config, emailEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {config.emailEnabled && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">SMTP Server</label>
                    <input
                      type="text"
                      value={config.smtpServer}
                      onChange={(e) => setConfig({ ...config, smtpServer: e.target.value })}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">SMTP Port</label>
                    <input
                      type="number"
                      value={config.smtpPort}
                      onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) || 587 })}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Sender Email</label>
                    <input
                      type="email"
                      value={config.smtpSenderEmail}
                      onChange={(e) => setConfig({ ...config, smtpSenderEmail: e.target.value })}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">App Password</label>
                    <input
                      type="password"
                      value={config.smtpPassword}
                      onChange={(e) => setConfig({ ...config, smtpPassword: e.target.value })}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={config.emailRecipient}
                    onChange={(e) => setConfig({ ...config, emailRecipient: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Timing & Crawling Parameters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Daily Schedule & Anti-Rate-Limiting</h3>
                <p className="text-[11px] text-slate-400">Randomized jitter delays and 24h cron execution time</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Daily Trigger (UTC)</label>
                <input
                  type="text"
                  value={config.scheduleTime}
                  onChange={(e) => setConfig({ ...config, scheduleTime: e.target.value })}
                  placeholder="08:00"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Min Delay (sec)</label>
                <input
                  type="number"
                  step="0.5"
                  value={config.minDelay}
                  onChange={(e) => setConfig({ ...config, minDelay: parseFloat(e.target.value) || 2.0 })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Max Delay (sec)</label>
                <input
                  type="number"
                  step="0.5"
                  value={config.maxDelay}
                  onChange={(e) => setConfig({ ...config, maxDelay: parseFloat(e.target.value) || 5.0 })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 text-xs text-slate-300">
              <input
                type="checkbox"
                id="startup_run"
                checked={config.runOnStartup}
                onChange={(e) => setConfig({ ...config, runOnStartup: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="startup_run" className="cursor-pointer">
                Run immediate search on startup before waiting for daily schedule
              </label>
            </div>
          </div>

        </div>

        {/* Live Generated .env Preview (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Live Generated .env Preview
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex flex-col">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300 font-semibold">.env</span>
              <button
                onClick={handleCopyEnv}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="p-4 overflow-x-auto text-xs font-mono text-emerald-400/90 leading-relaxed max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre">{generateEnvContent()}</pre>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5 text-white font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Safe Storage Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Environment credentials stay strictly in your local <code>.env</code> file or Docker container environment and are never transmitted to third-party servers.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
