import React from "react";
import { motion } from "framer-motion";

interface NeonButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  onClick,
  children,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button"
}) => {
  const getStyles = () => {
    switch (variant) {
      case "primary":
        // Filled pink-to-purple gradient
        return "bg-gradient-to-r from-[#FF007A] to-[#A855F7] text-white border-transparent shadow-[0_3px_12px_rgba(255,0,122,0.2)] hover:shadow-[0_4px_18px_rgba(255,0,122,0.35)]";
      case "secondary":
        // Outlined design
        return "border border-zinc-800 text-white bg-[#0B0B0B] hover:bg-[#121212] hover:border-zinc-700";
      case "dark":
        // Dark muted styling
        return "border border-zinc-850 text-zinc-400 bg-[#0C0C0C] hover:text-white hover:border-zinc-850 hover:bg-[#121212]";
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.015, y: -0.5 }}
      whileTap={disabled ? {} : { scale: 0.985 }}
      className={`
        relative px-5 py-2.5 font-premium-header text-[9.5px] font-bold tracking-wider transition-all duration-200
        rounded-full disabled:opacity-40 disabled:pointer-events-none select-none border
        ${getStyles()}
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-1.5">
        {children}
      </span>
    </motion.button>
  );
};
