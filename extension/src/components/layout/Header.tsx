import React from "react";

export const Header: React.FC = () => {
  return (
    <div className="relative flex flex-col z-20 shrink-0 font-premium-header">
      {/* Brand Header */}
      <header className="relative flex items-center justify-between px-4 py-3 bg-[#080808]/95 border-b border-zinc-900/40">
        <div className="flex items-center gap-1">
          <h1 className="font-bold text-[12.5px] tracking-tight text-white flex items-center gap-0.5 leading-none">
            cooperate saathi<span className="text-[#FF007A] font-black text-[13px]">.</span>
          </h1>
        </div>

        {/* Dynamic status pill right of brand header */}
        <div className="flex items-center gap-1.5 bg-[#0C0C0C] border border-zinc-850 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF007A] shadow-[0_0_6px_#FF007A]" />
          <span className="font-premium-body text-[6.5px] font-bold text-zinc-400 tracking-wider uppercase">companion online</span>
        </div>
      </header>

      {/* Top Status Strip: powered by parcle | connected to parcle memory */}
      <div className="bg-[#080808] border-b border-zinc-900/50 py-1.5 px-4 flex justify-between items-center text-[7.5px] font-mono tracking-wide text-zinc-500">
        <span className="flex items-center gap-1 text-zinc-450 lowercase">
          powered by parcle
        </span>
        <span className="flex items-center gap-1.5 text-[#FF007A] lowercase font-semibold">
          <span className="w-1 h-1 rounded-full bg-[#FF007A] animate-pulse" />
          connected to parcle memory
        </span>
      </div>
    </div>
  );
};
