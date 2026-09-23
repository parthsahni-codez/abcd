def extract_error(stdout: str, stderr: str, exit_code: int) -> str:
    """
    Extracts the most relevant error message from the logs.
    """
    if exit_code == 0:
        return "No error detected. Build/Test succeeded."
        
    # If there's stderr, it's often the best place to look
    if stderr and len(stderr.strip()) > 0:
        # Take the last 2000 characters of stderr to capture the actual error
        return stderr[-2000:]
        
    # If no stderr, look at stdout (some tools output errors to stdout)
    if stdout and len(stdout.strip()) > 0:
        return stdout[-2000:]
        
    return "Unknown error. No stdout or stderr output."
