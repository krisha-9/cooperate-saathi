import React, { useState, useEffect } from "react";
import { GlassCard } from "../components/cards/GlassCard";
import { NeonButton } from "../components/buttons/NeonButton";
import { api, checkBackendDetailed } from "../services/api";
import { Settings as SettingsIcon, ShieldCheck, Database, RefreshCw, Volume2, Activity } from "lucide-react";

export const Settings: React.FC = () => {
  const [autoCapture, setAutoCapture] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [errorDetail, setErrorDetail] = useState<string>("");

  // Poll backend status
  const checkStatus = async () => {
    setIsOnline(null); // Optional: show loading state
    const res = await checkBackendDetailed();
    setIsOnline(res.isOnline);
    setErrorDetail(res.errorDetail);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    api.resetLocalMemories();
    setStatusMsg("Parcle memory successfully reset to defaults!");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const handleClear = () => {
    api.clearLocalMemories();
    setStatusMsg("Parcle memory successfully cleared!");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn font-premium-body">
      {/* Backend Connection status */}
      <GlassCard className="border-zinc-850 bg-[#080808]/40 shadow-premium">
        <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-widest mb-2">
          <span className="text-zinc-500 font-bold">backend service status</span>
          <button 
            onClick={checkStatus}
            className="flex items-center gap-1 px-2 py-1 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <Activity className="w-3 h-3" /> Retry Connection
          </button>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <span className={`px-2.5 py-1.5 rounded-full border text-[9px] font-bold self-start ${
            isOnline === true
              ? "text-emerald-450 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
              : isOnline === false
              ? "text-rose-455 border-rose-500/20 bg-rose-500/5 shadow-[0_0_8px_rgba(244,63,94,0.15)]"
              : "text-zinc-500 border-zinc-800 bg-zinc-900/5"
          }`}>
            {isOnline === true ? "🟢 Backend Connected" : isOnline === false ? "🔴 Backend Offline" : "🟡 Connecting..."}
          </span>
          {isOnline === false && errorDetail && (
            <span className="text-rose-400 text-[8px] font-mono ml-1 mt-0.5">Details: {errorDetail}</span>
          )}
        </div>
      </GlassCard>

      <GlassCard className="border-zinc-850 bg-[#080808]/40 shadow-premium">
        <div className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <SettingsIcon className="w-3.5 h-3.5 text-cyberGreen" /> configuration preferences
        </div>

        {/* Toggle Option 1 */}
        <div className="flex items-center justify-between py-2 border-b border-zinc-900/40">
          <div>
            <h4 className="text-[10px] font-bold text-white">Auto-Capture Pages</h4>
            <p className="text-[7.5px] text-zinc-500 mt-0.5">Capture documents automatically when loading tabs</p>
          </div>
          <button
            onClick={() => setAutoCapture(!autoCapture)}
            className={`w-8 h-4 rounded-full transition-all relative border border-zinc-800 ${
              autoCapture ? "bg-[#FF007A]" : "bg-zinc-950"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${
                autoCapture ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle Option 2 */}
        <div className="flex items-center justify-between py-2 mt-1">
          <div>
            <h4 className="text-[10px] font-bold text-white flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-zinc-500" /> Notification Banners
            </h4>
            <p className="text-[7.5px] text-zinc-500 mt-0.5">Show alerts when new blocks are saved in Parcle</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-8 h-4 rounded-full transition-all relative border border-zinc-800 ${
              notifications ? "bg-[#FF007A]" : "bg-zinc-950"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${
                notifications ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </GlassCard>

      <GlassCard className="border-zinc-850 bg-[#080808]/40 shadow-premium">
        <div className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-cyberGreen" /> parcle memory storage
        </div>

        <p className="text-[8.5px] text-zinc-400 leading-normal mb-3 font-sans">
          Manage your locally simulated Parcle Memory index database. This resets incident checklists and captured blocks.
        </p>

        {statusMsg && (
          <div className="flex items-center gap-2 p-2.5 border border-zinc-800 bg-[#0c0c0c]/80 text-[#FF007A] rounded-[14px] text-[8.5px] font-mono mb-3">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#FF007A]" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="flex gap-2">
          <NeonButton
            variant="secondary"
            onClick={handleReset}
            className="flex-1 py-2 text-[8px] border-zinc-850 hover:border-[#A855F7]/30"
          >
            <RefreshCw className="w-2.5 h-2.5" /> Reset Database
          </NeonButton>

          <NeonButton
            variant="dark"
            onClick={handleClear}
            className="flex-1 py-2 text-[8px] border-zinc-850 bg-[#0A0A0A]/40 text-red-400 hover:text-red-300 hover:border-red-900/30"
          >
            Clear Archive
          </NeonButton>
        </div>
      </GlassCard>
    </div>
  );
};
