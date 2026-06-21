import React, { useState } from "react";
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

  const sampleErrors = ["Redis timeout", "ECONNREFUSED", "Deployment failed"];

  const handleSearch = async (searchQuery: string) => {
    const activeQuery = searchQuery || query;
    if (!activeQuery.trim()) return;

    setSearching(true);
    setQuery(activeQuery);
    setExpandedId(null);
    setSearched(true);

    try {
      const results = await api.searchIncident(activeQuery);
      setIncidents(results);
      if (results.length > 0) {
        setExpandedId(results[0].id);
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
    setTimeout(() => setCopiedId(null), 2000);
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
      </GlassCard>

      {/* Incident Result Lists */}
      {searching ? (
        <div className="bg-[#050505] border border-zinc-850 rounded-[24px] p-6 flex flex-col items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-t-transparent border-[#FF007A] rounded-full animate-spin" />
          <p className="font-mono text-[9px] text-zinc-550 uppercase tracking-widest">🐺 Searching incident post-mortems...</p>
        </div>
      ) : searched && incidents.length === 0 ? (
        <div className="border border-zinc-850 bg-[#080808]/20 rounded-[20px] p-6 text-center flex flex-col items-center gap-2 animate-fadeIn">
          <ShieldAlert className="w-6 h-6 text-[#FF007A] mx-auto opacity-80" />
          <h4 className="font-premium-header font-extrabold text-[10.5px] text-white uppercase tracking-wider">
            No matching incident reports found.
          </h4>
          <p className="text-[8.5px] text-zinc-500 font-mono max-w-[260px] mx-auto leading-normal">
            No incident logs or post-mortems matched "{query}" in Parcle Memory.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[310px] pr-0.5 scrollbar-thin">
          {incidents.map((inc) => {
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
                      <h4 className="font-premium-header font-bold text-[10.5px] leading-tight text-white pr-2">
                        {inc.title}
                      </h4>
                      <p className="font-mono text-[7px] text-zinc-550 uppercase tracking-widest mt-0.5">
                        query: "{inc.errorQuery}"
                      </p>
                    </div>
                  </div>
                  
                  {/* Miniature Confidence Dial in Header when collapsed */}
                  {!isExpanded && (
                    <div className="shrink-0 flex items-center gap-1.5" title={`Confidence: ${confidencePercentage}%`}>
                      <span className="text-[7.5px] font-mono text-zinc-500">match</span>
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
                  <div className="px-4 pb-4 border-t border-zinc-900/60 bg-black/40 font-premium-body text-[9px] leading-relaxed flex flex-col gap-3 pt-3.5 animate-fadeIn rounded-b-[24px]">
                    
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

                    {/* Issue section */}
                    <div>
                      <span className="text-zinc-550 font-bold block uppercase text-[7.5px] tracking-wider mb-1">Incident:</span>
                      <p className="text-white bg-[#0a0a0a]/90 p-2 border border-zinc-900 rounded-[12px] text-[8.5px] leading-relaxed">
                        {inc.title}
                      </p>
                    </div>

                    {/* Root Cause section */}
                    <div>
                      <span className="text-zinc-550 font-bold block uppercase text-[7.5px] tracking-wider mb-1">ROOT CAUSE:</span>
                      <p className="text-zinc-400 bg-[#0a0a0a]/90 p-2 border border-zinc-900 rounded-[12px] text-[8.5px] leading-relaxed">
                        {inc.rootCause}
                      </p>
                    </div>

                    {/* Resolution section */}
                    <div>
                      <span className="text-[#FF007A] font-bold block uppercase text-[7.5px] tracking-wider mb-1">RESOLUTION:</span>
                      <p className="text-zinc-300 bg-[#FF007A]/5 p-2 border border-[#FF007A]/15 rounded-[12px] text-[8.5px] leading-relaxed">
                        {inc.resolution}
                      </p>
                    </div>

                    {/* Source Footer and Copy Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60 mt-1">
                      <span className="text-[7.5px] text-zinc-550 lowercase">
                        source: <strong className="text-zinc-400">Parcle Incident Memory</strong>
                      </span>
                      <NeonButton
                        variant="dark"
                        onClick={() => copyToClipboard(inc.resolution, inc.id)}
                        className="py-1 px-2.5 text-[7.5px] flex items-center gap-1 h-6 border-zinc-850 bg-[#0c0c0c]/85 hover:text-white"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-[#FF007A]" /> Copied
                          </>
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
