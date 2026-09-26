import logging

import log_inspector

from .context import AgentContext

logger = logging.getLogger(__name__)


def run(context: AgentContext) -> dict:
    logger.info("[LOG AGENT] Extracting evidence from captured output")
    install_stdout = context.tests.get("install_stdout", "")
    install_stderr = context.tests.get("install_stderr", "")
    stdout = f"{install_stdout}\n{context.tests.get('stdout', '')}".strip()
    stderr = f"{install_stderr}\n{context.tests.get('stderr', '')}".strip()
    exit_code = context.tests.get("exit_code", 0)
    if exit_code == 0:
        exit_code = context.tests.get("install_exit_code", 0)
    context.logs = {"stdout": stdout, "stderr": stderr, "exit_code": exit_code, "error": log_inspector.extract_error(stdout, stderr, exit_code)}
    context.mark("logs", "completed")
    return context.logs
