import logging

import fix_executor
import test_runner

from .context import AgentContext

logger = logging.getLogger(__name__)


def run(context: AgentContext) -> dict:
    logger.info("[VALIDATION AGENT] Applying the plan and rerunning verification")
    if not context.fix_plan:
        result = {"status": "unsupported", "fix_verified": False, "reason": "No safe fix plan was generated."}
        context.validation = result
        context.mark("validation", "skipped")
        return result
    applied = fix_executor.apply_plan(context.repo_path, context.fix_plan)
    verification = test_runner.run_tests(context.repo_path, context.project)
    exit_code = verification.get("exit_code", 0)
    if exit_code == 0:
        exit_code = verification.get("install_exit_code", 0)
    result = {"status": "passed" if exit_code == 0 else "failed", "fix_verified": exit_code == 0, "exit_code": exit_code, "applied": applied, "verification": verification}
    context.validation = result
    context.mark("validation", "completed")
    return result
