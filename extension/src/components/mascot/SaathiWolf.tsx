import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

interface SaathiWolfProps {
  size?: number;
  interactive?: boolean;
  triggerKey?: string;
}

export const SaathiWolf: React.FC<SaathiWolfProps> = ({ 
  size = 48, 
  interactive = true,
  triggerKey 
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [hovered, setHovered] = useState(false);
  const controls = useAnimation();

  // Periodic random blinking for the expressive eyes
  useEffect(() => {
    let timeoutId: any;
    const triggerBlink = () => {
      setIsBlinking(true);
      timeoutId = setTimeout(() => {
        setIsBlinking(false);
        scheduleNextBlink();
      }, 120);
    };

    const scheduleNextBlink = () => {
      const delay = 2000 + Math.random() * 4000; // 2 to 6 seconds
      timeoutId = setTimeout(triggerBlink, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  // Trigger wobbly slide-in animation when layout tabs change
  useEffect(() => {
    if (triggerKey) {
      controls.start({
        y: [8, -3, 0],
        rotate: [0, -4, 2, 0],
        transition: { duration: 0.5, ease: "easeOut" }
      });
    }
  }, [triggerKey, controls]);

  return (
    <motion.div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
      animate={controls}
      whileHover={interactive ? { scale: 1.03 } : {}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Premium Minimal Halo Glow (Pink-Purple gradient) */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-20 filter blur-2xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255, 0, 122, 0.3) 0%, rgba(168, 85, 247, 0.2) 60%, transparent 100%)"
        }}
        animate={{
          scale: hovered ? 1.25 : [1.0, 1.12, 1.0],
          opacity: hovered ? 0.35 : [0.18, 0.26, 0.18]
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut"
        }}
      />

      {/* Main Wolf SVG Wrapper */}
      <motion.div
        className="w-full h-full"
        animate={{
          y: [0, -3, 0] // Floating simulation
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut"
        }}
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_10px_rgba(255,0,122,0.2)]"
        >
          {/* Subtle Outer Glow Filter */}
          <defs>
            <linearGradient id="wolf-circuit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF007A" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FF007A" floodOpacity="0.75"/>
            </filter>
            <filter id="purple-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#A855F7" floodOpacity="0.75"/>
            </filter>
          </defs>

          {/* Wolf Neck / Base Body (Matte Black, clean geometry) */}
          <g id="Body">
            <path
              d="M 46,92 L 60,78 L 74,92 Z"
              fill="#0b0b0b"
              stroke="#1a1a1a"
              strokeWidth="2.5"
            />
            {/* Minimal circuit stripe down the chest */}
            <path d="M 60,78 L 60,92" stroke="#A855F7" strokeWidth="1.5" opacity="0.8" />
          </g>

          {/* Wolf Ears (Matte black with glowing neon inner traces) */}
          <g id="Ears">
            {/* Left Ear */}
            <path
              d="M 38,45 L 26,16 L 46,31 Z"
              fill="#0c0c0c"
              stroke="url(#wolf-circuit-grad)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Inner Ear Circuit Trace */}
            <path d="M 32,25 L 38,36" stroke="#A855F7" strokeWidth="1" opacity="0.9" />

            {/* Right Ear */}
            <path
              d="M 82,45 L 94,16 L 74,31 Z"
              fill="#0c0c0c"
              stroke="url(#wolf-circuit-grad)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Inner Ear Circuit Trace */}
            <path d="M 88,25 L 82,36" stroke="#FF007A" strokeWidth="1" opacity="0.9" />
          </g>

          {/* Face Shield (Matte Black, clean polygonal angles) */}
          <g id="Face">
            <path
              d="M 35,50 L 60,32 L 85,50 L 76,73 L 60,84 L 44,73 Z"
              fill="#111111"
              stroke="url(#wolf-circuit-grad)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            
            {/* Cheek Circuit Traces */}
            <path d="M 40,55 L 48,65 L 53,65" stroke="#FF007A" strokeWidth="1" opacity="0.85" />
            <path d="M 80,55 L 72,65 L 67,65" stroke="#A855F7" strokeWidth="1" opacity="0.85" />

            {/* Nose/Muzzle Core */}
            <path
              d="M 54,75 L 60,80 L 66,75 Z"
              fill="#080808"
              stroke="#A855F7"
              strokeWidth="1.5"
            />
          </g>

          {/* Expressive Glowing Eyes (Pink glowing pills) */}
          <g id="Expressive-Eyes">
            {/* Left Eye */}
            <motion.ellipse
              cx="48"
              cy="50"
              rx="4.5"
              ry="3"
              fill="#FF007A"
              filter="url(#neon-glow)"
              animate={{
                scaleY: isBlinking ? 0.08 : 1,
                originY: 50
              }}
              transition={{ duration: 0.06 }}
            />
            {/* Right Eye */}
            <motion.ellipse
              cx="72"
              cy="50"
              rx="4.5"
              ry="3"
              fill="#FF007A"
              filter="url(#neon-glow)"
              animate={{
                scaleY: isBlinking ? 0.08 : 1,
                originY: 50
              }}
              transition={{ duration: 0.06 }}
            />
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
};
