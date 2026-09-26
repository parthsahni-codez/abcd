import logging
from typing import Any

import static_analyzer
from .context import AgentContext

logger = logging.getLogger(__name__)
def run(context: AgentContext) -> dict[str, Any]:
    logger.info("[STATIC ANALYSIS AGENT] Inspecting source and configuration files")
    context.static_analysis = static_analyzer.analyze(context.repo_path)
    context.mark("static_analysis", "completed")
    return context.static_analysis
