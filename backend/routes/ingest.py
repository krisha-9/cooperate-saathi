from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ingestion.page_ingestor import page_ingestor

router = APIRouter()

class IngestRequest(BaseModel):
    title: str
    url: str
    content: str

@router.post("/ingest-page")
async def ingest_page(request: IngestRequest):
    success = await page_ingestor.process_and_store(
        title=request.title,
        url=request.url,
        content=request.content
    )
    if success:
        return {"status": "success", "message": "Page ingested successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to ingest page")
