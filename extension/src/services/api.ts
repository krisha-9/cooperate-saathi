// CoOperate Saathi API Client Service Layer
// Interfaces with FastAPI backend at http://localhost:8000 or falls back to local Parcle Memory simulations.

export interface ChatMessage {
  id: string;
  sender: "user" | "saathi";
  text: string;
  timestamp: Date;
  references?: { title: string; url: string; type?: string }[];
}

export interface Memory {
  id: string;
  title: string;
  memory_type: "documentation" | "architecture" | "incident" | "discussion" | "setup_guide";
  source_url: string;
  created_at: string;
  confidence: number;
  source: string; // File path or Slack channel, etc.
  summary?: string;
}

export interface CapturedMemory {
  id: string;
  title: string;
  url: string;
  summary: string;
  capturedAt: string;
  type: "documentation";
  source: string;
}

const getStoredMemories = (): Promise<CapturedMemory[]> => {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get("captured_memories", (result) => {
        resolve(result.captured_memories || []);
      });
    } else {
      try {
        const localData = localStorage.getItem("captured_memories");
        resolve(localData ? JSON.parse(localData) : []);
      } catch (e) {
        resolve([]);
      }
    }
  });
};

const saveMemoryToStorage = async (memory: CapturedMemory): Promise<void> => {
  const current = await getStoredMemories();
  const updated = [memory, ...current];
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set({ captured_memories: updated }, () => {
        resolve();
      });
    });
  } else {
    try {
      localStorage.setItem("captured_memories", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  }
};


export interface Incident {
  id: string;
  title: string;
  errorQuery: string;
  rootCause: string;
  resolution: string;
  severity: "high" | "medium" | "low";
  timestamp: string;
  source: string;
  confidence: number;
  lessonsLearned?: string[];
  recommendedActions?: string[];
}

export interface ChatResponse {
  answer: string;
  sources: { title: string; url: string; type?: string }[];
}

const BACKEND_URL = "http://localhost:8000";

const getRelativeISO = (offsetMs: number): string => {
  return new Date(Date.now() - offsetMs).toISOString();
};

// Mock Parcle Memory Database (Person 1 Specs)
let MOCK_MEMORIES: Memory[] = [
  {
    id: "mem_001",
    title: "README.md",
    memory_type: "documentation",
    source_url: "https://github.com/org/cooperate/blob/main/README.md",
    created_at: getRelativeISO(5 * 60 * 1000), // 5 mins ago
    confidence: 0.98,
    source: "github.com/org/cooperate",
    summary: "Main repository documentation containing quickstart instructions, repository layout, and design conventions."
  },
  {
    id: "mem_002",
    title: "Deployment Guide",
    memory_type: "setup_guide",
    source_url: "https://wiki.internal.cooperate/ops/deploy-v3",
    created_at: getRelativeISO(2 * 60 * 60 * 1000), // 2 hours ago
    confidence: 0.94,
    source: "wiki.internal.cooperate",
    summary: "Operational workflows, deployment configurations, and rollout pipelines."
  },
  {
    id: "mem_003",
    title: "Auth Architecture",
    memory_type: "architecture",
    source_url: "https://wiki.internal.cooperate/architecture/auth-adr-042",
    created_at: getRelativeISO(60 * 60 * 1000), // 1 hour ago
    confidence: 0.96,
    source: "wiki.internal.cooperate/architecture",
    summary: "Design document detailing JWT token validation, OAuth flows, and storage strategies."
  },
  {
    id: "mem_004",
    title: "Redis Incident",
    memory_type: "incident",
    source_url: "https://github.com/org/cooperate/issues/849",
    created_at: getRelativeISO(25 * 60 * 60 * 1000), // 25 hours ago (yesterday)
    confidence: 0.99,
    source: "github.com/org/cooperate/issues",
    summary: "Post-mortem investigation on Redis connection pool exhaustion."
  },
  {
    id: "mem_005",
    title: "API Gateway ADR",
    memory_type: "architecture",
    source_url: "https://wiki.internal.cooperate/architecture/gateway-adr-015",
    created_at: getRelativeISO(4 * 24 * 60 * 60 * 1000), // 4 days ago
    confidence: 0.89,
    source: "wiki.internal.cooperate/architecture",
    summary: "Architectural decision record outlining API Gateway selections and routing rules."
  },
  {
    id: "mem_006",
    title: "CI/CD Pipeline Setup",
    memory_type: "setup_guide",
    source_url: "https://github.com/org/cooperate/actions/deploy-workflows",
    created_at: getRelativeISO(6 * 24 * 60 * 60 * 1000), // 6 days ago
    confidence: 0.92,
    source: "github.com/org/cooperate/actions"
  },
  {
    id: "mem_007",
    title: "Docker Compose Local Dev",
    memory_type: "documentation",
    source_url: "https://github.com/org/cooperate/blob/main/docker-compose.yml",
    created_at: getRelativeISO(8 * 24 * 60 * 60 * 1000), // 8 days ago
    confidence: 0.91,
    source: "github.com/org/cooperate"
  },
  {
    id: "mem_008",
    title: "Kubernetes Manifests ADR",
    memory_type: "architecture",
    source_url: "https://wiki.internal.cooperate/architecture/k8s-adr-009",
    created_at: getRelativeISO(12 * 24 * 60 * 60 * 1000), // 12 days ago
    confidence: 0.95,
    source: "wiki.internal.cooperate/architecture"
  },
  {
    id: "mem_009",
    title: "PostgreSQL Migration v3",
    memory_type: "documentation",
    source_url: "https://github.com/org/cooperate/pull/412",
    created_at: getRelativeISO(15 * 24 * 60 * 60 * 1000), // 15 days ago
    confidence: 0.88,
    source: "github.com/org/cooperate/pulls"
  },
  {
    id: "mem_010",
    title: "AWS S3 Backup Runbook",
    memory_type: "setup_guide",
    source_url: "https://wiki.internal.cooperate/ops/s3-backup-recovery",
    created_at: getRelativeISO(20 * 24 * 60 * 60 * 1000), // 20 days ago
    confidence: 0.93,
    source: "wiki.internal.cooperate/ops"
  },
  {
    id: "mem_011",
    title: "Elasticsearch Node Tuning",
    memory_type: "incident",
    source_url: "https://github.com/org/cooperate/issues/722",
    created_at: getRelativeISO(25 * 24 * 60 * 60 * 1000), // 25 days ago
    confidence: 0.87,
    source: "github.com/org/cooperate/issues"
  },
  {
    id: "mem_012",
    title: "Monitoring Grafana Config",
    memory_type: "setup_guide",
    source_url: "https://wiki.internal.cooperate/ops/grafana-alerts",
    created_at: getRelativeISO(30 * 24 * 60 * 60 * 1000), // 30 days ago
    confidence: 0.90,
    source: "wiki.internal.cooperate/ops"
  }
];

let MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc_001",
    title: "Redis Pool Exhaustion Timeout",
    errorQuery: "Redis timeout",
    rootCause: "Unreleased Redis connection instances in API controllers during authentication validations under spike traffic.",
    resolution: "Implemented try/finally blocks to guarantee client connections release back to pool. Configured client read-timeout limits.",
    severity: "high",
    timestamp: getRelativeISO(25 * 60 * 60 * 1000), // 25 hours ago (yesterday), matches mem_004
    source: "Parcle Incident Memory (Issue #849)",
    confidence: 0.99,
    lessonsLearned: [
      "Always release Redis clients",
      "Add timeout monitoring",
      "Configure retry logic"
    ],
    recommendedActions: [
      "Check Redis health",
      "Verify connection pool",
      "Review authentication service"
    ]
  },
  {
    id: "inc_002",
    title: "Database Server Connection Refused (Port 5432)",
    errorQuery: "ECONNREFUSED",
    rootCause: "Database credentials mismatch on Kubernetes stateful pods after token refresh rotation script.",
    resolution: "Forced update check of local secrets and restarted API deployment: `kubectl rollout restart deployment/api-server`.",
    severity: "high",
    timestamp: getRelativeISO(15 * 24 * 60 * 60 * 1000), // 15 days ago, matches mem_009
    source: "Parcle Incident Memory (DB Migration v3)",
    confidence: 0.94,
    lessonsLearned: [
      "Validate secrets lifecycle",
      "Automate deployment health check restarts",
      "Set longer database rotation buffers"
    ],
    recommendedActions: [
      "Check database container logs",
      "Verify rotation token secrets",
      "Restart api-server deployment pods"
    ]
  },
  {
    id: "inc_003",
    title: "CI/CD Build Failure: ESLint rule blockers",
    errorQuery: "Deployment failed",
    rootCause: "TypeScript compilation failed check in pre-commit hook during CI/CD build due to unused variables inside a newly introduced auth hook.",
    resolution: "Cleaned up unused variables. Updated `next.config.js` to prevent build blockers during critical hotfixes.",
    severity: "medium",
    timestamp: getRelativeISO(5 * 60 * 1000), // 5 mins ago, matches mem_001
    source: "Parcle Incident Memory (CI-Worker-02)",
    confidence: 0.89,
    lessonsLearned: [
      "Fix unused imports before checking in code",
      "Sync lint rules across local and remote hooks",
      "Do not ignore pre-commit typescript alerts"
    ],
    recommendedActions: [
      "Review commit hook typescript warnings",
      "Re-run local eslint check on authentication code",
      "Clean up unused hooks"
    ]
  }
];

// Helper to determine if backend is online
export const checkBackendOnline = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${BACKEND_URL}/memories`, { method: "HEAD", signal: AbortSignal.timeout(600) });
    return res.ok || res.status === 405 || res.status === 404;
  } catch (err) {
    return false;
  }
};

export const api = {
  // 1. Capture Page (POST /ingest-page)
  async capturePage(page: {
    title: string;
    url: string;
    domain?: string;
    headings?: string[];
    content: string;
  }): Promise<{ success: boolean; memory: Memory }> {
    let hostname = page.domain || "";
    if (!hostname) {
      try {
        hostname = new URL(page.url).hostname;
      } catch (e) {
        hostname = "unknown.domain";
      }
    }

    const summary = `This page contains engineering documentation related to ${page.title || "deployment workflows"} and project setup instructions.`;
    const id = `mem_${Date.now().toString().slice(-4)}`;
    const capturedAt = new Date().toISOString();

    const capturedMem: CapturedMemory = {
      id,
      title: page.title,
      url: page.url,
      summary,
      capturedAt,
      type: "documentation",
      source: hostname
    };

    // Save to local storage
    await saveMemoryToStorage(capturedMem);

    try {
      const response = await fetch(`${BACKEND_URL}/ingest-page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });

      if (!response.ok) throw new Error("HTTP error " + response.status);
      const data = await response.json();
      
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("parcle-memory-updated"));
      }

      return { success: true, memory: data };
    } catch (err) {
      console.warn("[Saathi Link] FastAPI backend offline, simulating local Parcle Memory storage.", err);
      
      const mockMem: Memory = {
        id,
        title: page.title,
        memory_type: "documentation",
        source_url: page.url,
        created_at: capturedAt,
        confidence: 0.95,
        source: hostname
      };
      MOCK_MEMORIES.unshift(mockMem);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("parcle-memory-updated"));
      }

      return { success: true, memory: mockMem };
    }
  },

  // 2. Ask Saathi (POST /ask)
  async askSaathi(query: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("HTTP error " + response.status);
      return await response.json();
    } catch (err) {
      console.warn("[Saathi Link] FastAPI backend offline, triggering fallback response.", err);
      await new Promise((r) => setTimeout(r, 1000));
      
      return {
        answer: "🐺 I remember this. Memory retrieval will be connected soon.",
        sources: [
          { title: "README.md", url: "https://github.com/org/cooperate/blob/main/README.md", type: "documentation" }
        ]
      };
    }
  },

  // 3. Search Incidents (POST /search-incidents)
  async searchIncident(query: string): Promise<Incident[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/search-incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("HTTP error " + response.status);
      return await response.json();
    } catch (err) {
      console.warn("[Saathi Link] FastAPI backend offline, simulating incident retrieval.", err);
      await new Promise((r) => setTimeout(r, 600));
      
      const q = query.toLowerCase().trim();
      if (!q) return [];
      
      return MOCK_INCIDENTS.filter(
        (inc) =>
          inc.title.toLowerCase().includes(q) ||
          inc.errorQuery.toLowerCase().includes(q) ||
          inc.rootCause.toLowerCase().includes(q) ||
          inc.resolution.toLowerCase().includes(q)
      );
    }
  },

  // 4. Get Memories (GET /memories)
  async getMemories(): Promise<Memory[]> {
    const localCaptured = await getStoredMemories();
    const mappedLocal: Memory[] = localCaptured.map((m) => ({
      id: m.id,
      title: m.title,
      memory_type: m.type,
      source_url: m.url,
      created_at: m.capturedAt,
      confidence: 0.95,
      source: m.source,
      summary: m.summary
    }));

    try {
      const response = await fetch(`${BACKEND_URL}/memories`);
      if (!response.ok) throw new Error("HTTP error " + response.status);
      const data = await response.json();
      
      const allMems = [...mappedLocal, ...data];
      const seenIds = new Set<string>();
      return allMems.filter((mem) => {
        if (seenIds.has(mem.id)) return false;
        seenIds.add(mem.id);
        return true;
      });
    } catch (err) {
      console.warn("[Saathi Link] FastAPI backend offline, loading memories list from Parcle mocks.", err);
      
      const allMems = [...mappedLocal, ...MOCK_MEMORIES];
      const seenIds = new Set<string>();
      return allMems.filter((mem) => {
        if (seenIds.has(mem.id)) return false;
        seenIds.add(mem.id);
        return true;
      });
    }
  },

  clearLocalMemories() {
    MOCK_MEMORIES = [];
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove("captured_memories");
    } else {
      try {
        localStorage.removeItem("captured_memories");
      } catch (e) {
        // ignore
      }
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("parcle-memory-updated"));
    }
  },

  resetLocalMemories() {
    MOCK_MEMORIES = [
      {
        id: "mem_001",
        title: "README.md",
        memory_type: "documentation",
        source_url: "https://github.com/org/cooperate/blob/main/README.md",
        created_at: getRelativeISO(5 * 60 * 1000),
        confidence: 0.98,
        source: "github.com/org/cooperate",
        summary: "Main repository documentation containing quickstart instructions, repository layout, and design conventions."
      },
      {
        id: "mem_002",
        title: "Deployment Guide",
        memory_type: "setup_guide",
        source_url: "https://wiki.internal.cooperate/ops/deploy-v3",
        created_at: getRelativeISO(2 * 60 * 60 * 1000),
        confidence: 0.94,
        source: "wiki.internal.cooperate",
        summary: "Operational workflows, deployment configurations, and rollout pipelines."
      },
      {
        id: "mem_003",
        title: "Auth Architecture",
        memory_type: "architecture",
        source_url: "https://wiki.internal.cooperate/architecture/auth-adr-042",
        created_at: getRelativeISO(60 * 60 * 1000),
        confidence: 0.96,
        source: "wiki.internal.cooperate/architecture",
        summary: "Design document detailing JWT token validation, OAuth flows, and storage strategies."
      },
      {
        id: "mem_004",
        title: "Redis Incident",
        memory_type: "incident",
        source_url: "https://github.com/org/cooperate/issues/849",
        created_at: getRelativeISO(25 * 60 * 60 * 1000),
        confidence: 0.99,
        source: "github.com/org/cooperate/issues",
        summary: "Post-mortem investigation on Redis connection pool exhaustion."
      },
      {
        id: "mem_005",
        title: "API Gateway ADR",
        memory_type: "architecture",
        source_url: "https://wiki.internal.cooperate/architecture/gateway-adr-015",
        created_at: getRelativeISO(4 * 24 * 60 * 60 * 1000),
        confidence: 0.89,
        source: "wiki.internal.cooperate/architecture",
        summary: "Architectural decision record outlining API Gateway selections and routing rules."
      },
      {
        id: "mem_006",
        title: "CI/CD Pipeline Setup",
        memory_type: "setup_guide",
        source_url: "https://github.com/org/cooperate/actions/deploy-workflows",
        created_at: getRelativeISO(6 * 24 * 60 * 60 * 1000),
        confidence: 0.92,
        source: "github.com/org/cooperate/actions"
      },
      {
        id: "mem_007",
        title: "Docker Compose Local Dev",
        memory_type: "documentation",
        source_url: "https://github.com/org/cooperate/blob/main/docker-compose.yml",
        created_at: getRelativeISO(8 * 24 * 60 * 60 * 1000),
        confidence: 0.91,
        source: "github.com/org/cooperate"
      },
      {
        id: "mem_008",
        title: "Kubernetes Manifests ADR",
        memory_type: "architecture",
        source_url: "https://wiki.internal.cooperate/architecture/k8s-adr-009",
        created_at: getRelativeISO(12 * 24 * 60 * 60 * 1000),
        confidence: 0.95,
        source: "wiki.internal.cooperate/architecture"
      },
      {
        id: "mem_009",
        title: "PostgreSQL Migration v3",
        memory_type: "documentation",
        source_url: "https://github.com/org/cooperate/pull/412",
        created_at: getRelativeISO(15 * 24 * 60 * 60 * 1000),
        confidence: 0.88,
        source: "github.com/org/cooperate/pulls"
      },
      {
        id: "mem_010",
        title: "AWS S3 Backup Runbook",
        memory_type: "setup_guide",
        source_url: "https://wiki.internal.cooperate/ops/s3-backup-recovery",
        created_at: getRelativeISO(20 * 24 * 60 * 60 * 1000),
        confidence: 0.93,
        source: "wiki.internal.cooperate/ops"
      },
      {
        id: "mem_011",
        title: "Elasticsearch Node Tuning",
        memory_type: "incident",
        source_url: "https://github.com/org/cooperate/issues/722",
        created_at: getRelativeISO(25 * 24 * 60 * 60 * 1000),
        confidence: 0.87,
        source: "github.com/org/cooperate/issues"
      },
      {
        id: "mem_012",
        title: "Monitoring Grafana Config",
        memory_type: "setup_guide",
        source_url: "https://wiki.internal.cooperate/ops/grafana-alerts",
        created_at: getRelativeISO(30 * 24 * 60 * 60 * 1000),
        confidence: 0.90,
        source: "wiki.internal.cooperate/ops"
      }
    ];
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("parcle-memory-updated"));
    }
  },

  getMemoriesSync(): Memory[] {
    return MOCK_MEMORIES;
  },

  getIncidentsSync(): Incident[] {
    return MOCK_INCIDENTS;
  }
};
