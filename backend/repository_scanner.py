import json
import os
import shutil
import subprocess
import tempfile
import uuid
from urllib.parse import urlparse


TEMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_repos")

def get_temp_workspace() -> str:
    """Create an isolated workspace that can be removed after one analysis."""
    os.makedirs(TEMP_DIR, exist_ok=True)
    return tempfile.mkdtemp(prefix=f"run_{uuid.uuid4().hex[:8]}_", dir=TEMP_DIR)


def validate_github_url(url: str) -> str:
    """Accept only HTTPS URLs for public GitHub repositories."""
    parsed = urlparse(url.strip())
    if parsed.scheme != "https" or parsed.netloc.lower() != "github.com":
        raise ValueError("Only HTTPS URLs hosted at github.com are supported")

    parts = [part for part in parsed.path.strip("/").split("/") if part]
    if len(parts) != 2 or any(part in {".", ".."} for part in parts):
        raise ValueError("Use https://github.com/owner/repository")

    repository = parts[1][:-4] if parts[1].endswith(".git") else parts[1]
    return f"https://github.com/{parts[0]}/{repository}.git"

def clone_repository(url: str, workspace: str) -> str:
    """Clone a public repository without invoking a shell."""
    normalized_url = validate_github_url(url)
    repo_name = normalized_url.rstrip("/").split("/")[-1][:-4]
    clone_path = os.path.join(workspace, repo_name)

    try:
        env = os.environ.copy()
        env["GIT_TERMINAL_PROMPT"] = "0"
        subprocess.run(
            ["git", "clone", "--depth", "1", normalized_url, clone_path],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env,
            timeout=120,
        )
        return clone_path
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, OSError) as error:
        detail = error.stderr if isinstance(error, subprocess.CalledProcessError) else str(error)
        raise RuntimeError(f"Repository clone failed: {detail}") from error

def detect_project_type(repo_path: str) -> dict:
    """Detects the project type based on root files in the repository."""
    files = set(os.listdir(repo_path)) if os.path.exists(repo_path) else set()
    project_type = "Unknown"
    framework = "Unknown"

    package_data = {}
    if "package.json" in files:
        with open(os.path.join(repo_path, "package.json"), encoding="utf-8") as file:
            package_data = json.load(file)
        project_type = "Node.js"
        if any(file.startswith("next.config") for file in files):
            framework = "Next.js"
        elif any(file.startswith("vite.config") for file in files):
            framework = "Vite"
        elif any(dep in package_data.get("dependencies", {}) for dep in ("react", "react-dom")):
            framework = "React"
    elif "index.html" in files:
        project_type = "Static HTML/CSS/JavaScript"

    package_manager = None
    if "package-lock.json" in files:
        package_manager = "npm"
    elif "pnpm-lock.yaml" in files:
        package_manager = "pnpm"
    elif "yarn.lock" in files:
        package_manager = "yarn"

    return {
        "project_type": project_type,
        "framework": framework,
        "package_manager": package_manager,
        "package_scripts": package_data.get("scripts", {}),
    }

def cleanup_workspace(workspace: str):
    """Safely deletes the temporary workspace."""
    try:
        shutil.rmtree(workspace, ignore_errors=True)
    except Exception as e:
        print(f"[REPO] Cleanup failed for {workspace}: {e}")
