import os
import uuid
import subprocess
import shutil

# Temporary directory for cloning repositories
TEMP_DIR = "temp_repos"

def get_temp_workspace() -> str:
    """Creates a unique temporary workspace for a repository."""
    os.makedirs(TEMP_DIR, exist_ok=True)
    workspace = os.path.join(TEMP_DIR, f"run_{uuid.uuid4().hex[:8]}")
    os.makedirs(workspace, exist_ok=True)
    return workspace

def clone_repository(url: str, workspace: str) -> str:
    """Clones a GitHub repository into the workspace and returns the clone path."""
    print(f"[REPO] URL: {url}")
    print(f"[REPO] Clone path: {workspace}")
    
    repo_name = url.rstrip("/").split("/")[-1]
    if repo_name.endswith(".git"):
        repo_name = repo_name[:-4]
    
    clone_path = os.path.join(workspace, repo_name)
    
    try:
        # Run git clone non-interactively with a timeout
        env = os.environ.copy()
        env["GIT_TERMINAL_PROMPT"] = "0"
        subprocess.run(["git", "clone", url, clone_path], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env, timeout=60)
        return clone_path
    except subprocess.TimeoutExpired:
        print(f"[REPO] Git clone timed out for {url}")
        return ""
    except subprocess.CalledProcessError as e:
        print(f"[REPO] Failed to clone repository: {e.stderr.decode('utf-8', errors='ignore')}")
        return ""

def detect_project_type(repo_path: str) -> dict:
    """Detects the project type based on root files in the repository."""
    try:
        files = os.listdir(repo_path)
    except Exception:
        files = []
    
    project_type = "Unknown"
    framework = "Unknown"
    
    if "package.json" in files:
        project_type = "Node"
        if any(f.startswith("next.config") for f in files):
            framework = "Next.js"
        elif any(f.startswith("vite.config") for f in files):
            framework = "Vite"
    elif "requirements.txt" in files or "pyproject.toml" in files or "setup.py" in files:
        project_type = "Python"
        if "manage.py" in files:
            framework = "Django"
    elif "pom.xml" in files or "build.gradle" in files or "gradlew" in files:
        project_type = "Java"
    elif "go.mod" in files:
        project_type = "Go"
    elif "Cargo.toml" in files:
        project_type = "Rust"
        
    print(f"[REPO] Project type: {project_type} ({framework})")
    
    return {
        "project_type": project_type,
        "framework": framework
    }

def cleanup_workspace(workspace: str):
    """Safely deletes the temporary workspace."""
    try:
        shutil.rmtree(workspace, ignore_errors=True)
    except Exception as e:
        print(f"[REPO] Cleanup failed for {workspace}: {e}")
