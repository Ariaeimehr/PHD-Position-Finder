import React, { useState, useEffect, useRef } from "react";
import { PhDPosition, CrawlerLog } from "../types";
import { 
  Play, 
  RefreshCw, 
  Terminal, 
  Send, 
  Mail, 
  ShieldAlert, 
  CheckCircle2, 
  Database, 
  Bot, 
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink
} from "lucide-react";

interface ScraperSimulatorProps {
  positions: PhDPosition[];
}

export const ScraperSimulator: React.FC<ScraperSimulatorProps> = ({ positions }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<CrawlerLog[]>([]);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [selectedPreview, setSelectedPreview] = useState<"telegram" | "email">("telegram");
  const [simulatedPositions, setSimulatedPositions] = useState<PhDPosition[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const startSimulation = () => {
    clearAllTimeouts();
    setIsRunning(true);
    setLogs([]);
    setActiveStage(1);
    setSimulatedPositions([]);

    const timestamp = () => new Date().toLocaleTimeString();
    const runId = Date.now();

    const sequence: { delay: number; stage: number; log: CrawlerLog; positionsFound?: PhDPosition[] }[] = [
      {
        delay: 400,
        stage: 1,
        log: {
          id: `log-${runId}-1`,
          timestamp: timestamp(),
          level: "INFO",
          message: "🚀 Starting PhD Hunter pipeline execution (run_daily_search)..."
        }
      },
      {
        delay: 1100,
        stage: 1,
        log: {
          id: `log-${runId}-2`,
          timestamp: timestamp(),
          level: "INFO",
          message: "📦 Initializing SQLite deduplication database at 'phd_positions.db' (table: seen_positions)."
        }
      },
      {
        delay: 1800,
        stage: 2,
        log: {
          id: `log-${runId}-3`,
          timestamp: timestamp(),
          level: "INFO",
          message: "🌐 [EURAXESS Scraper] Querying European Commission RSS feed with rotating User-Agent (Chrome 124/Mac)."
        }
      },
      {
        delay: 2600,
        stage: 2,
        log: {
          id: `log-${runId}-4`,
          timestamp: timestamp(),
          level: "INFO",
          message: "⏳ Jitter delay: sleeping 3.2s to comply with server etiquette..."
        }
      },
      {
        delay: 3500,
        stage: 2,
        log: {
          id: `log-${runId}-5`,
          timestamp: timestamp(),
          level: "SUCCESS",
          message: "📥 [EURAXESS] Parsed 18 candidate vacancies matching 'Federated Learning' & 'MSCA'."
        }
      },
      {
        delay: 4200,
        stage: 3,
        log: {
          id: `log-${runId}-6`,
          timestamp: timestamp(),
          level: "FILTER",
          message: "🚫 [USA Filter] Excluded 6 positions (MIT CSAIL, Stanford AI Lab, UC Berkeley, Carnegie Mellon, Harvard)."
        }
      },
      {
        delay: 5000,
        stage: 3,
        log: {
          id: `log-${runId}-7`,
          timestamp: timestamp(),
          level: "INFO",
          message: "🔎 [FindAPhD Scraper] Searching UK & EU doctoral projects (Funding: F1 Fully Funded)..."
        }
      },
      {
        delay: 5800,
        stage: 3,
        log: {
          id: `log-${runId}-8`,
          timestamp: timestamp(),
          level: "FILTER",
          message: "🚫 [USA Filter] Excluded 8 positions (Georgia Tech, Univ of Washington, Purdue, NYU)."
        }
      },
      {
        delay: 6600,
        stage: 4,
        log: {
          id: `log-${runId}-9`,
          timestamp: timestamp(),
          level: "SUCCESS",
          message: "✨ Total non-US fully-funded positions extracted: 10 positions across ETH Zurich, Oxford, TUM, NUS, KTH, Cambridge, INRIA.",
          details: "ETH Zurich (SNSF), Oxford (EPSRC), TUM (TV-L E13), NUS (Scholarship), KTH (Salaried), Cambridge, INRIA (MSCA)"
        },
        positionsFound: positions.slice(0, 7)
      },
      {
        delay: 7400,
        stage: 5,
        log: {
          id: `log-${runId}-10`,
          timestamp: timestamp(),
          level: "INFO",
          message: "💾 SQLite Deduplication: 7 new positions cached with SHA-256 signatures."
        }
      },
      {
        delay: 8200,
        stage: 6,
        log: {
          id: `log-${runId}-11`,
          timestamp: timestamp(),
          level: "SUCCESS",
          message: "📬 Dispatching consolidated daily Telegram Bot alert (HTML payload)..."
        }
      },
      {
        delay: 9000,
        stage: 6,
        log: {
          id: `log-${runId}-12`,
          timestamp: timestamp(),
          level: "SUCCESS",
          message: "🏁 Execution completed successfully. Scheduler registered for next 24h cycle."
        }
      }
    ];

    sequence.forEach((step) => {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, step.log]);
        setActiveStage(step.stage);
        if (step.positionsFound) {
          setSimulatedPositions(step.positionsFound);
        }
        if (step.stage === 6) {
          setIsRunning(false);
        }
      }, step.delay);
      timeoutsRef.current.push(timer);
    });
  };

  useEffect(() => {
    // Initial run on mount
    startSimulation();
    return () => {
      clearAllTimeouts();
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const stages = [
    { num: 1, name: "Init & DB" },
    { num: 2, name: "Query Feeds" },
    { num: 3, name: "Filter Ex-USA" },
    { num: 4, name: "Topic Match" },
    { num: 5, name: "Deduplication" },
    { num: 6, name: "Dispatch Alerts" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>Interactive Live Scraper Simulation & Alert Sandbox</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Watch the live crawl sequence: jitter delay timing, rotating User-Agent headers, European Commission RSS feed parsing, strict USA exclusion logic, SQLite deduplication, and formatted Telegram/Email alert rendering.
          </p>
        </div>

        <button
          onClick={startSimulation}
          disabled={isRunning}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md active:scale-95 shrink-0 ${
            isRunning
              ? "bg-slate-800 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20"
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
          <span>{isRunning ? "Running Simulation..." : "Re-Run Scraper Test"}</span>
        </button>
      </div>

      {/* Progress Pipeline Stepper */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between overflow-x-auto gap-2 text-xs">
          {stages.map((stage) => {
            const isCompleted = activeStage > stage.num;
            const isCurrent = activeStage === stage.num;

            return (
              <div key={stage.num} className="flex items-center space-x-2 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : isCurrent
                      ? "bg-blue-600 text-white ring-4 ring-blue-500/20 animate-pulse"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {isCompleted ? "✓" : stage.num}
                </div>
                <span
                  className={`font-semibold ${
                    isCurrent ? "text-white" : isCompleted ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {stage.name}
                </span>
                {stage.num < stages.length && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-700 hidden sm:inline" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Terminal Output (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-inner">
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="text-xs font-mono text-slate-300 ml-2 font-semibold">python phd_hunter.py --test</span>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
              <Database className="w-3 h-3 text-indigo-400" />
              <span>phd_positions.db</span>
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-[500px] font-mono text-xs space-y-2.5 leading-relaxed bg-slate-950">
            {logs.map((log) => {
              let badgeColor = "text-slate-400";
              if (log.level === "SUCCESS") badgeColor = "text-emerald-400 font-bold";
              if (log.level === "FILTER") badgeColor = "text-rose-400 font-bold";
              if (log.level === "INFO") badgeColor = "text-sky-400";

              return (
                <div key={log.id} className="flex items-start space-x-2 font-mono">
                  <span className="text-slate-600 select-none text-[11px] shrink-0">[{log.timestamp}]</span>
                  <span className={`select-none text-[11px] shrink-0 ${badgeColor}`}>[{log.level}]</span>
                  <div className="text-slate-200">
                    <div>{log.message}</div>
                    {log.details && (
                      <div className="text-slate-400 text-[11px] mt-0.5">{log.details}</div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Right: Notification Payload Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Switcher */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
            <button
              onClick={() => setSelectedPreview("telegram")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                selectedPreview === "telegram"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Alert Preview</span>
            </button>

            <button
              onClick={() => setSelectedPreview("email")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                selectedPreview === "email"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Newsletter</span>
            </button>
          </div>

          {/* Telegram Bubble Mockup */}
          {selectedPreview === "telegram" ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-800 text-xs text-slate-400">
                <Bot className="w-4 h-4 text-sky-400" />
                <span className="font-semibold text-white">@PhDHunterBot (Telegram)</span>
                <span className="text-[11px] text-slate-500 ml-auto">today at 08:00</span>
              </div>

              {/* Chat Bubble */}
              <div className="bg-sky-950/40 border border-sky-500/20 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-200 space-y-3 leading-relaxed shadow-sm">
                <div>
                  <div className="font-bold text-white text-sm flex items-center space-x-1.5">
                    <span>🎓 Daily Fully-Funded PhD Digest (Ex-USA)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 italic">August 20, 2026 &bull; Filtered Ex-USA</div>
                  <div className="text-xs text-emerald-400 mt-1 font-semibold">
                    ✨ Found {simulatedPositions.length || 3} new vacancies matching your topics:
                  </div>
                </div>

                <div className="border-t border-sky-500/20 pt-2 space-y-3">
                  <div className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                    ━━━━━━━━━━━━━━━━━━━━<br />
                    🔬 FEDERATED LEARNING
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-white">
                      1. <a href="https://jobs.ethz.ch" target="_blank" rel="noreferrer" className="text-sky-400 underline">PhD Position in Privacy-Preserving Federated Learning</a>
                    </div>
                    <div className="text-slate-300">🏛️ <strong>Institution:</strong> ETH Zurich & Max Planck</div>
                    <div className="text-slate-300">🌍 <strong>Country:</strong> Switzerland</div>
                    <div className="text-emerald-400">💰 <strong>Funding:</strong> Fully Funded (SNSF CHF 54k-62k/yr)</div>
                    <div className="text-slate-400">👤 <strong>PI:</strong> Prof. Florian Tramèr</div>
                    <div className="text-[11px] text-slate-400">🏷️ <i>Match:</i> <code>privacy-preserving machine learning</code></div>
                    <div className="pt-1">
                      <a href="https://jobs.ethz.ch" className="text-sky-300 font-semibold hover:underline flex items-center space-x-1">
                        <span>👉 Click Here to View & Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-sky-300 uppercase tracking-wider pt-2">
                    ━━━━━━━━━━━━━━━━━━━━<br />
                    🏃 HUMAN ACTIVITY RECOGNITION
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-white">
                      2. <a href="https://www.cs.ox.ac.uk" target="_blank" rel="noreferrer" className="text-sky-400 underline">Multimodal Sensor Fusion for Activity Recognition</a>
                    </div>
                    <div className="text-slate-300">🏛️ <strong>Institution:</strong> University of Oxford</div>
                    <div className="text-slate-300">🌍 <strong>Country:</strong> United Kingdom</div>
                    <div className="text-emerald-400">💰 <strong>Funding:</strong> Fully Funded (EPSRC £19,237/yr stipend)</div>
                    <div className="text-slate-400">👤 <strong>PI:</strong> Prof. Niki Trigoni</div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 text-right pt-1">
                  08:00 AM &bull; Automated PhD Hunter Bot
                </div>
              </div>
            </div>
          ) : (
            /* Email Newsletter Mockup */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-800 text-xs text-slate-400">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Inbox: Daily PhD Vacancies Digest</span>
              </div>

              <div className="bg-white text-slate-800 rounded-xl overflow-hidden shadow-sm text-xs">
                <div className="bg-slate-900 text-white p-4 text-center">
                  <div className="font-bold text-sm">🎓 Daily Fully-Funded PhD Digest</div>
                  <div className="text-[11px] text-slate-300">Worldwide Vacancies (Excluding USA)</div>
                </div>

                <div className="p-3 space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      FEDERATED LEARNING
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">
                      PhD in Asynchronous Federated Optimization over Edge Devices
                    </h4>
                    <p className="text-slate-600 text-[11px] mt-1">
                      <strong>Institution:</strong> National University of Singapore (NUS)
                    </p>
                    <p className="text-emerald-700 text-[11px] font-semibold">
                      <strong>Funding:</strong> Full Tuition + SGD $3,500/mo Stipend
                    </p>
                    <div className="mt-2">
                      <span className="inline-block bg-blue-600 text-white px-2.5 py-1 rounded text-[10px] font-bold">
                        View Vacancy &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
