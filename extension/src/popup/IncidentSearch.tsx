import React, { useState, useEffect } from "react";
import { GlassCard } from "../components/cards/GlassCard";
import { NeonButton } from "../components/buttons/NeonButton";
import { api, Incident } from "../services/api";
import { Search, AlertTriangle, Copy, Check, Terminal, Flame, Database, ShieldAlert } from "lucide-react";

export const IncidentSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searching, setSearching] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const sampleErrors = ["Redis timeout", "ECONNREFUSED", "Deployment failed"];

  // Load search history from local storage on mount
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get("incident_search_history", (result) => {
        setSearchHistory(result.incident_search_history || []);
      });
    } else {
      try {
        const localData = localStorage.getItem("incident_search_history");
        setSearchHistory(localData ? JSON.parse(localData) : []);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleSearch = async (searchQuery: string) => {
    const activeQuery = searchQuery || query;
    if (!activeQuery.trim()) return;

    setSearching(true);
    setQuery(activeQuery);
    setExpandedId(null);
    setSearched(true);

    // Save and persist query to history
    const clean = activeQuery.trim();
    setSearchHistory((prev) => {
      const updated = [clean, ...prev.filter((h) => h !== clean)].slice(0, 5);
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ incident_search_history: updated });
      } else {
        try {
          localStorage.setItem("incident_search_history", JSON.stringify(updated));
        } catch (e) {
          // ignore
        }
      }
      return updated;
    });

    try {
      const results = await api.searchIncident(activeQuery);
      // Return the top 3 ranked matches sorted by confidence score
      const ranked = results
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
      
      setIncidents(ranked);
      if (ranked.length > 0) {
        setExpandedId(ranked[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="flex flex-col gap-3.5 animate-fadeIn font-premium-body">
      {/* Search Input Box */}
      <GlassCard className="border-zinc-850 bg-[#080808]/40 shadow-premium">
        <div className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Terminal className="w-3 h-3 text-[#FF007A]" /> incident recall</span>
          {searched && (
            <span className="bg-[#FF007A]/15 border border-[#FF007A]/30 px-2 py-0.5 rounded-full text-[7.5px] text-[#FF007A] font-bold shadow-glow-pink">
              Results Found: {incidents.length}
            </span>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-650" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste logs or query (e.g. ECONNREFUSED)..."
              className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a]/80 border border-zinc-850 text-[10px] text-white placeholder-zinc-700 focus:outline-none focus:border-[#FF007A]/30 rounded-[20px]"
            />
          </div>
          <NeonButton type="submit" variant="primary" className="px-4 py-2 shrink-0 h-9">
            Search
          </NeonButton>
        </form>

        {/* Popular chips */}
        <div className="flex items-center gap-2 mt-3 font-mono text-[8px] text-zinc-550">
          <span>EXAMPLES:</span>
          <div className="flex gap-1.5 flex-wrap">
            {sampleErrors.map((err, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSearch(err)}
                className="px-2.5 py-0.5 rounded-full border border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700 bg-[#0a0a0a]/50 transition-all text-[7.5px]"
              >
                {err}
              </button>
            ))}
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-zinc-900/60 flex flex-col gap-2">
            <span className="font-mono text-[8px] text-zinc-555 uppercase tracking-widest block font-bold">
              Recent Searches
            </span>
            <ul className="flex flex-col gap-1.5 font-mono text-[8.5px] text-zinc-400">
              {searchHistory.map((h, idx) => (
                <li 
                  key={idx}
                  onClick={() => handleSearch(h)}
                  className="hover:text-[#FF007A] cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <span className="text-[#FF007A] font-extrabold">•</span> {h}
                </li>
              ))}
            </ul>
          </div>
        )}
      </GlassCard>

      {/* Incident Result Lists */}
      {searching ? (
        <div className="bg-[#050505] border border-zinc-850 rounded-[24px] p-6 flex flex-col items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-t-transparent border-[#FF007A] rounded-full animate-spin" />
          <p className="font-mono text-[9px] text-zinc-555 uppercase tracking-widest">🐺 Searching incident post-mortems...</p>
        </div>
      ) : searched && incidents.length === 0 ? (
        <div className="border border-zinc-850 bg-[#080808]/20 rounded-[20px] p-6 text-center flex flex-col items-center gap-3 animate-fadeIn font-mono">
          <ShieldAlert className="w-6 h-6 text-[#FF007A] mx-auto opacity-80" />
          <h4 className="font-premium-header font-bold text-[10px] text-white uppercase tracking-wider">
            No similar incident found in Parcle Memory.
          </h4>
          <div className="text-left w-full mt-1.5 border-t border-zinc-900/60 pt-3">
            <span className="text-[7.5px] text-zinc-550 uppercase tracking-wider block font-bold mb-1.5">
              Suggested next steps:
            </span>
            <ul className="flex flex-col gap-1.5 text-[8.5px] text-zinc-400">
              <li className="flex items-center gap-1.5">
                <span className="text-[#FF007A]">•</span> Capture additional incidents
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#FF007A]">•</span> Upload troubleshooting guides
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#FF007A]">•</span> Search broader keywords
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[310px] pr-0.5 scrollbar-thin">
          {incidents.map((inc, index) => {
            const isExpanded = expandedId === inc.id;
            const isCopied = copiedId === inc.id;
            const confidencePercentage = Math.round(inc.confidence * 100);

            return (
              <div
                key={inc.id}
                className={`border bg-[#080808]/50 backdrop-blur-md rounded-[24px] transition-all duration-200 ${
                  isExpanded ? "border-[#FF007A]/45 shadow-premium" : "border-zinc-850 hover:border-zinc-800"
                }`}
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : inc.id)}
                  className="p-3.5 cursor-pointer flex items-center gap-2 justify-between"
                >
                  <div className="flex items-start gap-2.5">
                    {inc.severity === "high" ? (
                      <Flame className="w-3.5 h-3.5 text-[#FF007A] shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[7.5px] font-mono font-black border border-[#FF007A]/40 bg-[#FF007A]/10 text-[#FF007A] px-1.5 py-0.5 rounded-full shrink-0">
                          Match #{index + 1}
                        </span>
                        <h4 className="font-premium-header font-bold text-[10.5px] leading-tight text-white pr-2">
                          {inc.title}
                        </h4>
                      </div>
                      <p className="font-mono text-[7px] text-zinc-550 uppercase tracking-widest mt-1">
                        query: "{inc.errorQuery}"
                      </p>
                    </div>
                  </div>
                  
                  {/* Miniature Confidence Dial in Header when collapsed */}
                  {!isExpanded && (
                    <div className="shrink-0 flex items-center gap-1.5" title={`Confidence: ${confidencePercentage}%`}>
                      <span className="text-[7.5px] font-mono text-zinc-505">match</span>
                      <div className="w-6.5 h-6.5 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle
                            className="text-zinc-900"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            cx="18"
                            cy="18"
                            r="15.915"
                          />
                          <circle
                            className="text-[#FF007A]"
                            strokeWidth="3.5"
                            strokeDasharray={`${confidencePercentage}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            cx="18"
                            cy="18"
                            r="15.915"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Body details conforming to exact prompt structure */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-zinc-900/60 bg-black/40 font-premium-body text-[9px] leading-relaxed flex flex-col gap-4 pt-4 animate-fadeIn rounded-b-[24px]">
                    
                    {/* Header line with details title and large confidence score dial */}
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-900/40">
                      <div className="flex items-center gap-1.5 text-[8.5px] font-black text-[#FF007A] uppercase tracking-wider font-premium-header">
                        <Database className="w-3 h-3 text-[#FF007A]" />
                        <span>MATCH FOUND IN PARCLE MEMORY</span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-[#0a0a0a] border border-zinc-850 px-2 py-0.5 rounded-[12px]">
                        <span className="text-[7px] font-mono text-zinc-550 text-right leading-none">
                          confidence
                        </span>
                        
                        {/* Beautiful Visual Dial */}
                        <div className="w-8 h-8 relative flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle
                              className="text-[#A855F7]/20"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              cx="18"
                              cy="18"
                              r="15.915"
                            />
                            <circle
                              className="text-[#FF007A] shadow-[0_0_8px_rgba(255,0,122,0.3)]"
                              strokeWidth="3.5"
                              strokeDasharray={`${confidencePercentage}, 100`}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              cx="18"
                              cy="18"
                              r="15.915"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-white font-extrabold">
                            {confidencePercentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Timeline Group */}
                    <div className="relative border-l border-dashed border-zinc-850 ml-1.5 pl-4 flex flex-col gap-3.5">
                      
                      {/* Timeline Step 1: Incident */}
                      <div className="relative">
                        <span className="absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#FF007A] border border-black shadow-[0_0_4px_#FF007A]" />
                        <span className="text-zinc-550 font-bold block uppercase text-[7.5px] tracking-wider mb-1">Incident:</span>
                        <p className="text-white bg-[#0a0a0a]/90 p-2 border border-zinc-900 rounded-[12px] text-[8.5px] leading-relaxed">
                          {inc.title}
                        </p>
                      </div>

                      {/* Timeline Step 2: Root Cause */}
                      <div className="relative">
                        <span className="absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#A855F7] border border-black shadow-[0_0_4px_#A855F7]" />
                        <span className="text-zinc-550 font-bold block uppercase text-[7.5px] tracking-wider mb-1">ROOT CAUSE:</span>
                        <p className="text-zinc-400 bg-[#0a0a0a]/90 p-2 border border-zinc-900 rounded-[12px] text-[8.5px] leading-relaxed">
                          {inc.rootCause}
                        </p>
                      </div>

                      {/* Timeline Step 3: Resolution */}
                      <div className="relative">
                        <span className="absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                        <span className="text-emerald-450 font-bold block uppercase text-[7.5px] tracking-wider mb-1">RESOLUTION:</span>
                        <p className="text-zinc-300 bg-[#FF007A]/5 p-2 border border-[#FF007A]/15 rounded-[12px] text-[8.5px] leading-relaxed">
                          {inc.resolution}
                        </p>
                      </div>

                      {/* Timeline Step 4: Lessons Learned */}
                      {inc.lessonsLearned && inc.lessonsLearned.length > 0 && (
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 border border-black shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
                          <span className="text-amber-500 font-bold block uppercase text-[7.5px] tracking-wider mb-1">Lessons Learned:</span>
                          <div className="bg-[#0a0a0a]/90 p-2 border border-zinc-900 rounded-[12px]">
                            <ul className="flex flex-col gap-1.5 font-mono text-[8px] text-zinc-400">
                              {inc.lessonsLearned.map((lesson, lIdx) => (
                                <li key={lIdx} className="flex items-start gap-1">
                                  <span className="text-[#FF007A] font-extrabold">•</span>
                                  <span>{lesson}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recommended Actions */}
                    {inc.recommendedActions && inc.recommendedActions.length > 0 && (
                      <div className="mt-1 pt-3 border-t border-zinc-900/60">
                        <span className="text-emerald-450 font-bold block uppercase text-[7.5px] tracking-wider mb-2">Recommended Actions:</span>
                        <div className="bg-emerald-500/5 p-2.5 border border-emerald-500/15 rounded-[12px]">
                          <ul className="flex flex-col gap-1.5 font-mono text-[8px] text-zinc-300">
                            {inc.recommendedActions.map((action, aIdx) => (
                              <li key={aIdx} className="flex items-center gap-1.5">
                                <span className="text-emerald-400 font-extrabold">✓</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Source Footer and Copy Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60 mt-1">
                      <span className="text-[7.5px] text-zinc-550 lowercase">
                        source: <strong className="text-zinc-400">{inc.source}</strong>
                      </span>
                      <NeonButton
                        variant="dark"
                        onClick={() => copyToClipboard(inc.resolution, inc.id)}
                        className="py-1 px-2.5 text-[7.5px] flex items-center gap-1 h-6 border-zinc-850 bg-[#0c0c0c]/85 hover:text-white"
                      >
                        {isCopied ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 text-emerald-400" /> Resolution copied successfully
                          </span>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" /> Copy Resolution
                          </>
                        )}
                      </NeonButton>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
