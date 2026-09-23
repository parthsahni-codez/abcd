from langgraph.graph import StateGraph, END
from .state import TrendState
from .nodes import (
    research_agent,
    analysis_agent,
    audience_intelligence_agent,
    content_planner_agent,
    writer_agent,
    review_agent
)

def create_trend_workflow():
    workflow = StateGraph(TrendState)

    # Add nodes
    workflow.add_node("research", research_agent)
    workflow.add_node("analysis", analysis_agent)
    workflow.add_node("audience", audience_intelligence_agent)
    workflow.add_node("planner", content_planner_agent)
    workflow.add_node("writer", writer_agent)
    workflow.add_node("review", review_agent)

    # Define edges
    workflow.set_entry_point("research")
    workflow.add_edge("research", "analysis")
    workflow.add_edge("analysis", "audience")
    workflow.add_edge("audience", "planner")
    workflow.add_edge("planner", "writer")
    workflow.add_edge("writer", "review")
    
    # Conditional edge after review (mocked as always passing for now)
    workflow.add_conditional_edges(
        "review",
        lambda state: "approve" if state.get("is_approved") else "revise",
        {
            "approve": END,
            "revise": "writer"
        }
    )

    return workflow.compile()

# Initialize the graph
trend_graph = create_trend_workflow()
