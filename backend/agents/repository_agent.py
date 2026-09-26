import logging

import repository_scanner

from .context import AgentContext

logger = logging.getLogger(__name__)


def run(context: AgentContext) -> dict:
    logger.info("[REPOSITORY AGENT] Detecting project and package manager")
    try:
        context.project = repository_scanner.detect_project_type(context.repo_path)
        context.mark("repository", "completed")
    except Exception as error:
        context.mark("repository", "failed")
        raise RuntimeError(f"Repository inspection failed: {error}") from error
    return context.project
