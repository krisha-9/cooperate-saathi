import React, { useEffect, useState } from "react";
import { GlassCard } from "../components/cards/GlassCard";
import { NeonButton } from "../components/buttons/NeonButton";
import { api } from "../services/api";
import { Chrome, ShieldAlert, Sparkles, Terminal, CheckCircle2, AlertTriangle } from "lucide-react";

export const CapturePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<{ title: string; url: string; id?: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "capturing" | "success" | "error">("idle");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Retrieve current active tab
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab && tab.url) {
          if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
            setStatus("error");
            setErrorMessage("Cannot capture protected system tabs. Open a documentation page or a website to capture.");
          } else {
            setActiveTab({
              title: tab.title || "Untitled Page",
              url: tab.url,
              id: tab.id
            });
          }
        } else {
          setStatus("error");
          setErrorMessage("No active tab context found.");
        }
      });
    } else {
      // Mock data for development environment
      setActiveTab({
        title: "Vite + React + Tailwind CSS Configuration Guide",
        url: "https://tailwindcss.com/docs/guides/vite"
      });
    }
  }, []);

  const triggerCapture = async () => {
    if (!activeTab) return;
    
    setStatus("capturing");
    setTerminalLogs(["Reading page..."]);

    // Step 1: Reading page... (Wait 600ms)
    await new Promise((r) => setTimeout(r, 600));
    setTerminalLogs((prev) => [...prev, "Extracting content..."]);
    await new Promise((r) => setTimeout(r, 600));

    let scraperData = {
      title: activeTab.title,
      url: activeTab.url,
      content: "Mock content scraped for Parcle memory ingestion."
    };

    // Scrape tab in Chrome
    if (typeof chrome !== "undefined" && chrome.tabs && activeTab.id) {
      try {
        const response = await new Promise<any>((resolve, reject) => {
          chrome.tabs.sendMessage(activeTab.id!, { action: "EXTRACT_PAGE" }, (res) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(res);
            }
          });
        });

        if (response && response.success) {
          scraperData = {
            title: response.data.title,
            url: response.data.url,
            content: response.data.content
          };
        }
      } catch (err) {
        console.warn("Content script trigger warning, utilizing fallback mappings.", err);
      }
    }

    // Step 3: Sending to backend...
    setTerminalLogs((prev) => [...prev, "Sending to backend..."]);
    await new Promise((r) => setTimeout(r, 600));

    try {
      // ingestPage first stores locally, then POSTs to /ingest-page
      await api.ingestPage(scraperData);
      
      setTerminalLogs((prev) => [...prev, "Saving to Parcle..."]);
      await new Promise((r) => setTimeout(r, 600));
      setTerminalLogs((prev) => [...prev, "Success"]);
      
      await new Promise((r) => setTimeout(r, 800));
      setStatus("success");
      setErrorMessage("");
    } catch (err) {
      console.warn("Backend sync failed during capture:", err);
      // In hybrid mode, memory still remains stored locally.
      setTerminalLogs((prev) => [...prev, "Stored locally. Backend sync unavailable."]);
      
      await new Promise((r) => setTimeout(r, 800));
      setStatus("success");
      setErrorMessage("Backend sync unavailable");
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn font-premium-body">
      {/* 🐺 Agent Speak speech bubble (appears on load in idle state) */}
      {status === "idle" && activeTab && (
        <div className="flex items-start gap-2.5 bg-[#0a0a0a]/90 border border-zinc-850 p-3.5 rounded-[20px] font-mono text-[9px] text-zinc-400 leading-relaxed shadow-premium">
          <span className="text-[14px] shrink-0 mt-0.5 animate-bounce">🐺</span>
          <div>
            I found a page: <strong className="text-white">"{activeTab.title}"</strong>. Should I store it in memory?
          </div>
        </div>
      )}

      {/* Current page card overview */}
      <GlassCard glow={status === "success"} className="border-zinc-850/80 bg-[#080808]/40 shadow-premium">
        <div className="flex items-center gap-1.5 mb-2 text-zinc-550 font-mono text-[8px] uppercase tracking-widest">
          <Chrome className="w-3 h-3 text-[#FF007A]" />
          current page
        </div>
        
        {activeTab ? (
          <div className="flex flex-col gap-1.5">
            <h3 className="font-premium-header font-bold text-xs leading-snug line-clamp-2 text-white">
              {activeTab.title}
            </h3>
            <p className="font-mono text-[8px] text-zinc-555 break-all bg-[#0a0a0a]/90 p-2 border border-zinc-900 rounded-[12px] hover:border-zinc-800 transition-colors">
              {activeTab.url}
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-zinc-500 font-mono">Loading active tab properties...</p>
        )}
      </GlassCard>

      {/* Error alert */}
      {status === "error" && (
        <div className="flex items-start gap-2.5 p-3.5 border border-red-950 bg-red-950/20 text-red-400 rounded-[14px]">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <p className="text-[9px] leading-relaxed font-mono">{errorMessage}</p>
        </div>
      )}

      {/* Action Trigger */}
      {status === "idle" && activeTab && (
        <NeonButton variant="primary" onClick={triggerCapture} className="w-full mt-2 py-3">
          <Sparkles className="w-3.5 h-3.5" /> Capture Knowledge
        </NeonButton>
      )}

      {/* Capturing Terminal console */}
      {(status === "capturing" || status === "success") && (
        <div className="flex flex-col gap-2">
          <div className={`bg-[#050505] border p-4 rounded-[20px] font-mono text-[9px] text-zinc-305 h-38 overflow-y-auto flex flex-col gap-1 shadow-inner relative scrollbar-none transition-all duration-300 ${
            status === "success" 
              ? "border-[#FF007A]/40 shadow-[0_0_15px_rgba(255,0,122,0.15)]" 
              : "border-zinc-850"
          }`}>
            <div className="absolute top-3.5 right-4 w-1.5 h-1.5 bg-[#FF007A] rounded-full animate-ping" />
            <div className="border-b border-zinc-900/60 pb-1 mb-1.5 text-zinc-550 font-mono uppercase text-[7px] tracking-widest flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-[#FF007A]" />
              parcle memory ingest
            </div>
            {terminalLogs.map((log, index) => {
              const isSuccess = log.startsWith("✓") || log === "Success";
              const isSyncError = log.includes("sync unavailable") || log.includes("Stored locally");
              const isSaving = log.includes("Saving") || log.includes("Sending");
              return (
                <div 
                  key={index} 
                  className={`leading-normal flex items-center gap-1.5 transition-all duration-200 ${
                    isSuccess 
                      ? "text-emerald-450 font-extrabold drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                      : isSyncError
                      ? "text-amber-500 font-bold"
                      : "text-zinc-400"
                  }`}
                >
                  {isSaving && (
                    <span className="w-1 h-1 rounded-full bg-[#FF007A] animate-ping" />
                  )}
                  <span>{log}</span>
                </div>
              );
            })}
            {status === "capturing" && (
              <div className="flex items-center gap-1 text-zinc-650 mt-1">
                <span className="w-1 h-1 bg-current rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-current rounded-full animate-bounce delay-100" />
                <span className="w-1 h-1 bg-current rounded-full animate-bounce delay-200" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success notification */}
      {status === "success" && (
        <div className={`flex items-center gap-3 p-3.5 border rounded-[20px] animate-fadeIn ${
          errorMessage === "Backend sync unavailable"
            ? "bg-amber-500/5 border-amber-500/35 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            : "bg-[#FF007A]/5 border-[#FF007A]/35 text-white shadow-glow-pink"
        }`}>
          {errorMessage === "Backend sync unavailable" ? (
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#FF007A] shrink-0" />
          )}
          <div className="flex-1">
            <h4 className={`font-premium-header font-bold text-[10.5px] uppercase tracking-wider leading-none ${
              errorMessage === "Backend sync unavailable" ? "text-amber-500" : "text-[#FF007A]"
            }`}>
              {errorMessage === "Backend sync unavailable" ? "stored locally" : "stored in parcle"}
            </h4>
            <p className="text-[9px] text-zinc-300 mt-1 font-mono leading-normal">
              {errorMessage === "Backend sync unavailable"
                ? "Stored locally. Backend sync unavailable."
                : "Knowledge Block Added To Parcle Memory"}
            </p>
          </div>
          <NeonButton variant="dark" onClick={() => { setStatus("idle"); setErrorMessage(""); }} className="px-2.5 py-1 text-[8px] h-7 border-zinc-850 bg-[#0c0c0c]/85">
            Dismiss
          </NeonButton>
        </div>
      )}
    </div>
  );
};
