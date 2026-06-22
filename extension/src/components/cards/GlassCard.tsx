import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  glow = false,
  onClick,
  hoverable = true
}) => {
  const isInteractive = hoverable || !!onClick;

  return (
    <motion.div
      onClick={onClick}
      whileHover={isInteractive ? { 
        y: -2, 
        borderColor: "rgba(168, 85, 247, 0.3)", 
        boxShadow: "0 10px 30px -10px rgba(168, 85, 247, 0.15)" 
      } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        relative p-5 bg-card/95 border border-zinc-850 rounded-[24px] transition-colors duration-200
        ${onClick ? "cursor-pointer" : ""}
        ${glow ? "shadow-[0_0_20px_rgba(255,0,122,0.06)] border-cyberGreen/30" : "shadow-glass"}
        ${className}
      `}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
