import os
import subprocess


MAX_OUTPUT = 12000


def _run(command: list[str], cwd: str, timeout: int, env: dict[str, str] | None = None) -> dict:
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout,
            check=False,
            env=env,
        )
        return {
            "command": " ".join(command),
            "stdout": result.stdout[-MAX_OUTPUT:],
            "stderr": result.stderr[-MAX_OUTPUT:],
            "exit_code": result.returncode,
        }
    except FileNotFoundError as error:
        return {"command": " ".join(command), "stdout": "", "stderr": str(error), "exit_code": -1}
    except subprocess.TimeoutExpired as error:
        stdout = error.stdout or ""
        stderr = error.stderr or ""
        if isinstance(stdout, bytes):
            stdout = stdout.decode("utf-8", errors="replace")
        if isinstance(stderr, bytes):
            stderr = stderr.decode("utf-8", errors="replace")
        return {
            "command": " ".join(command),
            "stdout": stdout[-MAX_OUTPUT:],
            "stderr": f"{stderr}\nCommand timed out after {timeout} seconds.",
            "exit_code": -1,
        }


def run_tests(repo_path: str, project_info: dict) -> dict:
    """Install dependencies and run a detected project check safely."""
    project_type = project_info.get("project_type")
    timeout = int(os.getenv("ANALYSIS_COMMAND_TIMEOUT", "180"))
    install_result = {"command": None, "stdout": "", "stderr": "", "exit_code": 0}
    check_result = {"command": None, "stdout": "", "stderr": "", "exit_code": 0}

    if project_type == "Node.js":
        manager = project_info.get("package_manager") or "npm"
        executable = f"{manager}.cmd" if os.name == "nt" else manager
        install_commands = {
            "npm": [executable, "install", "--ignore-scripts", "--no-audit", "--no-fund"],
            "pnpm": [executable, "install", "--ignore-scripts"],
            "yarn": [executable, "install", "--ignore-scripts"],
        }
        command_env = os.environ.copy()
        if manager == "npm":
            command_env["npm_config_cache"] = os.path.join(repo_path, ".npm-cache")
        install_result = _run(install_commands[manager], repo_path, timeout, command_env)
        scripts = project_info.get("package_scripts", {})
        if install_result["exit_code"] == 0:
            if "build" in scripts:
                check_result = _run([executable, "run", "build"], repo_path, timeout, command_env)
            elif "test" in scripts:
                check_result = _run([executable, "test"], repo_path, timeout, command_env)
            else:
                check_result = {"command": "No build or test script", "stdout": "", "stderr": "", "exit_code": 0}
    elif project_type == "Static HTML/CSS/JavaScript":
        check_result = {"command": "Static file check", "stdout": "index.html found", "stderr": "", "exit_code": 0}
    else:
        check_result = {
            "command": "Unsupported project type",
            "stdout": "",
            "stderr": f"No safe build/test adapter for {project_type}.",
            "exit_code": 2,
        }

    return {
        "install_command": install_result["command"],
        "install_stdout": install_result["stdout"],
        "install_stderr": install_result["stderr"],
        "install_exit_code": install_result["exit_code"],
        "command": check_result["command"],
        "stdout": check_result["stdout"],
        "stderr": check_result["stderr"],
        "exit_code": check_result["exit_code"],
    }
