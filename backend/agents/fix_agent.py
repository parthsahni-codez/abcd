import logging

from .context import AgentContext

logger = logging.getLogger(__name__)


def run(context: AgentContext) -> dict | None:
    logger.info("[FIX AGENT] Validating the generated structured fix plan")
    if not context.fix_plan:
        context.mark("fix_generation", "no_safe_plan")
        return None
    if context.fix_plan.get("action") not in {"modify_file", "install_package", "install_dependency"}:
        context.fix_plan = None
        context.mark("fix_generation", "rejected")
        return None
    context.mark("fix_generation", "completed")
    return context.fix_plan
