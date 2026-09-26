import logging
import os
import re

from fix_generator import build_analysis_prompt, parse_analysis
from ollama_service import ask_qwen

from .context import AgentContext

logger = logging.getLogger(__name__)


def _source_evidence(context: AgentContext) -> str:
    log_text = f"{context.logs.get('stderr', '')}\n{context.logs.get('error', '')}"
    paths = set(
        re.findall(
            r"(?:^|!|\s)(?:\./)((?:components|pages|src|app|styles)/[A-Za-z0-9_./-]+\.(?:css|js|jsx|ts|tsx|json|py))",
            log_text,
            re.MULTILINE,
        )
    )
    evidence = []
    for relative_path in paths:
        target = os.path.abspath(os.path.join(context.repo_path, relative_path))
        if not target.startswith(os.path.abspath(context.repo_path) + os.sep) or not os.path.isfile(target):
            continue
        with open(target, encoding="utf-8") as source_file:
            evidence.append(f"{relative_path}:\n{source_file.read(12000)}")
    if not evidence:
        for root, _, names in os.walk(context.repo_path):
            if "node_modules" in root or ".git" in root:
                continue
            for name in names:
                if name.endswith(".module.css") or (name == "index.js" and os.path.basename(root) == "pages"):
                    target = os.path.join(root, name)
                    relative_path = os.path.relpath(target, context.repo_path)
                    with open(target, encoding="utf-8") as source_file:
                        evidence.append(f"{relative_path}:\n{source_file.read(12000)}")
                    break
            if evidence:
                break
    return "\n\n".join(evidence)


def run(context: AgentContext) -> dict:
    logger.info("[ROOT CAUSE AGENT] Asking Qwen to analyze repository evidence")
    prompt = build_analysis_prompt(context.repository_url, context.project, context.tests, context.logs.get("error", ""))
    prompt += f"\nDependency evidence:\n{context.dependencies}\nStatic analysis evidence:\n{context.static_analysis}\n"
    prompt += f"\nRelevant source evidence:\n{_source_evidence(context)}\n"
    raw_response = ask_qwen(prompt)
    context.root_cause = parse_analysis(raw_response, context.logs.get("error", ""))
    context.root_cause["ai_response"] = raw_response
    context.fix_plan = context.root_cause.get("fix_plan")
    context.mark("root_cause", "completed")
    context.mark("fix_generation", "completed" if context.fix_plan else "no_safe_plan")
    return context.root_cause
