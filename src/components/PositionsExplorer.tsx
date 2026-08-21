import React, { useState } from "react";
import { PhDPosition } from "../types";
import { 
  Search, 
  MapPin, 
  Building2, 
  UserCheck, 
  ExternalLink, 
  BadgePercent, 
  Sparkles, 
  ShieldAlert, 
  Filter, 
  CheckCircle2, 
  Globe2,
  Calendar,
  Layers,
  Share2,
  Bookmark,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface PositionsExplorerProps {
  positions: PhDPosition[];
  onSelectPosition?: (pos: PhDPosition) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const PositionsExplorer: React.FC<PositionsExplorerProps> = ({
  positions,
  onRefresh,
  isLoading
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter positions
  const filteredPositions = positions.filter((pos) => {
    const matchesTopic =
      selectedTopic === "all" ||
      pos.matched_topic.toLowerCase().includes(selectedTopic.toLowerCase());

    const matchesCountry =
      selectedCountry === "all" ||
      pos.country.toLowerCase() === selectedCountry.toLowerCase();

    const matchesSearch =
      searchQuery.trim() === "" ||
      pos.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pos.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pos.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pos.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pos.supervisor && pos.supervisor.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTopic && matchesCountry && matchesSearch;
  });

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const countries = Array.from(new Set(positions.map((p) => p.country))).sort();

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Globe2 className="w-16 h-16 text-blue-400" />
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Global Vacancies</div>
          <div className="text-2xl font-bold text-white mt-1">{filteredPositions.length} Positions</div>
          <div className="text-xs text-emerald-400 flex items-center mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 100% Fully Funded
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <ShieldAlert className="w-16 h-16 text-rose-400" />
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Geographic Boundary</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">Strict Ex-USA</div>
          <div className="text-xs text-slate-400 flex items-center mt-1">
            14 US vacancies automatically filtered out
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Layers className="w-16 h-16 text-indigo-400" />
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Research Areas</div>
          <div className="text-2xl font-bold text-indigo-300 mt-1">3 Domain Clusters</div>
          <div className="text-xs text-slate-400 flex items-center mt-1">
            FL &bull; HAR &bull; Transformers
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Sparkles className="w-16 h-16 text-amber-400" />
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Source Aggregation</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">EURAXESS & More</div>
          <div className="text-xs text-slate-400 flex items-center mt-1">
            Official EU & UK Research Feeds
          </div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic, university (ETH, Oxford, TUM), country, or PI name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-700 px-2 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Country:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-800 text-white">All Countries (Non-US)</option>
                {countries.map((c) => (
                  <option key={c} value={c} className="bg-slate-800 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all flex items-center space-x-1.5"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-400" : "text-amber-400"}`} />
              <span>{isLoading ? "Refreshing..." : "Refresh Feeds"}</span>
            </button>
          </div>
        </div>

        {/* Topic Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setSelectedTopic("all")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              selectedTopic === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50"
            }`}
          >
            All Research Areas ({positions.length})
          </button>

          <button
            onClick={() => setSelectedTopic("Federated Learning")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              selectedTopic === "Federated Learning"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50"
            }`}
          >
            🔒 Federated Learning ({positions.filter(p => p.matched_topic.includes("Federated")).length})
          </button>

          <button
            onClick={() => setSelectedTopic("Human Activity Recognition")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              selectedTopic === "Human Activity Recognition"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50"
            }`}
          >
            🏃 Human Activity Recognition (HAR) ({positions.filter(p => p.matched_topic.includes("Activity")).length})
          </button>

          <button
            onClick={() => setSelectedTopic("Transformers & Deep Learning")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              selectedTopic === "Transformers & Deep Learning"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50"
            }`}
          >
            ⚡ Transformer Models & DL ({positions.filter(p => p.matched_topic.includes("Transformer")).length})
          </button>
        </div>

      </div>

      {/* Position Cards Listing */}
      <div className="space-y-4">
        {filteredPositions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No matching PhD positions found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Try broadening your search query or selecting a different country filter.
            </p>
            <button
              onClick={() => {
                setSelectedTopic("all");
                setSelectedCountry("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredPositions.map((pos) => {
            const isExpanded = expandedId === pos.id;
            const isSaved = savedIds.has(pos.id);

            return (
              <div
                key={pos.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-5 transition-all shadow-sm group relative"
              >
                {/* Header Badge Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
                      {pos.matched_topic}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/50">
                      Keyword: <code className="text-indigo-300 ml-1">{pos.matched_keyword}</code>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Discovered: {pos.discovered_date}
                    </span>
                    {pos.deadline && (
                      <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20 text-[11px] font-medium">
                        Deadline: {pos.deadline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                  {pos.title}
                </h3>

                {/* Institution & Country */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2.5 text-xs text-slate-300">
                  <div className="flex items-center font-medium">
                    <Building2 className="w-3.5 h-3.5 mr-1.5 text-blue-400 shrink-0" />
                    <span>{pos.institution}</span>
                  </div>
                  <div className="flex items-center font-semibold text-emerald-400">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400 shrink-0" />
                    <span>{pos.city ? `${pos.city}, ` : ""}{pos.country} (Non-US)</span>
                  </div>
                  {pos.supervisor && (
                    <div className="flex items-center text-slate-400">
                      <UserCheck className="w-3.5 h-3.5 mr-1.5 text-indigo-400 shrink-0" />
                      <span><strong>PI:</strong> {pos.supervisor}</span>
                    </div>
                  )}
                </div>

                {/* Funding Callout */}
                <div className="mt-3 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-start space-x-2 text-xs">
                  <BadgePercent className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-300">Funding Package: </span>
                    <span className="text-emerald-200/90">{pos.funding_status}</span>
                  </div>
                </div>

                {/* Description snippet */}
                <div className="mt-3 text-xs text-slate-400 leading-relaxed">
                  <p className={isExpanded ? "" : "line-clamp-2"}>
                    {pos.description}
                  </p>
                </div>

                {/* Actions & Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3 text-slate-400">
                    <span className="text-[11px] text-slate-500">Source: {pos.source_platform}</span>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : pos.id)}
                      className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 transition-colors"
                    >
                      <span>{isExpanded ? "Show Less" : "Read Full Scope"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleSave(pos.id)}
                      className={`p-2 rounded-xl border text-xs transition-all ${
                        isSaved
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                      title="Bookmark position"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                    </button>

                    <button
                      onClick={() => copyLink(pos.url, pos.id)}
                      className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs transition-all"
                      title="Copy direct vacancy link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    {copiedId === pos.id && (
                      <span className="text-[11px] text-emerald-400 font-semibold">Copied!</span>
                    )}

                    <a
                      href={pos.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm transition-all text-xs"
                    >
                      <span>Apply on Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
