import React, { useState } from "react";
import { CODE_FILES, CodeFile } from "../data/codeSnippets";
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Terminal, 
  Container, 
  Clock, 
  HelpCircle,
  FileCheck2
} from "lucide-react";

export const CodeInspector: React.FC = () => {
  const [selectedFilename, setSelectedFilename] = useState<string>("phd_hunter.py");
  const [copied, setCopied] = useState<boolean>(false);

  const currentFile: CodeFile =
    CODE_FILES.find((f) => f.filename === selectedFilename) || CODE_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = currentFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith(".py")) return <FileCode className="w-4 h-4 text-emerald-400" />;
    if (filename.endsWith(".txt")) return <FileText className="w-4 h-4 text-amber-400" />;
    if (filename.includes("Dockerfile") || filename.includes("docker")) return <Container className="w-4 h-4 text-blue-400" />;
    if (filename.endsWith(".yml") || filename.endsWith(".yaml")) return <Clock className="w-4 h-4 text-purple-400" />;
    if (filename.endsWith(".md")) return <HelpCircle className="w-4 h-4 text-sky-400" />;
    return <Terminal className="w-4 h-4 text-slate-400" />;
  };

  const lines = currentFile.content.split("\n");

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-blue-400" />
            <span>Complete Production Python Codebase</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Modular, well-commented Python 3.9+ script with exponential retry adapters, EURAXESS RSS / FindAPhD parsers, strict USA exclusion logic, SQLite deduplication, Telegram & Email dispatchers, and automated 24h cron scheduling.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-all shadow-sm active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Copied to Clipboard!" : "Copy File"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-sm active:scale-95 shadow-blue-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {currentFile.filename}</span>
          </button>
        </div>
      </div>

      {/* Code Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Files List */}
        <div className="space-y-2 lg:col-span-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Project Files
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 space-y-1">
            {CODE_FILES.map((file) => {
              const isSelected = file.filename === selectedFilename;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFilename(file.filename)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-start space-x-2.5 ${
                    isSelected
                      ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent"
                  }`}
                >
                  <span className="mt-0.5 shrink-0">{getFileIcon(file.filename)}</span>
                  <div className="truncate">
                    <div className="font-semibold text-white truncate">{file.filename}</div>
                    <div className="text-[11px] text-slate-400 truncate">{file.name}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Features Highlights Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 mt-4">
            <div className="text-xs font-bold text-white flex items-center space-x-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Script Key Highlights</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span><strong>Multi-source:</strong> EURAXESS API/RSS + FindAPhD + AcademicPositions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span><strong>Strict Ex-USA:</strong> Full US states, keywords & universities filtered out</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span><strong>Deduplication:</strong> SQLite cache prevents duplicate Telegram/Email spam</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span><strong>Anti-blocking:</strong> User-Agent rotation + randomized delay jitter (2-5s)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span><strong>Rich Alerts:</strong> HTML Telegram chunks + responsive HTML email digest</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Code Display */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-inner">
          
          {/* Header Bar */}
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="text-xs font-mono text-slate-300 ml-2 font-semibold">{currentFile.filename}</span>
              <span className="text-[11px] text-slate-500">({lines.length} lines)</span>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              {currentFile.language.toUpperCase()}
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-[620px] overflow-y-auto">
            <pre className="text-slate-200">
              {lines.map((line, idx) => (
                <div key={idx} className="table-row hover:bg-slate-900/60 transition-colors">
                  <span className="table-cell pr-4 text-right select-none text-slate-600 font-mono text-[11px] w-10">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre font-mono">
                    {line}
                  </span>
                </div>
              ))}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
