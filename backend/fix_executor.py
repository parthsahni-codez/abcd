import os
import re
import subprocess
from pathlib import Path


PACKAGE_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+(?:@[A-Za-z0-9.*^~<>=+-]+)?$")
ALLOWED_FILES = {"requirements.txt", "pyproject.toml", "index.html", "pages/index.js"}


def _safe_file_path(repo_path: str, relative_file: str) -> Path:
	if not relative_file or Path(relative_file).is_absolute():
		raise ValueError("Fix file must be a relative path")
	path = Path(relative_file)
	if any(part in {".", ".."} for part in path.parts):
		raise ValueError("Fix file cannot contain traversal segments")
	if str(path).replace("\\", "/") not in ALLOWED_FILES and not path.name.endswith(".module.css"):
		raise ValueError(f"Fixes are not allowed for {path.name}")

	repository_root = Path(repo_path).resolve()
	target = (repository_root / path).resolve()
	if repository_root not in target.parents or not target.is_file():
		raise ValueError("Fix file does not exist inside the cloned repository")
	return target


def apply_modify_file(repo_path: str, file: str, operation: str, content: str, old_content: str = "") -> str:
	if operation not in {"append_line", "replace_text"}:
		raise ValueError("Only append_line and replace_text operations are allowed")
	if not content or len(content) > 4000 or "\x00" in content:
		raise ValueError("Fix content must be non-empty and at most 4000 characters")

	target = _safe_file_path(repo_path, file)
	original = target.read_text(encoding="utf-8")
	if operation == "replace_text":
		if not old_content or len(old_content) > 4000 or "\x00" in old_content:
			raise ValueError("replace_text requires non-empty old_content of at most 4000 characters")
		if original.count(old_content) != 1:
			raise ValueError("replace_text requires old_content to match exactly once")
		updated = original.replace(old_content, content, 1)
	else:
		suffix = "" if original.endswith("\n") else "\n"
		updated = f"{original}{suffix}{content}\n"
	target.write_text(updated, encoding="utf-8")
	return str(target.relative_to(Path(repo_path).resolve()))


def apply_install_dependency(repo_path: str, package_manager: str, package: str) -> dict:
	if package_manager not in {"npm", "pnpm", "yarn", "pip"}:
		raise ValueError("Unsupported package manager")
	if not package or not PACKAGE_PATTERN.fullmatch(package):
		raise ValueError("Invalid package name")

	if package_manager == "pip":
		command = ["python", "-m", "pip", "install", package]
	else:
		executable = f"{package_manager}.cmd" if os.name == "nt" else package_manager
		command = [executable, "install", package, "--ignore-scripts", "--no-audit", "--no-fund"]

	environment = os.environ.copy()
	if package_manager == "npm":
		environment["npm_config_cache"] = os.path.join(repo_path, ".npm-cache")

	result = subprocess.run(
		command,
		cwd=repo_path,
		env=environment,
		capture_output=True,
		text=True,
		timeout=180,
		check=False,
	)
	return {
		"command": " ".join(command),
		"exit_code": result.returncode,
		"stdout": result.stdout[-12000:],
		"stderr": result.stderr[-12000:],
	}


def apply_plan(repo_path: str, plan: dict) -> dict:
	action = plan.get("action")
	if action == "modify_file":
		changed_file = apply_modify_file(
			repo_path,
			plan.get("file", ""),
			plan.get("operation", ""),
			plan.get("content", ""),
			plan.get("old_content", ""),
		)
		return {"action": action, "changed_file": changed_file, "install": None}
	if action in {"install_package", "install_dependency"}:
		install = apply_install_dependency(
			repo_path,
			plan.get("package_manager", ""),
			plan.get("package", ""),
		)
		return {"action": action, "changed_file": None, "install": install}
	raise ValueError("Unsupported fix action")
