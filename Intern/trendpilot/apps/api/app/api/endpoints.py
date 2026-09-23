from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from ..agents.workflow import trend_graph
from pydantic import BaseModel

router = APIRouter()

class GenerationRequest(BaseModel):
    topic: str
    niche: str
    brand_voice: str
    target_audience: str

@router.post("/generate")
async def generate_post(request: GenerationRequest) -> Dict[str, Any]:
    """
    Trigger the multi-agent workflow to generate a social media post.
    In a production system, this would queue a Celery task and return a task_id.
    """
    initial_state = {
        "topic": request.topic,
        "niche": request.niche,
        "brand_voice": request.brand_voice,
        "target_audience": request.target_audience
    }
    
    try:
        # Run the workflow synchronously for MVP
        result = trend_graph.invoke(initial_state)
        return {
            "status": "success",
            "final_content": result.get("final_content", {}),
            "raw_trends": result.get("raw_trends", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
