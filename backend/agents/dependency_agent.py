import logging
from typing import Any

import dependency_auditor
from .context import AgentContext

logger = logging.getLogger(__name__)
def run(context: AgentContext) -> dict[str, Any]:
    logger.info("[DEPENDENCY AGENT] Inspecting dependency manifests")
    context.dependencies = dependency_auditor.audit(context.repo_path, context.project)
    context.mark("dependency", "completed")
    return context.dependencies
