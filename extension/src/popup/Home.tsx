import React from "react";
import { NeonButton } from "../components/buttons/NeonButton";
import { SaathiWolf } from "../components/mascot/SaathiWolf";
import { GlassCard } from "../components/cards/GlassCard";
import { BookOpen, MessageSquare, AlertTriangle } from "lucide-react";

interface HomeProps {
  setActiveTab: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  const benefits = [
    "Capture documentation.",
    "Recall incidents.",
    "Onboard engineers instantly."
  ];

  return (
    <div className="flex flex-col items-center gap-6 py-2 text-center animate-fadeIn font-premium-body">
      
      {/* 1. Large Premium Wolf Mascot */}
      <div className="relative group flex items-center justify-center w-full h-[155px]">
        <SaathiWolf size={150} triggerKey="home" interactive={true} />
      </div>

      {/* 2. Hero copy and subtitle tags */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#FF007A] font-bold">
          powered by parcle
        </span>
        <h2 className="font-premium-header font-black text-3xl tracking-tight text-white leading-none">
          Meet Saathi.
        </h2>
        <p className="text-[11.5px] text-zinc-400 font-sans tracking-wide leading-relaxed max-w-[280px] mx-auto mt-0.5 font-medium">
          Your engineering teammate that never forgets.
        </p>
      </div>

      {/* 3. Startup features checklist list */}
      <ul className="flex flex-col gap-1.5 text-[9.5px] text-zinc-400 font-mono tracking-wide text-left mx-auto max-w-[240px]">
        {benefits.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="text-[#FF007A] font-black">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* 4. Action CTA row */}
      <div className="flex flex-col gap-2.5 w-full px-2 mt-1">
        <NeonButton 
          variant="primary" 
          onClick={() => setActiveTab("capture")} 
          className="w-full py-3.5 text-[9.5px] font-bold rounded-full"
        >
          Capture Knowledge
        </NeonButton>

        <NeonButton 
          variant="secondary" 
          onClick={() => setActiveTab("ask")} 
          className="w-full py-3.5 text-[9.5px] font-bold rounded-full"
        >
          Ask Saathi
        </NeonButton>
      </div>

      {/* 5. Core Actions Section */}
      <div className="w-full text-left flex flex-col gap-3 mt-4 px-1 border-t border-zinc-900/60 pt-5">
        <h3 className="font-premium-header font-bold text-[11px] text-zinc-400 uppercase tracking-wider pl-1.5">
          Core Capabilities
        </h3>
        
        {/* Card 1: Teach Me */}
        <GlassCard 
          onClick={() => setActiveTab("capture")} 
          className="flex gap-3.5 items-start p-4 hover:border-[#FF007A]/20 transition-all"
        >
          <div className="p-2 bg-[#FF007A]/5 border border-[#FF007A]/15 text-[#FF007A] rounded-xl shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-premium-header font-bold text-xs text-white">Teach Me</h4>
            <p className="text-[9px] text-zinc-450 leading-relaxed mt-1">
              Upload docs, capture GitHub READMEs, and store internal wiki architecture nodes in Parcle.
            </p>
          </div>
        </GlassCard>

        {/* Card 2: Ask Saathi */}
        <GlassCard 
          onClick={() => setActiveTab("ask")} 
          className="flex gap-3.5 items-start p-4 hover:border-[#A855F7]/20 transition-all"
        >
          <div className="p-2 bg-[#A855F7]/5 border border-[#A855F7]/15 text-[#A855F7] rounded-xl shrink-0 mt-0.5">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-premium-header font-bold text-xs text-white">Ask Saathi</h4>
            <p className="text-[9px] text-zinc-450 leading-relaxed mt-1">
              Ask questions about stored knowledge, search memories, and retrieve engineering decisions.
            </p>
          </div>
        </GlassCard>

        {/* Card 3: Debug Issues */}
        <GlassCard 
          onClick={() => setActiveTab("search")} 
          className="flex gap-3.5 items-start p-4 hover:border-[#FF007A]/20 transition-all"
        >
          <div className="p-2 bg-[#FF007A]/5 border border-[#FF007A]/15 text-[#FF007A] rounded-xl shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-premium-header font-bold text-xs text-white">Debug Issues</h4>
            <p className="text-[9px] text-zinc-450 leading-relaxed mt-1">
              Paste stack logs, search previous incidents, and recall successful system fixes.
            </p>
          </div>
        </GlassCard>
      </div>

    </div>
  );
};
