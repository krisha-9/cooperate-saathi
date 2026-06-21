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
}

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
}

export interface ChatResponse {
  answer: string;
  sources: { title: string; url: string; type?: string }[];
}

const BACKEND_URL = "http://localhost:8000";

// Mock Parcle Memory Database (Person 1 Specs)
let MOCK_MEMORIES: Memory[] = [
  {
    id: "mem_001",
    title: "README.md",
    memory_type: "documentation",
    source_url: "https://github.com/org/cooperate/blob/main/README.md",
    created_at: "2025-07-02",
    confidence: 0.98,
    source: "github.com/org/cooperate"
  },
  {
    id: "mem_002",
    title: "Deployment Guide",
    memory_type: "setup_guide",
    source_url: "https://wiki.internal.cooperate/ops/deploy-v3",
    created_at: "2025-06-28",
    confidence: 0.94,
    source: "wiki.internal.cooperate"
  },
  {
    id: "mem_003",
    title: "Auth Architecture",
    memory_type: "architecture",
    source_url: "https://wiki.internal.cooperate/architecture/auth-adr-042",
    created_at: "2025-07-01",
    confidence: 0.96,
    source: "wiki.internal.cooperate/architecture"
  },
  {
    id: "mem_004",
    title: "Redis Incident",
    memory_type: "incident",
    source_url: "https://github.com/org/cooperate/issues/849",
    created_at: "2025-06-25",
    confidence: 0.99,
    source: "github.com/org/cooperate/issues"
  },
  {
    id: "mem_005",
    title: "API Gateway ADR",
    memory_type: "architecture",
    source_url: "https://wiki.internal.cooperate/architecture/gateway-adr-015",
    created_at: "2025-06-15",
    confidence: 0.89,
    source: "wiki.internal.cooperate/architecture"
  },
  {
    id: "mem_006",
    title: "CI/CD Pipeline Setup",
    memory_type: "setup_guide",
    source_url: "https://github.com/org/cooperate/actions/deploy-workflows",
    created_at: "2025-06-20",
    confidence: 0.92,
    source: "github.com/org/cooperate/actions"
  },
  {
    id: "mem_007",
    title: "Docker Compose Local Dev",
    memory_type: "documentation",
    source_url: "https://github.com/org/cooperate/blob/main/docker-compose.yml",
    created_at: "2025-06-18",
    confidence: 0.91,
    source: "github.com/org/cooperate"
  },
  {
    id: "mem_008",
    title: "Kubernetes Manifests ADR",
    memory_type: "architecture",
    source_url: "https://wiki.internal.cooperate/architecture/k8s-adr-009",
    created_at: "2025-06-10",
    confidence: 0.95,
    source: "wiki.internal.cooperate/architecture"
  },
  {
    id: "mem_009",
    title: "PostgreSQL Migration v3",
    memory_type: "documentation",
    source_url: "https://github.com/org/cooperate/pull/412",
    created_at: "2025-06-22",
    confidence: 0.88,
    source: "github.com/org/cooperate/pulls"
  },
  {
    id: "mem_010",
    title: "AWS S3 Backup Runbook",
    memory_type: "setup_guide",
    source_url: "https://wiki.internal.cooperate/ops/s3-backup-recovery",
    created_at: "2025-06-12",
    confidence: 0.93,
    source: "wiki.internal.cooperate/ops"
  },
  {
    id: "mem_011",
    title: "Elasticsearch Node Tuning",
    memory_type: "incident",
    source_url: "https://github.com/org/cooperate/issues/722",
    created_at: "2025-06-08",
    confidence: 0.87,
    source: "github.com/org/cooperate/issues"
  },
  {
    id: "mem_012",
    title: "Monitoring Grafana Config",
    memory_type: "setup_guide",
    source_url: "https://wiki.internal.cooperate/ops/grafana-alerts",
    created_at: "2025-06-05",
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
    timestamp: "2025-06-25",
    source: "Parcle Incident Memory (Issue #849)",
    confidence: 0.99
  },
  {
    id: "inc_002",
    title: "Database Server Connection Refused (Port 5432)",
    errorQuery: "ECONNREFUSED",
    rootCause: "Database credentials mismatch on Kubernetes stateful pods after token refresh rotation script.",
    resolution: "Forced update check of local secrets and restarted API deployment: `kubectl rollout restart deployment/api-server`.",
    severity: "high",
    timestamp: "2025-06-28",
    source: "Parcle Incident Memory (DB Migration v3)",
    confidence: 0.94
  },
  {
    id: "inc_003",
    title: "CI/CD Build Failure: ESLint rule blockers",
    errorQuery: "Deployment failed",
    rootCause: "TypeScript compilation failed check in pre-commit hook during CI/CD build due to unused variables inside a newly introduced auth hook.",
    resolution: "Cleaned up unused variables. Updated `next.config.js` to prevent build blockers during critical hotfixes.",
    severity: "medium",
    timestamp: "2025-07-02",
    source: "Parcle Incident Memory (CI-Worker-02)",
    confidence: 0.89
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
      await new Promise((r) => setTimeout(r, 800));
      
      let sourceDomain = page.domain || "";
      if (!sourceDomain) {
        try {
          sourceDomain = new URL(page.url).hostname;
        } catch (e) {
          sourceDomain = "unknown.domain";
        }
      }

      const mockMem: Memory = {
        id: `mem_${Date.now().toString().slice(-4)}`,
        title: page.title,
        memory_type: "documentation",
        source_url: page.url,
        created_at: new Date().toISOString().split("T")[0],
        confidence: 0.95,
        source: sourceDomain
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
    try {
      const response = await fetch(`${BACKEND_URL}/memories`);
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return await response.json();
    } catch (err) {
      console.warn("[Saathi Link] FastAPI backend offline, loading memories list from Parcle mocks.", err);
      await new Promise((r) => setTimeout(r, 450));
      return [...MOCK_MEMORIES];
    }
  },

  clearLocalMemories() {
    MOCK_MEMORIES = [];
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
        created_at: "2025-07-02",
        confidence: 0.98,
        source: "github.com/org/cooperate"
      },
      {
        id: "mem_002",
        title: "Deployment Guide",
        memory_type: "setup_guide",
        source_url: "https://wiki.internal.cooperate/ops/deploy-v3",
        created_at: "2025-06-28",
        confidence: 0.94,
        source: "wiki.internal.cooperate"
      },
      {
        id: "mem_003",
        title: "Auth Architecture",
        memory_type: "architecture",
        source_url: "https://wiki.internal.cooperate/architecture/auth-adr-042",
        created_at: "2025-07-01",
        confidence: 0.96,
        source: "wiki.internal.cooperate/architecture"
      },
      {
        id: "mem_004",
        title: "Redis Incident",
        memory_type: "incident",
        source_url: "https://github.com/org/cooperate/issues/849",
        created_at: "2025-06-25",
        confidence: 0.99,
        source: "github.com/org/cooperate/issues"
      },
      {
        id: "mem_005",
        title: "API Gateway ADR",
        memory_type: "architecture",
        source_url: "https://wiki.internal.cooperate/architecture/gateway-adr-015",
        created_at: "2025-06-15",
        confidence: 0.89,
        source: "wiki.internal.cooperate/architecture"
      },
      {
        id: "mem_006",
        title: "CI/CD Pipeline Setup",
        memory_type: "setup_guide",
        source_url: "https://github.com/org/cooperate/actions/deploy-workflows",
        created_at: "2025-06-20",
        confidence: 0.92,
        source: "github.com/org/cooperate/actions"
      },
      {
        id: "mem_007",
        title: "Docker Compose Local Dev",
        memory_type: "documentation",
        source_url: "https://github.com/org/cooperate/blob/main/docker-compose.yml",
        created_at: "2025-06-18",
        confidence: 0.91,
        source: "github.com/org/cooperate"
      },
      {
        id: "mem_008",
        title: "Kubernetes Manifests ADR",
        memory_type: "architecture",
        source_url: "https://wiki.internal.cooperate/architecture/k8s-adr-009",
        created_at: "2025-06-10",
        confidence: 0.95,
        source: "wiki.internal.cooperate/architecture"
      },
      {
        id: "mem_009",
        title: "PostgreSQL Migration v3",
        memory_type: "documentation",
        source_url: "https://github.com/org/cooperate/pull/412",
        created_at: "2025-06-22",
        confidence: 0.88,
        source: "github.com/org/cooperate/pulls"
      },
      {
        id: "mem_010",
        title: "AWS S3 Backup Runbook",
        memory_type: "setup_guide",
        source_url: "https://wiki.internal.cooperate/ops/s3-backup-recovery",
        created_at: "2025-06-12",
        confidence: 0.93,
        source: "wiki.internal.cooperate/ops"
      },
      {
        id: "mem_011",
        title: "Elasticsearch Node Tuning",
        memory_type: "incident",
        source_url: "https://github.com/org/cooperate/issues/722",
        created_at: "2025-06-08",
        confidence: 0.87,
        source: "github.com/org/cooperate/issues"
      },
      {
        id: "mem_012",
        title: "Monitoring Grafana Config",
        memory_type: "setup_guide",
        source_url: "https://wiki.internal.cooperate/ops/grafana-alerts",
        created_at: "2025-06-05",
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
