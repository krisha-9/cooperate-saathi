from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from agents.incident_agent import incident_agent

router = APIRouter()

class IncidentRequest(BaseModel):
    error_message: str
    context: Optional[str] = ""

@router.post("/store-incident")
async def store_incident(request: IncidentRequest):
    try:
        result = await incident_agent.process_incident(
            error_message=request.error_message,
            context=request.context
        )
        return {"status": "success", "incident": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search-incidents")
async def search_incidents(request: IncidentRequest):
    try:
        results = await incident_agent.search_incidents(request.error_message)
        return {"incidents": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
