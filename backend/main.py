from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from models import ErrorLogRequest, AIResponse, RepositoryAnalyzeRequest, RepositoryAnalyzeResponse
from ollama_service import ask_qwen
import repository_scanner
import test_runner
import log_inspector
import os

app = FastAPI(
    title="AI DevOps Error Resolution System",
    description="Backend API for automated repository error analysis and fixing",
    version="1.0.0"
)

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for testing
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """
    Health check endpoint
    """
    return {
        "status": "success",
        "message": "AI DevOps Backend is running"
    }

@app.post("/api/analyze-error", response_model=AIResponse)
def analyze_error(request: ErrorLogRequest):
    """
    Analyzes a raw error log using the local Ollama Qwen model (Legacy/Mock flow).
    """
    prompt = f"""You are an expert DevOps Error Analysis and Code Fix Agent.

Analyze the following error log. Identify:
1. Error type
2. Root cause
3. Affected component
4. Affected file if known
5. Required fix
6. Whether the fix is a dependency/configuration/code change

Do NOT write code to modify files directly yet. Output a structured analysis.

Error Log:
{request.error_log}
"""
    
    response_text = ask_qwen(prompt)
    return {"response": response_text}

@app.post("/api/repository/analyze", response_model=RepositoryAnalyzeResponse)
def analyze_repository(request: RepositoryAnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Clones, tests, and analyzes a repository.
    """
    url = request.repository_url
    
    # 1. Create temporary workspace and clone
    workspace = repository_scanner.get_temp_workspace()
    repo_path = repository_scanner.clone_repository(url, workspace)
    
    if not repo_path or not os.path.exists(repo_path):
        repository_scanner.cleanup_workspace(workspace)
        return RepositoryAnalyzeResponse(
            repository=url,
            project_type="Unknown",
            framework="Unknown",
            build_command="None",
            exit_code=-1,
            stdout="",
            stderr="",
            error="Failed to clone repository.",
            analysis="Could not analyze because cloning failed."
        )

    # 2. Detect project type
    project_info = repository_scanner.detect_project_type(repo_path)
    
    # 3. Run build/test
    test_results = test_runner.run_tests(repo_path, project_info)
    
    # 4. Extract error
    extracted_error = log_inspector.extract_error(
        test_results["stdout"], 
        test_results["stderr"], 
        test_results["exit_code"]
    )
    
    # 5. Build prompt for Qwen
    prompt = f"""You are a DevOps Error Analysis and Code Fix Agent.
Analyze the following actual repository build/test results.

Repository: {url}
Project type: {project_info['project_type']}
Framework: {project_info['framework']}
Build command: {test_results['command']}
Exit code: {test_results['exit_code']}

STDOUT:
{test_results['stdout'][-1000:] if len(test_results['stdout']) > 1000 else test_results['stdout']}

STDERR:
{test_results['stderr'][-1000:] if len(test_results['stderr']) > 1000 else test_results['stderr']}

Analyze the REAL error from the logs above and output a structured diagnosis:
1. Error type
2. Root cause
3. Affected component/file
4. Required fix
"""

    print("[AI] Sending actual repository context to Qwen")
    analysis = ask_qwen(prompt)
    print("[AI] Qwen response received")
    
    # Schedule cleanup in background so response returns quickly
    background_tasks.add_task(repository_scanner.cleanup_workspace, workspace)
    
    return RepositoryAnalyzeResponse(
        repository=url,
        project_type=project_info["project_type"],
        framework=project_info["framework"],
        build_command=test_results["command"],
        exit_code=test_results["exit_code"],
        stdout=test_results["stdout"][:2000],  # truncate for frontend display if huge
        stderr=test_results["stderr"][:2000],
        error=extracted_error,
        analysis=analysis
    )
