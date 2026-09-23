from typing import TypedDict, Annotated, List, Dict, Any
import operator

# The state object that will be passed between LangGraph nodes
class TrendState(TypedDict):
    topic: str
    niche: str
    brand_voice: str
    target_audience: str
    
    # Outputs from agents
    raw_trends: List[Dict[str, Any]]
    analysis: Dict[str, Any]
    content_plan: Dict[str, Any]
    drafts: Dict[str, str] # e.g. {"linkedin": "...", "instagram": "..."}
    final_content: Dict[str, str]
    feedback: List[str]
    is_approved: bool
