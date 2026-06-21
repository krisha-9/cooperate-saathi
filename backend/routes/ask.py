from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.qa_agent import qa_agent

router = APIRouter()

class AskRequest(BaseModel):
    question: str

@router.post("/ask")
async def ask_question(request: AskRequest):
    try:
        answer = await qa_agent.answer_question(request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
