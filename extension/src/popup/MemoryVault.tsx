import React, { useState, useEffect } from "react";
import { GlassCard } from "../components/cards/GlassCard";
import { api, Memory } from "../services/api";
import { Database, Search, Calendar, Globe, FileText, Cpu, AlertTriangle, Settings, HelpCircle, ExternalLink, Link2, Check } from "lucide-react";

export const MemoryVault: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
  }, []);

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
      mem.memory_type.toLowerCase().includes(query)
    );
  });

  const categories = [
    { id: "all", label: "all" },
    { id: "documentation", label: "docs" },
    { id: "architecture", label: "adrs" },
    { id: "incident", label: "incidents" }
  ];

  return (
    <div className="flex flex-col gap-3.5 animate-fadeIn font-premium-body">
      {/* Search and Filters */}
      <GlassCard className="border-zinc-850 bg-[#080808]/40 shadow-premium">
        <div className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <Database className="w-3 h-3 text-[#FF007A]" /> parcle memory archive
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
      ) : filteredMemories.length === 0 ? (
        <div className="border border-zinc-850 bg-[#080808]/20 rounded-[24px] p-6 text-center">
          <Database className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
          <h4 className="font-premium-header font-bold text-[10px] text-zinc-400 uppercase tracking-wider">Archive Empty</h4>
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
            const indexConfidence = Math.round(mem.confidence * 100);

            return (
              <div
                key={mem.id}
                className="group border border-zinc-850/80 bg-[#080808]/40 rounded-[24px] p-3.5 hover:border-[#FF007A]/30 transition-all duration-200 flex flex-col gap-2 shadow-premium"
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
                          <Calendar className="w-2.5 h-2.5" /> {mem.created_at}
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

                {/* Bottom metadata row */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60 mt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-1 bg-[#FF007A]/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF007A]/60" style={{ width: `${indexConfidence}%` }} />
                    </div>
                    <span className="text-[7.5px] font-mono text-zinc-500">
                      {indexConfidence}% indexing
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
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
    </div>
  );
};
