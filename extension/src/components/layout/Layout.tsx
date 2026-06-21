import React, { useEffect, useRef } from "react";
import { Header } from "./Header";
import { Home as HomeIcon, PlusCircle, MessageSquare, AlertOctagon, Database, Settings as SettingsIcon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Minimal background environment with soft drifting particles, document icons, and knowledge blocks
const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth || 380);
    let height = (canvas.height = canvas.offsetHeight || 600);
    let animationFrameId: number;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    class CanvasElement {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      opacitySpeed: number;
      type: "particle" | "block" | "doc";

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.speedY = -(Math.random() * 0.05 + 0.015); // float up extremely slowly
        this.speedX = (Math.random() - 0.5) * 0.02;
        this.opacity = Math.random() * 0.12 + 0.03;
        this.opacitySpeed = (Math.random() * 0.0008 + 0.0002) * (Math.random() > 0.5 ? 1 : -1);
        this.size = Math.random() * 5 + 3;
        const types: ("particle" | "block" | "doc")[] = ["particle", "block", "doc"];
        this.type = types[Math.floor(Math.random() * types.length)];
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // Loop boundaries
        if (this.y < -20) {
          this.y = height + 20;
          this.x = Math.random() * width;
        }
        if (this.x < -20 || this.x > width + 20) {
          this.x = Math.random() * width;
        }

        // Pulse opacity
        this.opacity += this.opacitySpeed;
        if (this.opacity > 0.20 || this.opacity < 0.02) {
          this.opacitySpeed = -this.opacitySpeed;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        
        // Colors: primary (#FF007A -> rgb 255, 0, 122) or secondary (#A855F7 -> rgb 168, 85, 247)
        const isSecondary = this.type === "doc";
        const color = isSecondary ? "168, 85, 247" : "255, 0, 122";
        ctx.strokeStyle = `rgba(${color}, ${this.opacity})`;
        ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
        ctx.lineWidth = 0.8;

        if (this.type === "particle") {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === "block") {
          ctx.beginPath();
          ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
          ctx.stroke();
        } else if (this.type === "doc") {
          // Draw a tiny folded paper icon outline
          const w = this.size;
          const h = this.size * 1.35;
          ctx.beginPath();
          ctx.moveTo(this.x - w / 2, this.y - h / 2);
          ctx.lineTo(this.x + w / 2 - 2, this.y - h / 2);
          ctx.lineTo(this.x + w / 2, this.y - h / 2 + 2);
          ctx.lineTo(this.x + w / 2, this.y + h / 2);
          ctx.lineTo(this.x - w / 2, this.y + h / 2);
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    const itemsList: CanvasElement[] = Array.from({ length: 15 }, () => new CanvasElement());

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      itemsList.forEach((item) => {
        item.update();
        item.draw();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0" />;
};

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: "home", label: "home", icon: HomeIcon },
    { id: "capture", label: "teach", icon: PlusCircle },
    { id: "ask", label: "ask", icon: MessageSquare },
    { id: "search", label: "debug", icon: AlertOctagon },
    { id: "vault", label: "memory", icon: Database },
    { id: "settings", label: "settings", icon: SettingsIcon }
  ];

  return (
    <div className="relative w-[380px] h-[600px] bg-[#050505] text-white flex flex-col overflow-hidden border border-zinc-900 select-none font-premium-body">
      {/* Faint premium atmospheric blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#FF007A] opacity-[0.03] filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-44 h-44 rounded-full bg-[#A855F7] opacity-[0.03] filter blur-3xl pointer-events-none" />

      {/* Clean Premium Grid Pattern */}
      <div className="premium-grid absolute inset-0 z-0 opacity-[0.04] pointer-events-none" />
      <ParticleCanvas />

      {/* Main Extension Header */}
      <Header />

      {/* Primary Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 p-4 pb-2 scrollbar-thin">
        {children}
      </main>

      {/* Floating rounded pill navigation dock */}
      <div className="relative z-20 px-3 pb-3 bg-transparent shrink-0">
        <nav className="mx-auto bg-[#0A0A0A]/90 backdrop-blur-md border border-zinc-850 py-1.5 px-2 flex justify-between items-center rounded-full shadow-premium">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-full transition-all duration-200 ${
                  isActive ? "bg-white/5 text-cyberGreen shadow-[0_0_8px_rgba(255,0,122,0.03)] font-bold font-premium-header" : "text-zinc-500 hover:text-zinc-300 font-premium-header"
                }`}
              >
                <Icon
                  className={`w-[14px] h-[14px] transition-colors duration-200 ${
                    isActive ? "text-cyberGreen" : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                />
                <span
                  className="text-[7px] mt-0.5 tracking-tight lowercase"
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
