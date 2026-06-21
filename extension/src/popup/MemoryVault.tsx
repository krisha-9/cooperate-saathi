import React, { useState, useEffect } from "react";
import { GlassCard } from "../components/cards/GlassCard";
import { api, Memory } from "../services/api";
import { Database, Search, Calendar, Globe, FileText, Cpu, AlertTriangle, Settings, HelpCircle, ExternalLink, Link2, Check } from "lucide-react";

interface MemoryVaultProps {
  setActiveTab?: (tab: string) => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({ setActiveTab }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const data = await api.getMemories();
        setMemories(data);
      } catch (err) {
        console.error("Error loading memories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();

    window.addEventListener("parcle-memory-updated", fetchMemories);
    return () => {
      window.removeEventListener("parcle-memory-updated", fetchMemories);
    };
  }, []);

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (isNaN(diffMs)) {
        return dateString;
      }
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) {
        return "Captured just now";
      }
      if (diffMins < 60) {
        return `Captured ${diffMins} mins ago`;
      }
      if (diffHours < 24) {
        return `Captured ${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      }
      if (diffDays === 1) {
        return "Captured yesterday";
      }
      if (diffDays < 7) {
        return `Captured ${diffDays} days ago`;
      }
      const diffWeeks = Math.floor(diffDays / 7);
      if (diffWeeks < 5) {
        return `Captured ${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
      }
      const diffMonths = Math.floor(diffDays / 30);
      return `Captured ${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
    } catch (e) {
      return dateString;
    }
  };

  const getMemoryTypeConfig = (type: string) => {
    switch (type) {
      case "documentation":
        return { label: "doc", color: "text-[#FF007A] border-[#FF007A]/20 bg-[#FF007A]/5", icon: FileText };
      case "architecture":
        return { label: "arch", color: "text-[#A855F7] border-[#A855F7]/20 bg-[#A855F7]/5", icon: Cpu };
      case "incident":
        return { label: "incident", color: "text-rose-450 border-rose-450/20 bg-rose-450/5", icon: AlertTriangle };
      case "setup_guide":
        return { label: "guide", color: "text-amber-450 border-amber-450/20 bg-amber-450/5", icon: Settings };
      default:
        return { label: "memory", color: "text-zinc-400 border-zinc-800 bg-zinc-800/10", icon: HelpCircle };
    }
  };

  const getStatusBadge = (id: string) => {
    const charCodeSum = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const isPink = charCodeSum % 2 === 0;
    const dotColor = isPink ? "bg-[#FF007A]" : "bg-emerald-500";
    const statuses = ["Indexed", "Stored in Memory", "Knowledge Available"];
    const text = statuses[charCodeSum % statuses.length];
    return { text, dotColor };
  };

  const filteredMemories = memories.filter((mem) => {
    if (selectedCategory !== "all") {
      if (selectedCategory === "documentation" && mem.memory_type !== "documentation" && mem.memory_type !== "setup_guide") {
        return false;
      }
      if (selectedCategory === "architecture" && mem.memory_type !== "architecture") {
        return false;
      }
      if (selectedCategory === "incident" && mem.memory_type !== "incident") {
        return false;
      }
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      mem.title.toLowerCase().includes(query) ||
      mem.source.toLowerCase().includes(query) ||
      mem.memory_type.toLowerCase().includes(query) ||
      (mem.summary && mem.summary.toLowerCase().includes(query))
    );
  });

  const categories = [
    { id: "all", label: "ALL" },
    { id: "documentation", label: "DOCS" },
    { id: "architecture", label: "ADRS" },
    { id: "incident", label: "INCIDENTS" }
  ];

  const detailsModalConfig = selectedMemory ? getMemoryTypeConfig(selectedMemory.memory_type) : null;
  const DetailsModalTypeIcon = detailsModalConfig ? detailsModalConfig.icon : HelpCircle;

  return (
    <div className="flex flex-col gap-3.5 animate-fadeIn font-premium-body h-full relative">
      {/* Search and Filters */}
      <GlassCard className="border-zinc-850 bg-[#080808]/40 shadow-premium">
        <div className="font-mono text-[8px] text-zinc-555 uppercase tracking-widest mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold">
            <Database className="w-3 h-3 text-[#FF007A]" /> Parcle Memory Archive
          </div>
          <div className="bg-[#FF007A]/15 border border-[#FF007A]/30 px-2 py-0.5 rounded-full text-[7.5px] text-[#FF007A] font-bold shadow-glow-pink">
            {memories.length} Knowledge Blocks Stored
          </div>
        </div>

        {/* Input box with rounded-[20px] */}
        <div className="relative flex items-center mb-3">
          <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-650" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archive..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0a0a0a]/80 border border-zinc-850 text-[10px] text-white placeholder-zinc-700 focus:outline-none focus:border-[#FF007A]/30 rounded-[20px]"
          />
        </div>

        {/* Category filters scrollbar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-0.5 font-premium-header text-[8px] font-bold uppercase tracking-wider rounded-full transition-all shrink-0 border ${
                  isActive
                    ? "bg-[#FF007A]/10 border-[#FF007A] text-[#FF007A] shadow-[0_0_8px_rgba(255,0,122,0.05)]"
                    : "bg-[#0b0b0b] border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-750"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Vault List */}
      {loading ? (
        <div className="bg-[#050505] border border-zinc-850 rounded-[24px] p-6 flex flex-col items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-t-transparent border-[#FF007A] rounded-full animate-spin" />
          <p className="font-mono text-[9px] text-zinc-550 uppercase tracking-widest">Accessing Parcle archive...</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="border border-zinc-850 bg-[#080808]/20 rounded-[24px] p-6 text-center flex flex-col items-center gap-3">
          <Database className="w-6 h-6 text-zinc-700 mx-auto" />
          <div>
            <h4 className="font-premium-header font-bold text-[10px] text-zinc-400 uppercase tracking-wider">Archive Empty</h4>
            <p className="text-[8.5px] text-zinc-500 mt-1.5 font-mono leading-normal max-w-[280px]">
              🐺 No knowledge blocks captured yet. Capture a page to start building your engineering memory archive.
            </p>
          </div>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab("capture")}
              className="mt-1 px-4 py-1.5 font-mono text-[8px] font-bold uppercase tracking-wider rounded-full border border-[#FF007A]/40 bg-[#FF007A]/5 hover:bg-[#FF007A]/10 text-white hover:border-[#FF007A]/60 transition-all shadow-[0_0_8px_rgba(255,0,122,0.05)]"
            >
              Capture Knowledge
            </button>
          )}
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="border border-zinc-850 bg-[#080808]/20 rounded-[24px] p-6 text-center">
          <Database className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
          <h4 className="font-premium-header font-bold text-[10px] text-zinc-400 uppercase tracking-wider">No Matches</h4>
          <p className="text-[8.5px] text-zinc-500 mt-1 font-mono">
            No memories match the current filters in Parcle storage.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[305px] pr-0.5 scrollbar-thin">
          {filteredMemories.map((mem) => {
            const config = getMemoryTypeConfig(mem.memory_type);
            const TypeIcon = config.icon;
            const isCopied = copiedId === mem.id;
            const statusBadge = getStatusBadge(mem.id);

            return (
              <div
                key={mem.id}
                onClick={() => setSelectedMemory(mem)}
                className="group border border-zinc-850/80 bg-[#080808]/40 rounded-[24px] p-3.5 hover:border-[#FF007A]/35 hover:scale-[1.01] hover:shadow-[0_0_12px_rgba(255,0,122,0.08)] cursor-pointer transition-all duration-300 ease-out active:scale-[0.99] flex flex-col gap-2 shadow-premium"
              >
                {/* Upper row: Icon, title and badge */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg border ${config.color} shrink-0`}>
                      <TypeIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-premium-header font-bold text-[10.5px] text-white tracking-wide group-hover:text-[#FF007A] transition-colors">
                        {mem.title}
                      </h4>
                      <div className="flex items-center gap-2.5 font-mono text-[7px] text-zinc-550 mt-0.5 uppercase tracking-wider">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5" /> {formatRelativeTime(mem.created_at)}
                        </span>
                        <span className="flex items-center gap-0.5 max-w-[110px] truncate" title={mem.source}>
                          <Globe className="w-2.5 h-2.5 shrink-0" /> {mem.source}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[7px] font-mono border px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider font-semibold shrink-0 ${config.color}`}>
                    {config.label}
                  </span>
                </div>

                {/* Summary */}
                {mem.summary && (
                  <p className="text-[8.5px] text-zinc-400 font-mono line-clamp-2 leading-relaxed bg-[#050505]/65 border border-zinc-900/60 p-2 rounded-[12px] mt-1">
                    {mem.summary}
                  </p>
                )}

                {/* Bottom metadata row */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor} shrink-0`} />
                    <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-wide">
                      {statusBadge.text}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => copyLink(mem.source_url, mem.id)}
                      className="p-1 rounded-full border border-zinc-850 hover:border-zinc-700 bg-black/40 text-zinc-500 hover:text-white transition-colors"
                      title="Copy URL"
                    >
                      {isCopied ? (
                        <Check className="w-2.5 h-2.5 text-[#FF007A]" />
                      ) : (
                        <Link2 className="w-2.5 h-2.5" />
                      )}
                    </button>
                    <a
                      href={mem.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-full border border-zinc-850 hover:border-zinc-700 bg-black/40 text-zinc-500 hover:text-white transition-colors"
                      title="Open Source Link"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedMemory && detailsModalConfig && (
        <div 
          className="absolute inset-0 bg-[#050505]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedMemory(null)}
        >
          <div 
            className="w-full max-h-[95%] bg-[#0a0a0a] border border-[#FF007A]/30 rounded-[24px] flex flex-col shadow-[0_0_25px_rgba(255,0,122,0.15)] overflow-hidden font-premium-body"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between shrink-0">
              <span className="font-mono text-[8px] text-[#FF007A] uppercase tracking-widest flex items-center gap-1.5">
                <Database className="w-3 h-3" /> memory details
              </span>
              <button 
                onClick={() => setSelectedMemory(null)}
                className="text-zinc-500 hover:text-white font-mono text-[9px] border border-zinc-850 px-2.5 py-0.5 rounded-full hover:border-zinc-700 transition-colors"
              >
                CLOSE
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3.5 scrollbar-thin text-[9.5px]">
              {/* Title */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1">title</span>
                <h3 className="font-premium-header font-bold text-[11px] text-white leading-snug">
                  {selectedMemory.title}
                </h3>
              </div>

              {/* Type */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1">type</span>
                <span className={`text-[8px] font-mono border px-2 py-0.5 rounded-[4px] uppercase tracking-wider font-semibold inline-flex items-center gap-1 ${detailsModalConfig.color}`}>
                  <DetailsModalTypeIcon className="w-3.5 h-3.5" />
                  {detailsModalConfig.label}
                </span>
              </div>

              {/* Source Domain */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1">source domain</span>
                <p className="text-zinc-400 font-mono text-[8px]">
                  {selectedMemory.source}
                </p>
              </div>

              {/* Captured Time */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1">captured time</span>
                <p className="text-zinc-400 font-mono text-[8px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#FF007A]" /> {formatRelativeTime(selectedMemory.created_at)} ({selectedMemory.created_at})
                </p>
              </div>

              {/* URL with Copy */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1">source url</span>
                <div className="flex flex-col gap-1.5">
                  <a 
                    href={selectedMemory.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[8px] text-[#FF007A] break-all bg-[#050505] p-2 border border-zinc-900 rounded-[12px] hover:border-zinc-800 transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="truncate flex-1">{selectedMemory.source_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMemory.source_url);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="w-full text-center py-2 rounded-full border border-zinc-850 hover:border-zinc-700 bg-[#FF007A]/5 hover:bg-[#FF007A]/10 text-zinc-300 hover:text-white transition-all text-[8px] font-mono tracking-wider font-bold uppercase shrink-0"
                  >
                    {copiedUrl ? "✓ Copied to clipboard" : "Copy Source URL"}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1">summary</span>
                <p className="text-zinc-300 bg-[#050505] p-3 border border-zinc-900 rounded-[12px] leading-relaxed whitespace-pre-wrap">
                  {selectedMemory.summary || "No summary available for this memory block."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
