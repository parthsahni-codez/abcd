import logging

import repository_scanner

from .context import AgentContext
from . import dependency_agent, fix_agent, log_agent, repository_agent, root_cause_agent, static_analysis_agent, test_agent, validation_agent

logger = logging.getLogger(__name__)


def analyze(repository_url: str) -> AgentContext:
    logger.info("[ORCHESTRATOR] Starting workflow")
    normalized_url = repository_scanner.validate_github_url(repository_url)
    workspace = repository_scanner.get_temp_workspace()
    try:
        repo_path = repository_scanner.clone_repository(normalized_url, workspace)
        context = AgentContext(repository_url=normalized_url, workspace=workspace, repo_path=repo_path)
        repository_agent.run(context)
        dependency_agent.run(context)
        static_analysis_agent.run(context)
        test_agent.run(context)
        log_agent.run(context)
        root_cause_agent.run(context)
        fix_agent.run(context)
        return context
    except Exception:
        repository_scanner.cleanup_workspace(workspace)
        raise


def serialize(context: AgentContext) -> dict:
    return {
        "repository": context.repository_url,
        "project": context.project,
        "dependencies": context.dependencies,
        "static_analysis": context.static_analysis,
        "tests": context.tests,
        "logs": context.logs,
        "root_cause": context.root_cause,
        "fix_plan": context.fix_plan,
        "agent_status": context.agent_status,
        "iteration": context.iteration,
    }


def validate_with_retries(context: AgentContext, max_iterations: int = 3) -> dict:
    """Apply a plan, analyze new failures, and retry only within a hard limit."""
    for iteration in range(1, max_iterations + 1):
        context.iteration = iteration
        result = validation_agent.run(context)
        if result.get("fix_verified") or not context.fix_plan:
            return result
        context.tests = result.get("verification", context.tests)
        log_agent.run(context)
        root_cause_agent.run(context)
        fix_agent.run(context)
    return context.validation
