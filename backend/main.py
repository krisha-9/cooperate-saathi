from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import ingest, ask, incidents

app = FastAPI(title="CoOperate Saathi Backend", description="AI Engineering Memory Agent Backend")

# Allow CORS for Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(ingest.router, tags=["Ingestion"])
app.include_router(ask.router, tags=["Q&A"])
app.include_router(incidents.router, tags=["Incidents"])

@app.get("/")
async def root():
    return {"message": "CoOperate Saathi Backend is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
