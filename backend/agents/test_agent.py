import logging

import test_runner

from .context import AgentContext

logger = logging.getLogger(__name__)


def run(context: AgentContext) -> dict:
    logger.info("[TEST AGENT] Installing dependencies and running project checks")
    context.tests = test_runner.run_tests(context.repo_path, context.project)
    context.mark("testing", "completed")
    return context.tests
