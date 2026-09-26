import json
import re


def build_analysis_prompt(repository: str, project_info: dict, results: dict, detected_error: str) -> str:
    return f"""You are a DevOps Error Analysis and Code Fix Agent.
Analyze this real public repository execution result. Do not invent files, logs, or fixes.
Return ONLY one valid JSON object, with no Markdown fences, prose, explanations, or extra fields. Never return an `assistant` field or troubleshooting instructions:
{{"error":"what failed","error_type":"Dependency|Build|Runtime|Configuration|Syntax|Environment|Unknown","root_cause":"why it failed","evidence":[],"fixability":"supported|unsupported|uncertain","suggested_fix":"specific safe developer action, or state that more evidence is needed","confidence":0,"fix_plan":null}}
When evidence supports a safe change, fix_plan must be one of these exact shapes. `action` is never the operation name, and a file fix must include `file`:
{{"action":"modify_file","file":"index.html|requirements.txt|pyproject.toml|pages/index.js|*.module.css","operation":"append_line|replace_text","old_content":"required for replace_text; exact existing text copied from source evidence","content":"one exact line or exact replacement text"}}
or {{"action":"install_package","package_manager":"npm|pnpm|yarn|pip","package":"package-name"}}.
Use null when evidence is insufficient. Never return shell commands.

Repository: {repository}
Project type: {project_info.get('project_type')}
Framework: {project_info.get('framework')}
Install command: {results.get('install_command')}
Install exit code: {results.get('install_exit_code')}
Check command: {results.get('command')}
Check exit code: {results.get('exit_code')}
Detected error:
{detected_error}
stdout:
{results.get('stdout', '')}
stderr:
{results.get('stderr', '')}
Use the captured source and compiler error together. If a CSS module contains a selector or Tailwind `@apply` construct that the compiler rejects, a safe fix may replace the exact offending block with a local class containing equivalent plain CSS declarations. In that case use `replace_text` with the exact existing block in `old_content`; do not propose configuration changes, guessed files, or dependency upgrades.
"""


def parse_analysis(response: str, detected_error: str) -> dict:
    candidate = response.strip()
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", candidate, re.DOTALL)
    if fenced:
        candidate = fenced.group(1)
    else:
        start, end = candidate.find("{"), candidate.rfind("}")
        if start >= 0 and end > start:
            candidate = candidate[start:end + 1]

    try:
        data = json.loads(candidate)
    except json.JSONDecodeError:
        return {
            "error": detected_error,
            "error_type": "Unknown",
            "root_cause": "The AI response was not structured enough to establish a root cause.",
            "suggested_fix": "Review the captured logs and rerun the failing command with the repository's required environment.",
            "confidence": 0,
        }

    try:
        confidence = int(data.get("confidence", 0))
    except (TypeError, ValueError):
        confidence = 0

    raw_plan = data.get("fix_plan")
    fix_plan = None
    if isinstance(raw_plan, dict) and raw_plan.get("action") in {"modify_file", "install_package", "install_dependency"}:
        candidate = {key: value for key, value in raw_plan.items() if isinstance(value, str)}
        if candidate.get("action") == "modify_file":
            valid_file = candidate.get("file", "") in {"index.html", "requirements.txt", "pyproject.toml", "pages/index.js"} or candidate.get("file", "").endswith(".module.css")
            valid_operation = candidate.get("operation") == "append_line" or (candidate.get("operation") == "replace_text" and candidate.get("old_content"))
            if valid_file and valid_operation and candidate.get("content"):
                fix_plan = candidate
        elif candidate.get("package_manager") and candidate.get("package"):
            fix_plan = candidate

    return {
        "error": str(data.get("error") or detected_error),
        "error_type": str(data.get("error_type") or "Unknown"),
        "root_cause": str(data.get("root_cause") or "Insufficient evidence for a root cause."),
        "suggested_fix": str(data.get("suggested_fix") or "No safe fix could be established from the captured evidence."),
        "confidence": max(0, min(100, confidence)),
        "fix_plan": fix_plan,
        "evidence": [str(item) for item in data.get("evidence", []) if isinstance(item, (str, int, float))],
        "fixability": str(data.get("fixability") or ("supported" if fix_plan else "uncertain")),
    }
