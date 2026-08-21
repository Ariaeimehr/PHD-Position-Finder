import React from "react";
import { GraduationCap, Terminal, Code, Settings, Play, BookOpen, ShieldCheck } from "lucide-react";

interface NavbarProps {
  activeTab: "explorer" | "code" | "config" | "simulator" | "guide";
  setActiveTab: (tab: "explorer" | "code" | "config" | "simulator" | "guide") => void;
  onQuickRun: () => void;
  isSearching: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onQuickRun, isSearching }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  PhD Hunter
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3 mr-1" /> EXCLUDES USA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Federated Learning &bull; HAR &bull; Transformers</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab("explorer")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "explorer"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Live Vacancies</span>
            </button>

            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "code"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Python Code & Files</span>
            </button>

            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "simulator"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Scraper Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab("config")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "config"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Config & .env</span>
            </button>

            <button
              onClick={() => setActiveTab("guide")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "guide"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Setup Guide</span>
            </button>
          </nav>

          {/* Quick Action Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onQuickRun}
              disabled={isSearching}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md ${
                isSearching
                  ? "bg-indigo-700/60 cursor-not-allowed opacity-80"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 shadow-blue-500/20"
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isSearching ? "animate-spin" : ""}`} />
              <span>{isSearching ? "Crawling Feeds..." : "Run Test Search"}</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("explorer")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === "explorer" ? "bg-blue-600 text-white font-bold" : "text-slate-400"
            }`}
          >
            Live Vacancies
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === "code" ? "bg-blue-600 text-white font-bold" : "text-slate-400"
            }`}
          >
            Python Code
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === "simulator" ? "bg-blue-600 text-white font-bold" : "text-slate-400"
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === "config" ? "bg-blue-600 text-white font-bold" : "text-slate-400"
            }`}
          >
            Config & .env
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === "guide" ? "bg-blue-600 text-white font-bold" : "text-slate-400"
            }`}
          >
            Setup Guide
          </button>
        </div>
      </div>
    </header>
  );
};
