import time
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="CoOperate Saathi API Backend")

# Enable CORS for Chrome Extension access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory databases
memories = [
    {
        "id": "mem_001",
        "title": "README.md",
        "memory_type": "documentation",
        "source_url": "https://github.com/org/cooperate/blob/main/README.md",
        "created_at": "2026-06-22T10:00:00Z",
        "confidence": 0.98,
        "source": "github.com/org/cooperate",
        "summary": "Main repository documentation containing quickstart instructions, repository layout, and design conventions."
    },
    {
        "id": "mem_002",
        "title": "Deployment Guide",
        "memory_type": "setup_guide",
        "source_url": "https://wiki.internal.cooperate/ops/deploy-v3",
        "created_at": "2026-06-22T08:00:00Z",
        "confidence": 0.94,
        "source": "wiki.internal.cooperate",
        "summary": "Operational workflows, deployment configurations, and rollout pipelines."
    },
    {
        "id": "mem_003",
        "title": "Auth Architecture",
        "memory_type": "architecture",
        "source_url": "https://wiki.internal.cooperate/architecture/auth-adr-042",
        "created_at": "2026-06-22T09:00:00Z",
        "confidence": 0.96,
        "source": "wiki.internal.cooperate/architecture",
        "summary": "Design document detailing JWT token validation, OAuth flows, and storage strategies."
    },
    {
        "id": "mem_004",
        "title": "Redis Incident",
        "memory_type": "incident",
        "source_url": "https://github.com/org/cooperate/issues/849",
        "created_at": "2026-06-21T15:00:00Z",
        "confidence": 0.99,
        "source": "github.com/org/cooperate/issues",
        "summary": "Post-mortem investigation on Redis connection pool exhaustion."
    },
    {
        "id": "mem_005",
        "title": "API Gateway ADR",
        "memory_type": "architecture",
        "source_url": "https://wiki.internal.cooperate/architecture/gateway-adr-015",
        "created_at": "2026-06-18T12:00:00Z",
        "confidence": 0.89,
        "source": "wiki.internal.cooperate/architecture",
        "summary": "Architectural decision record outlining API Gateway selections and routing rules."
    }
]

incidents = [
    {
        "id": "inc_001",
        "title": "Redis Pool Exhaustion Timeout",
        "error_message": "Redis timeout",
        "root_cause": "Unreleased Redis connection instances in API controllers during authentication validations under spike traffic.",
        "resolution": "Implemented try/finally blocks to guarantee client connections release back to pool. Configured client read-timeout limits.",
        "severity": "high",
        "timestamp": "2026-06-21T15:00:00Z",
        "source": "Parcle Incident Memory (Issue #849)",
        "confidence": 0.99,
        "lessonsLearned": [
            "Always release Redis clients",
            "Add timeout monitoring",
            "Configure retry logic"
        ],
        "recommendedActions": [
            "Check Redis health",
            "Verify connection pool",
            "Review authentication service"
        ]
    },
    {
        "id": "inc_002",
        "title": "Database Server Connection Refused (Port 5432)",
        "error_message": "ECONNREFUSED",
        "root_cause": "Database credentials mismatch on Kubernetes stateful pods after token refresh rotation script.",
        "resolution": "Forced update check of local secrets and restarted API deployment: `kubectl rollout restart deployment/api-server`.",
        "severity": "high",
        "timestamp": "2026-06-07T12:00:00Z",
        "source": "Parcle Incident Memory (DB Migration v3)",
        "confidence": 0.94,
        "lessonsLearned": [
            "Validate secrets lifecycle",
            "Automate deployment health check restarts",
            "Set longer database rotation buffers"
        ],
        "recommendedActions": [
            "Check database container logs",
            "Verify rotation token secrets",
            "Restart api-server deployment pods"
        ]
    },
    {
        "id": "inc_003",
        "title": "CI/CD Build Failure: ESLint rule blockers",
        "error_message": "Deployment failed",
        "root_cause": "TypeScript compilation failed check in pre-commit hook during CI/CD build due to unused variables inside a newly introduced auth hook.",
        "resolution": "Cleaned up unused variables. Updated `next.config.js` to prevent build blockers during critical hotfixes.",
        "severity": "medium",
        "timestamp": "2026-06-22T15:00:00Z",
        "source": "Parcle Incident Memory (CI-Worker-02)",
        "confidence": 0.89,
        "lessonsLearned": [
            "Fix unused imports before checking in code",
            "Sync lint rules across local and remote hooks",
            "Do not ignore pre-commit typescript alerts"
        ],
        "recommendedActions": [
            "Review commit hook typescript warnings",
            "Re-run local eslint check on authentication code",
            "Clean up unused hooks"
        ]
    }
]

# Schemas
class PageIngestRequest(BaseModel):
    title: str
    url: str
    content: str

class AskRequest(BaseModel):
    question: str

class IncidentSearchRequest(BaseModel):
    error_message: str
    context: str

class StoreIncidentRequest(BaseModel):
    error_message: str
    context: str

# Endpoints
@app.get("/")
@app.get("/health")
def health():
    return {"status": "ok", "service": "CoOperate Saathi Backend"}

@app.get("/memories")
def get_memories():
    return memories

@app.post("/ingest-page")
def ingest_page(req: PageIngestRequest):
    try:
        from urllib.parse import urlparse
        hostname = urlparse(req.url).hostname or "unknown.domain"
    except Exception:
        hostname = "unknown.domain"
        
    new_mem = {
        "id": f"mem_{int(time.time() * 1000) % 10000}",
        "title": req.title,
        "memory_type": "documentation",
        "source_url": req.url,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "confidence": 0.95,
        "source": hostname,
        "summary": f"Ingested documentation from {req.title}. Contains captured content from the client extension."
    }
    memories.insert(0, new_mem)
    return {"status": "success", "message": "Page ingested successfully", "memory": new_mem}

@app.post("/ask")
def ask(req: AskRequest):
    q = req.question.lower()
    
    # Simple semantic router
    if "auth" in q or "jwt" in q or "token" in q:
        ans = (
            "Based on Auth Architecture:\n\n"
            "Authentication Flow & JWT Design:\n"
            "1. User Login: Clients exchange user credentials for a secured JWT token.\n"
            "2. Token Validation: API gateway intercepts request headers and validates JWT signature via public keys.\n"
            "3. Token Storage: Secure localStorage or httpOnly cookie strategies are recommended.\n"
            "4. Expiry & Refresh: Short-lived access tokens (15 mins) and long-lived database-backed refresh tokens (7 days)."
        )
    elif "redis" in q or "timeout" in q or "exhaust" in q:
        ans = (
            "Based on Redis Incident post-mortem:\n\n"
            "Redis connection pool exhaustion details:\n"
            "• Root Cause: Unreleased Redis client connection instances inside middleware classes under heavy spike traffic.\n"
            "• Impact: Connection timeout latency spikes followed by client HTTP 500 errors.\n"
            "• Resolution: Wrapped client connections inside strict try/finally blocks to guarantee cleanup back to the pool, and optimized client connection timeout configs."
        )
    elif "deploy" in q or "pipeline" in q or "ci" in q or "cd" in q:
        ans = (
            "Based on CI/CD Pipeline Setup and Deployment Guide:\n\n"
            "Pipeline Workflow Steps:\n"
            "1. Code Linting & Format: Runs eslint and prettier verification checks.\n"
            "2. TypeScript Check: Validates typings using tsc --noEmit.\n"
            "3. Automated Unit Testing: Runs Jest/Vitest test suites.\n"
            "4. Containerization: Builds Docker image tag matching commit SHA.\n"
            "5. Staging Deploy: Deploys container to preview environment automatically."
        )
    elif "readme" in q or "quickstart" in q or "setup" in q:
        ans = (
            "Based on README.md:\n\n"
            "Project Quickstart & Setup:\n"
            "1. Clone the repository and navigate to root.\n"
            "2. Install dependencies: npm install inside extension, and configure python virtualenv for backend.\n"
            "3. Start local development servers:\n"
            "   • Backend: uvicorn main:app --reload\n"
            "   • Extension: npm run dev\n"
            "4. Build extension: npm run build"
        )
    else:
        # Default response
        ans = (
            f"🐺 I processed your question: '{req.question}'.\n\n"
            "Looking through Parcle Memory, I found relevant setup contexts. "
            "Make sure your environment variables are configured correctly and the local FastAPI backend is active. "
            "Let me know if you need specific details on auth, redis incidents, or deployment workflows!"
        )
        
    return {"answer": ans}

@app.post("/search-incidents")
def search_incidents(req: IncidentSearchRequest):
    q = req.error_message.lower().strip()
    if not q:
        return {"incidents": []}
        
    matches = []
    for inc in incidents:
        if (q in inc["title"].lower() or 
            q in inc["error_message"].lower() or 
            q in inc["root_cause"].lower() or 
            q in inc["resolution"].lower()):
            matches.append(inc)
            
    return {"incidents": matches}

@app.post("/store-incident")
def store_incident(req: StoreIncidentRequest):
    err = req.error_message
    
    root_cause = f"AI-generated root cause for error '{err}': Found resource mismatch or connection pool exhaustion in database controller."
    resolution = f"AI-generated resolution: Verify target credentials, restart service container using 'kubectl rollout restart', and configure connection timeouts."
    
    new_inc = {
        "id": f"inc_{int(time.time() * 1000) % 10000}",
        "title": f"Incident Analysis: {err}",
        "error_message": err,
        "root_cause": root_cause,
        "resolution": resolution,
        "severity": "medium",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "source": "FastAPI Incident Parser Agent",
        "confidence": 0.95,
        "lessonsLearned": ["Verify connection pools", "Monitor server load metrics"],
        "recommendedActions": ["Check pod resource limits", "Review log trail"]
    }
    
    incidents.insert(0, new_inc)
    return new_inc
