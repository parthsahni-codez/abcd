def extract_error(stdout: str, stderr: str, exit_code: int) -> str:
    """
    Extracts the most relevant error message from the logs.
    """
    if exit_code == 0:
        return "No error detected. Build/Test succeeded."
        
    # If there's stderr, it's often the best place to look
    if stderr and len(stderr.strip()) > 0:
        lines = stderr.splitlines()
        for index, line in enumerate(lines):
            if any(marker in line for marker in ("CssSyntaxError", "Module not found", "Selector \"", "Error:")):
                start = max(0, index - 2)
                return "\n".join(lines[start:start + 12])[-4000:]
        return stderr[-4000:]
        
    # If no stderr, look at stdout (some tools output errors to stdout)
    if stdout and len(stdout.strip()) > 0:
        return stdout[-4000:]
        
    return "Unknown error. No stdout or stderr output."
