import React, { useState, useRef, useEffect } from "react";
import { NeonButton } from "../components/buttons/NeonButton";
import { api, ChatMessage } from "../services/api";
import { Terminal, Send, Cpu, HelpCircle, FileText } from "lucide-react";

export const AskSaathi: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "saathi",
      text: "🐺 Hi, I'm Saathi. Ask me anything about your project READMEs, guides, or troubleshooting post-mortems.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingLogs, setTypingLogs] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Explain JWT auth flow",
    "Fix Redis timeout",
    "PostgreSQL config issues"
  ];

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, typingLogs]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    setTypingLogs([]);

    const steps = [
      "🐺 Searching Parcle Memory...",
      "🐺 Found 3 related memories...",
      "🐺 Synthesizing response...",
    ];

    // Animate thinking steps
    for (let i = 0; i < steps.length; i++) {
      setTypingLogs((prev) => [...prev, steps[i]]);
      await new Promise((r) => setTimeout(r, 450));
    }

    try {
      const response = await api.askSaathi(text);
      
      const saathiMsg: ChatMessage = {
        id: `saathi-${Date.now()}`,
        sender: "saathi",
        text: response.answer,
        timestamp: new Date(),
        references: response.sources
      };

      setMessages((prev) => [...prev, saathiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "saathi",
        text: "Error querying Parcle Memory connection.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setTypingLogs([]);
    }
  };

  return (
    <div className="flex flex-col h-[505px] animate-fadeIn justify-between font-premium-body">
      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === "user" ? "self-end items-end" : "self-start items-start"
            }`}
          >
            {/* Bubble */}
            <div
              className={`p-3.5 text-[9.5px] leading-relaxed rounded-[20px] ${
                msg.sender === "user"
                  ? "bg-[#FF007A]/5 border border-[#FF007A]/20 text-white"
                  : "bg-[#0c0c0c] border border-zinc-850 text-zinc-300"
              }`}
            >
              {msg.text}

              {/* Message Sources (Parcle retrieval origins) */}
              {msg.references && msg.references.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-zinc-900/60 flex flex-col gap-1.5">
                  <span className="text-[7.5px] font-bold text-[#FF007A] uppercase tracking-widest font-premium-header block">
                    memory source:
                  </span>
                  <div className="flex flex-col gap-1">
                    {msg.references.map((ref: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[8px] text-zinc-400">
                        <FileText className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FF007A] hover:underline truncate"
                        >
                          {ref.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Timestamp */}
            <span className="text-[7px] text-zinc-650 font-mono mt-1 px-2">
              {msg.sender === "user" ? "you" : "saathi"} • {" "}
              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}

        {/* Dynamic Agentic Thinking Trace Logs */}
        {isTyping && (
          <div className="self-start flex flex-col items-start max-w-[85%]">
            <div className="bg-[#0c0c0c] border border-zinc-850 p-3.5 rounded-[20px] font-mono text-[8px] text-zinc-400 flex flex-col gap-1 w-64 shadow-premium">
              <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-1 mb-1 font-bold text-[#FF007A]">
                <Cpu className="w-3.5 h-3.5 text-[#FF007A] animate-spin" />
                <span className="tracking-widest font-premium-header">saathi companion</span>
              </div>
              {typingLogs.map((log, idx) => (
                <div key={idx} className="text-zinc-300 leading-normal">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Chips */}
      {messages.length === 1 && !isTyping && (
        <div className="flex flex-col gap-1.5 py-2 border-t border-zinc-900 mt-2">
          <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-zinc-500" /> suggested questions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSubmit(suggestion)}
                className="text-[8px] font-sans border border-zinc-850 hover:border-[#FF007A]/30 bg-[#0c0c0c]/85 hover:bg-[#121212]/85 text-zinc-400 hover:text-white px-2.5 py-1.5 transition-all duration-200 rounded-full"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(inputValue);
        }}
        className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-900/60"
      >
        <div className="relative flex-1 flex items-center">
          <Terminal className="absolute left-3 w-3.5 h-3.5 text-zinc-650 pointer-events-none" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything about your project..."
            disabled={isTyping}
            className="w-full pl-9 pr-3 py-2 bg-[#0c0c0c]/50 border border-zinc-850 text-[10px] text-white font-sans placeholder-zinc-700 focus:outline-none focus:border-[#FF007A]/30 focus:shadow-[0_0_10px_rgba(255,0,122,0.03)] rounded-[20px]"
          />
        </div>
        <NeonButton
          type="submit"
          variant="primary"
          disabled={!inputValue.trim() || isTyping}
          className="px-3.5 py-2 h-full shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </NeonButton>
      </form>
    </div>
  );
};
