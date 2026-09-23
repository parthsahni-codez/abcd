import subprocess
import os

def run_tests(repo_path: str, project_info: dict) -> dict:
    """
    Determines and runs the appropriate build/test command.
    Returns a dict with command, stdout, stderr, and exit_code.
    """
    project_type = project_info.get("project_type")
    
    # Determine command based on project type and existing files
    command = "echo 'No build command defined for this project type'"
    files = os.listdir(repo_path) if os.path.exists(repo_path) else []
    
    if project_type == "Node":
        if "package-lock.json" in files:
            command = "npm install && npm run build"
        elif "yarn.lock" in files:
            command = "yarn install && yarn build"
        elif "pnpm-lock.yaml" in files:
            command = "pnpm install && pnpm build"
        else:
            command = "npm install && npm run build"
            
    elif project_type == "Python":
        if "requirements.txt" in files:
            command = "pip install -r requirements.txt && pytest"
        else:
            command = "pytest"
            
    elif project_type == "Java":
        if "pom.xml" in files:
            command = "mvn test"
        elif "build.gradle" in files:
            command = "gradle test"
        elif "gradlew" in files:
            command = "./gradlew test"
            
    elif project_type == "Go":
        command = "go test ./..."
        
    elif project_type == "Rust":
        command = "cargo test"
        
    print(f"[REPO] Build command: {command}")
    print(f"[BUILD] Running: {command} in {repo_path}")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=repo_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=120
        )
        stdout = result.stdout
        stderr = result.stderr
        exit_code = result.returncode
    except subprocess.TimeoutExpired as e:
        stdout = e.stdout.decode('utf-8') if e.stdout else ""
        stderr = "Command timed out after 120 seconds."
        exit_code = -1
    except Exception as e:
        stdout = ""
        stderr = str(e)
        exit_code = -1
        
    print(f"[BUILD] Exit code: {exit_code}")
    print(f"[BUILD] stdout length: {len(stdout)}")
    print(f"[BUILD] stderr length: {len(stderr)}")
    
    return {
        "command": command,
        "stdout": stdout,
        "stderr": stderr,
        "exit_code": exit_code
    }
