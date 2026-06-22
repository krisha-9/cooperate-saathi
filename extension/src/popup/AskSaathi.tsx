import React, { useState, useRef, useEffect } from "react";
import { NeonButton } from "../components/buttons/NeonButton";
import { api, ChatMessage, Memory, getRelatedMemories } from "../services/api";
import { formatRelativeTime } from "../utils/timeFormatter";
import { Terminal, Send, Cpu, HelpCircle, FileText, Calendar, Database, ExternalLink, AlertTriangle, Settings } from "lucide-react";

const loadChatHistory = (): Promise<ChatMessage[]> => {
  return new Promise((resolve) => {
    const initialMsg: ChatMessage = {
      id: "init",
      sender: "saathi",
      text: "🐺 Hi, I'm Saathi. Ask me anything about your project READMEs, guides, or troubleshooting post-mortems.",
      timestamp: new Date()
    };

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get("ask_saathi_history", (result) => {
        if (result.ask_saathi_history) {
          const mapped = result.ask_saathi_history.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
          resolve(mapped);
        } else {
          resolve([initialMsg]);
        }
      });
    } else {
      try {
        const data = localStorage.getItem("ask_saathi_history");
        if (data) {
          const parsed = JSON.parse(data);
          const mapped = parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
          resolve(mapped);
        } else {
          resolve([initialMsg]);
        }
      } catch (e) {
        resolve([initialMsg]);
      }
    }
  });
};

const saveChatHistory = async (history: ChatMessage[]): Promise<void> => {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set({ ask_saathi_history: history }, () => {
        resolve();
      });
    });
  } else {
    try {
      localStorage.setItem("ask_saathi_history", JSON.stringify(history));
    } catch (e) {
      // ignore
    }
  }
};

const getStructuredResponse = (mem: Memory): string => {
  const titleLower = mem.title.toLowerCase();
  
  if (titleLower.includes("readme")) {
    return `Based on README.md:\n\nProject Quickstart & Setup:\n1. Clone the repository and navigate to root\n2. Install dependencies: \`npm install\` inside extension, and configure python virtualenv for backend\n3. Start local development servers:\n   • Backend: \`uvicorn main:app --reload\`\n   • Extension: \`npm run dev\`\n4. Build extension: \`npm run build\`\n\nRepository Structure:\n• \`extension/\`: Chrome companion source code, assets, and build manifests\n• \`backend/\`: FastAPI backend agents, memory management pipelines, and store interface\n\nSources Used:\nREADME.md\n\nConfidence:\nHigh`;
  }
  if (titleLower.includes("deployment guide")) {
    return `Based on Deployment Guide:\n\nDeployment workflow:\n1. Build application artifacts\n2. Validate environment configuration\n3. Deploy to infrastructure\n4. Run health checks\n5. Monitor rollout status\n\nSources Used:\nDeployment Guide\n\nConfidence:\nHigh`;
  }
  if (titleLower.includes("auth architecture")) {
    return `Based on Auth Architecture:\n\nAuthentication Flow & JWT Design:\n1. User Login: Clients exchange user credentials for a secured JWT token\n2. Token Validation: API gateway intercepts request headers and validates JWT signature via public keys\n3. Token Storage: Secure localStorage or httpOnly cookie strategies are recommended\n4. Expiry & Refresh: Short-lived access tokens (15 mins) and long-lived database-backed refresh tokens (7 days)\n\nSources Used:\nAuth Architecture\n\nConfidence:\nHigh`;
  }
  if (titleLower.includes("redis incident")) {
    return `Based on Redis Incident:\n\nRedis connection pool exhaustion details:\n• Root Cause: Unreleased Redis client connection instances inside middleware classes under heavy spike traffic\n• Impact: Connection timeout latency spikes followed by client HTTP 500 errors\n• Resolution: Wrapped client connections inside strict try/finally blocks to guarantee cleanup back to the pool, and optimized client connection timeout configs\n\nSources Used:\nRedis Incident\n\nConfidence:\nHigh`;
  }
  if (titleLower.includes("gateway")) {
    return `Based on API Gateway ADR:\n\nArchitectural Decisions & Routing:\n1. Gateway Selection: Envoy proxy selected for edge routing and rate limiting\n2. Routing Policies: Path-based routing rules configured for microservice endpoints\n3. Protocol Support: HTTP/2 and gRPC protocol transit enabled for internal services\n4. Rate Limiting: Redis-backed token bucket algorithm enforced globally at 100 reqs/sec per client IP\n\nSources Used:\nAPI Gateway ADR\n\nConfidence:\nHigh`;
  }
  if (titleLower.includes("pipeline") || titleLower.includes("ci/cd")) {
    return `Based on CI/CD Pipeline Setup:\n\nPipeline Workflow Steps:\n1. Code Linting & Format: Runs \`eslint\` and \`prettier\` verification checks\n2. TypeScript Check: Validates typings using \`tsc --noEmit\`\n3. Automated Unit Testing: Runs Jest/Vitest test suites\n4. Containerization: Builds Docker image tag matching commit SHA\n5. Staging Deploy: Deploys container to preview environment automatically\n\nSources Used:\nCI/CD Pipeline Setup\n\nConfidence:\nHigh`;
  }
  if (titleLower.includes("docker compose") || titleLower.includes("docker-compose")) {
    return `Based on Docker Compose Local Dev:\n\nLocal Services Configuration:\n1. PostgreSQL: Database service exposed on localhost:5432 with persistence volume mounts\n2. Redis: In-memory store on localhost:6379 for caching and task queues\n3. Local Stack / S3: Mock AWS infrastructure for bucket attachments\n4. App Backend: Hot-reloading server running on port 8000\n\nSources Used:\nDocker Compose Local Dev\n\nConfidence:\nHigh`;
  }
  if (titleLower.includes("kubernetes") || titleLower.includes("k8s")) {
    return `Based on Kubernetes Manifests ADR:\n\nDeployment Manifest Design:\n1. Packaging: Helm v3 selected to manage environment overrides (dev, staging, prod)\n2. Scaling: Horizontal Pod Autoscaler (HPA) configured to scale pods based on CPU/Memory thresholds\n3. Probes: Health status checks defined using custom liveness/readiness endpoint configurations\n4. Secrets Management: Externalized environment secrets using SealedSecrets operators\n\nSources Used:\nKubernetes Manifests ADR\n\nConfidence:\nHigh`;
  }
  if (titleLower.includes("migration") || titleLower.includes("postgres")) {
    return `Based on PostgreSQL Migration v3:\n\nSchema Migration Steps:\n1. Schema Audit: Analyzes table constraints and column alterations\n2. Migration Generation: Executes Alembic schema generator\n3. Zero-Downtime Rollout: Executes migration script with transaction locks minimized\n4. Rollback Plan: Scripts reverse migrations to restore schema in case of failure\n\nSources Used:\nPostgreSQL Migration v3\n\nConfidence:\nHigh`;
  }
  if (titleLower.includes("s3") || titleLower.includes("backup")) {
    return `Based on AWS S3 Backup Runbook:\n\nData Backup & Retention Procedures:\n1. Automated Backup: Cron job schedules hourly DB snapshot exports\n2. Storage Tiering: Archive snapshots uploaded to AWS S3 Standard\n3. Lifecycle Policy: Transitions snapshots to Glacier after 30 days, deleted after 90 days\n4. Recovery Drill: Restores database dump in a test sandbox weekly to verify snapshot integrity\n\nSources Used:\nAWS S3 Backup Runbook\n\nConfidence:\nHigh`;
  }
  if (titleLower.includes("elasticsearch") || titleLower.includes("tuning")) {
    return `Based on Elasticsearch Node Tuning:\n\nPerformance Configuration Details:\n• Heap Size Allocations: Configured JVM heap limit to exactly 50% of available server RAM\n• Garbage Collection: Set G1GC collector defaults for low-latency search queries\n• Shard Allocation: Distributed shards across nodes to prevent hotspot routing issues\n\nSources Used:\nElasticsearch Node Tuning\n\nConfidence:\nHigh`;
  }
  if (titleLower.includes("monitoring") || titleLower.includes("grafana")) {
    return `Based on Monitoring Grafana Config:\n\nObservability Dashboard Layouts:\n1. CPU & Memory Utilization: Tracks container loads across core services\n2. Connection Pool Metrics: Graphs active vs idle Redis and PostgreSQL client connections\n3. Request Latency: Measures HTTP request durations via p50, p90, p99 percentiles\n4. Alarm Routing: AlertManager routes high severity incidents to Slack and PagerDuty\n\nSources Used:\nMonitoring Grafana Config\n\nConfidence:\nHigh`;
  }

  // Fallback for custom captured pages
  return `Based on ${mem.title}:\n\nOverview:\n• ${mem.summary || "This page contains engineering documentation related to project setup and configurations."}\n\nIngestion Details:\n• Source: ${mem.source}\n• URL: ${mem.source_url}\n\nSources Used:\n${mem.title}\n\nConfidence:\n${mem.confidence >= 0.9 ? "High" : "Medium"}`;
};

export const AskSaathi: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingLogs, setTypingLogs] = useState<string[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history & memories on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const mems = await api.getMemories();
        setMemories(mems);
      } catch (err) {
        console.error("Failed to load memories:", err);
      }

      const history = await loadChatHistory();
      setMessages(history);
    };
    initData();
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, typingLogs]);

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

  const performSearch = (query: string, memList: Memory[]) => {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return [];

    const stopWords = new Set(["how", "what", "is", "about", "me", "show", "the", "does", "do", "you", "a", "an", "to", "in", "and", "of", "for", "on", "with", "at", "by"]);
    const words = cleanQuery.split(/\s+/).filter((w) => w && !stopWords.has(w));

    if (words.length === 0) {
      words.push(cleanQuery);
    }

    const scored = memList.map((mem) => {
      let score = 0;
      const title = mem.title.toLowerCase();
      const summary = (mem.summary || "").toLowerCase();
      const source = mem.source.toLowerCase();
      const type = mem.memory_type.toLowerCase();

      words.forEach((word) => {
        if (title.includes(word)) score += 3;
        if (summary.includes(word)) score += 2;
        if (source.includes(word)) score += 1;
        if (type.includes(word)) score += 1;
      });

      return { mem, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.mem);
  };

  const getSuggestedQuestions = (memList: Memory[]): string[] => {
    const available = memList.filter((m) => m.title);
    if (available.length === 0) {
      return ["Explain JWT auth flow", "Fix Redis timeout", "PostgreSQL config issues"];
    }
    return available.slice(0, 3).map((mem) => {
      const title = mem.title;
      if (title.toLowerCase().includes("readme")) {
        return `Summarize ${title}`;
      }
      if (title.toLowerCase().includes("incident") || mem.memory_type === "incident") {
        return `What happened in ${title}?`;
      }
      return `Explain ${title}`;
    });
  };

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    await saveChatHistory(updatedMessages);
    setInputValue("");
    setIsTyping(true);
    setTypingLogs([]);

    // Timed transition logs (each step waits 600ms)
    setTypingLogs(["Searching Parcle Memory..."]);
    await new Promise((r) => setTimeout(r, 600));
    setTypingLogs((prev) => [...prev, "Analyzing engineering knowledge..."]);
    await new Promise((r) => setTimeout(r, 600));
    setTypingLogs((prev) => [...prev, "Generating answer..."]);
    await new Promise((r) => setTimeout(r, 600));

    try {
      let answerText = "";
      let isFallback = false;

      try {
        const backendRes = await api.askQuestion(text);
        answerText = backendRes.answer;
      } catch (backendErr) {
        console.warn("Ask backend offline, utilizing local simulation fallback.", backendErr);
        isFallback = true;
        
        const matches = performSearch(text, memories);
        if (matches.length > 0) {
          answerText = getStructuredResponse(matches[0]);
        } else {
          answerText = `🐺 I could not find relevant knowledge inside Parcle Memory.\n\nTry:\n• Capture more documentation\n• Search a different topic\n• Check Memory Vault`;
        }
      }

      const matches = performSearch(text, memories);
      const references = matches.slice(0, 3).map((m) => ({
        title: m.title,
        url: m.source_url,
        type: m.memory_type
      }));

      const finalText = isFallback
        ? `⚠️ Unable to reach AI service. Local mode active.\n\n${answerText}`
        : answerText;

      const saathiMsg: ChatMessage = {
        id: `saathi-${Date.now()}`,
        sender: "saathi",
        text: finalText,
        timestamp: new Date(),
        references: references
      };

      const finalMessages = [...updatedMessages, saathiMsg];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "saathi",
        text: "Error: Backend unavailable. Local mode active.",
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
    } finally {
      setIsTyping(false);
      setTypingLogs([]);
    }
  };

  const suggestions = getSuggestedQuestions(memories);
  const detailsModalConfig = selectedMemory ? getMemoryTypeConfig(selectedMemory.memory_type) : null;
  const DetailsModalTypeIcon = detailsModalConfig ? detailsModalConfig.icon : HelpCircle;

  return (
    <div className="flex flex-col h-[505px] animate-fadeIn justify-between font-premium-body relative">
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
              className={`p-3.5 text-[9.5px] leading-relaxed rounded-[20px] whitespace-pre-wrap ${
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
                    Sources Used:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {msg.references.map((ref: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const match = memories.find((m) => m.title === ref.title || m.source_url === ref.url);
                          if (match) {
                            setSelectedMemory(match);
                          } else {
                            setSelectedMemory({
                              id: `ref-${idx}`,
                              title: ref.title,
                              memory_type: ref.type || "documentation",
                              source_url: ref.url,
                              created_at: new Date().toISOString(),
                              confidence: 0.95,
                              source: "github.com",
                              summary: "Dynamic source context fetched from memory."
                            });
                          }
                        }}
                        className="px-2.5 py-1 text-[8px] font-mono border border-zinc-850 hover:border-[#FF007A]/30 bg-[#050505]/75 text-[#FF007A] hover:text-white rounded-full transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <FileText className="w-2.5 h-2.5 text-[#FF007A]" />
                        <span>{ref.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Related Knowledge Section under Sources Used */}
                  {(() => {
                    const firstRef = msg.references[0];
                    const refMem = firstRef ? memories.find((m) => m.title === firstRef.title || m.source_url === firstRef.url) : null;
                    const relatedToChat = refMem ? getRelatedMemories(refMem, memories) : [];
                    if (relatedToChat.length === 0) return null;

                    return (
                      <div className="mt-2 pt-1.5 border-t border-zinc-900/40">
                        <span className="text-[7px] font-bold text-zinc-550 uppercase tracking-widest font-premium-header block mb-1">
                          Related Knowledge:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {relatedToChat.map((rm) => (
                            <button
                              key={rm.id}
                              type="button"
                              onClick={() => setSelectedMemory(rm)}
                              className="px-2.5 py-1 text-[7.5px] font-mono border border-zinc-850 hover:border-[#FF007A]/30 bg-[#0c0c0c]/85 text-zinc-400 hover:text-white rounded-full transition-all flex items-center gap-1 shrink-0"
                            >
                              <span className="text-[#FF007A] font-extrabold">•</span>
                              <span>{rm.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            
            {/* Timestamp */}
            <span className="text-[7px] text-zinc-600 font-mono mt-1 px-2">
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
      {messages.length <= 1 && !isTyping && (
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

      {/* Details Modal */}
      {selectedMemory && detailsModalConfig && (
        <div 
          className="absolute inset-0 bg-[#050505]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-overlayFade"
          onClick={() => setSelectedMemory(null)}
        >
          <div 
            className="w-full max-h-[95%] bg-[#0a0a0a] border border-[#FF007A]/30 rounded-[24px] flex flex-col shadow-[0_0_25px_rgba(255,0,122,0.15)] overflow-hidden font-premium-body animate-modalOpen"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between shrink-0">
              <span className="font-mono text-[8px] text-[#FF007A] uppercase tracking-widest flex items-center gap-1.5">
                <Database className="w-3 h-3" /> memory details
              </span>
              <button 
                onClick={() => setSelectedMemory(null)}
                className="text-zinc-500 hover:text-white font-mono text-[9px] border border-zinc-850 px-2.5 py-0.5 rounded-full hover:border-zinc-700 transition-colors"
              >
                CLOSE
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3.5 scrollbar-thin text-[9.5px]">
              {/* Title */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1">title</span>
                <h3 className="font-premium-header font-bold text-[11px] text-white leading-snug">
                  {selectedMemory.title}
                </h3>
              </div>

              {/* Type */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1">type</span>
                <span className={`text-[8px] font-mono border px-2 py-0.5 rounded-[4px] uppercase tracking-wider font-semibold inline-flex items-center gap-1 ${detailsModalConfig.color}`}>
                  <DetailsModalTypeIcon className="w-3.5 h-3.5" />
                  {detailsModalConfig.label}
                </span>
              </div>

              {/* Source Domain */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1">source domain</span>
                <p className="text-zinc-400 font-mono text-[8px]">
                  {selectedMemory.source}
                </p>
              </div>

              {/* Captured Time */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1">captured time</span>
                <p className="text-zinc-400 font-mono text-[8px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#FF007A]" /> {formatRelativeTime(selectedMemory.created_at)} ({selectedMemory.created_at})
                </p>
              </div>

              {/* URL with Copy */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1">source url</span>
                <div className="flex flex-col gap-1.5">
                  <a 
                    href={selectedMemory.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[8px] text-[#FF007A] break-all bg-[#050505] p-2 border border-zinc-900 rounded-[12px] hover:border-zinc-800 transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="truncate flex-1">{selectedMemory.source_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMemory.source_url);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="w-full text-center py-2 rounded-full border border-zinc-850 hover:border-zinc-700 bg-[#FF007A]/5 hover:bg-[#FF007A]/10 text-zinc-300 hover:text-white transition-all text-[8px] font-mono tracking-wider font-bold uppercase shrink-0"
                  >
                    {copiedUrl ? "✓ Copied to clipboard" : "Copy Source URL"}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1">summary</span>
                <p className="text-zinc-350 bg-[#050505] p-3 border border-zinc-900 rounded-[12px] leading-relaxed whitespace-pre-wrap">
                  {selectedMemory.summary || "No summary available for this memory block."}
                </p>
              </div>

              {/* Related Knowledge Section */}
              <div>
                <span className="text-zinc-550 font-bold block lowercase text-[7.5px] tracking-wider mb-1.5">Related Knowledge</span>
                {getRelatedMemories(selectedMemory, memories).length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {getRelatedMemories(selectedMemory, memories).map((rm) => (
                      <button
                        key={rm.id}
                        type="button"
                        onClick={() => {
                          setSelectedMemory(rm);
                          setCopiedUrl(false);
                        }}
                        className="w-full text-left p-2.5 bg-[#050505] border border-zinc-900 rounded-[12px] hover:border-[#FF007A]/40 transition-colors flex items-center justify-between text-[8px] font-mono text-[#FF007A] group/related"
                      >
                        <span className="truncate pr-2">{rm.title}</span>
                        <span className="text-zinc-650 group-hover/related:text-[#FF007A] transition-colors shrink-0">→</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[8px] font-mono text-zinc-555 italic bg-[#050505] p-2.5 border border-zinc-900 rounded-[12px]">
                    No related knowledge found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
