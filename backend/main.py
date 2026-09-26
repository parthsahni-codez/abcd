import logging
import hashlib
import json
import subprocess

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agents import orchestrator_agent
from agents.context import AgentContext
from agents.validation_agent import run as run_validation
from models import AnalysisResponse, ApplyRepositoryRequest, ApplyRepositoryResponse, ErrorLogRequest, FixRequest, FixResponse
import repository_scanner
import github_service


verified_fixes: dict[str, dict] = {}


def _fix_key(repository_url: str, plan: dict) -> str:
    normalized = repository_scanner.validate_github_url(repository_url)
    payload = json.dumps(plan, sort_keys=True, separators=(",", ":"))
    return f"{normalized}:{hashlib.sha256(payload.encode('utf-8')).hexdigest()}"

logging.basicConfig(level=logging.INFO, format="%(message)s")


app = FastAPI(
    title="AI DevOps Error Resolution System",
    description="Clone, check, and diagnose public GitHub repositories.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/")
def read_root():
    return {"status": "success", "message": "AI DevOps Backend is running"}


@app.post("/api/analyze-error", response_model=AnalysisResponse)
def analyze_error(request: ErrorLogRequest):
    context = None
    try:
        context = orchestrator_agent.analyze(request.repository_url)
        tests = context.tests
        logs = context.logs
        diagnosis = context.root_cause
        exit_code = logs.get("exit_code", 0)
        final_status = "NO_ACTIONABLE_FAILURE" if exit_code == 0 and not context.fix_plan else "FIX_GENERATED" if context.fix_plan else "ANALYSIS_ONLY"
        if context.fix_plan:
            verified_fixes[_fix_key(context.repository_url, context.fix_plan)] = {
                "verified": False,
                "original_error": diagnosis.get("error", logs.get("error", "")),
                "root_cause": diagnosis.get("root_cause", ""),
                "iterations": context.iteration,
            }

        return AnalysisResponse(
            status="success" if exit_code == 0 else "failure",
            repository=context.repository_url,
            project_type=context.project.get("project_type", "Unknown"),
            framework=context.project.get("framework", "Unknown"),
            package_manager=context.project.get("package_manager"),
            install_command=tests.get("install_command"),
            check_command=tests.get("command"),
            install_exit_code=tests.get("install_exit_code"),
            exit_code=exit_code,
            stdout=logs.get("stdout", ""),
            stderr=logs.get("stderr", ""),
            detected_error=diagnosis.get("error", logs.get("error", "")),
            error_type=diagnosis["error_type"],
            root_cause=diagnosis["root_cause"],
            suggested_fix=diagnosis["suggested_fix"],
            confidence=diagnosis["confidence"],
            ai_response=diagnosis.get("ai_response", ""),
            fix_plan=context.fix_plan,
            evidence=diagnosis.get("evidence", []),
            fixability=diagnosis.get("fixability", "uncertain"),
            agents=context.agent_status,
            iterations=context.iteration,
            final_status=final_status,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Repository analysis failed: {error}") from error
    finally:
        if context:
            repository_scanner.cleanup_workspace(context.workspace)


@app.post("/api/fix", response_model=FixResponse)
def apply_fix(request: FixRequest):
    workspace = None
    try:
        repository_url = repository_scanner.validate_github_url(request.repository_url)
        workspace = repository_scanner.get_temp_workspace()
        repo_path = repository_scanner.clone_repository(repository_url, workspace)
        project_info = repository_scanner.detect_project_type(repo_path)
        context = AgentContext(repository_url=repository_url, workspace=workspace, repo_path=repo_path, project=project_info, fix_plan=request.plan.model_dump())
        verification = orchestrator_agent.validate_with_retries(context, max_iterations=3)
        applied = verification.get("applied") or {}
        install = applied.get("install")
        verification_result = verification.get("verification") or {}
        if install and install["exit_code"] != 0:
            return FixResponse(
                status="failure",
                repository=repository_url,
                action=applied["action"],
                changed_file=applied["changed_file"],
                verification_exit_code=install["exit_code"],
                install_exit_code=install["exit_code"],
                stdout=install["stdout"],
                stderr=install["stderr"],
                message="Dependency installation failed; the cloned repository was not verified.",
                iterations=context.iteration,
            )

        response = FixResponse(
            status="success" if verification.get("fix_verified") else "failure",
            repository=repository_url,
            action=applied.get("action", request.plan.action),
            changed_file=applied.get("changed_file"),
            verification_exit_code=verification.get("exit_code", -1),
            install_exit_code=install["exit_code"] if install else verification_result.get("install_exit_code"),
            stdout=(verification_result.get("install_stdout", "") + "\n" + verification_result.get("stdout", "")).strip(),
            stderr=(verification_result.get("install_stderr", "") + "\n" + verification_result.get("stderr", "")).strip(),
            message="Fix applied in an isolated clone and verification completed.",
            iterations=context.iteration,
        )
        if response.status == "success":
            key = _fix_key(repository_url, request.plan.model_dump(exclude_none=True))
            verified_fixes[key] = {**verified_fixes.get(key, {}), "verified": True, "iterations": response.iterations}
        return response
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except (RuntimeError, subprocess.TimeoutExpired) as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    finally:
        if workspace:
            repository_scanner.cleanup_workspace(workspace)


@app.post("/api/apply-to-repository", response_model=ApplyRepositoryResponse)
def apply_to_repository(request: ApplyRepositoryRequest):
    try:
        repository_url = repository_scanner.validate_github_url(request.repository_url)
        plan = request.fix_plan.model_dump(exclude_none=True)
        key = _fix_key(repository_url, plan)
        if not verified_fixes.get(key, {}).get("verified"):
            raise HTTPException(status_code=409, detail="This fix plan has not passed isolated verification.")
        result = github_service.publish_verified_fix(repository_url, plan, verified_fixes[key])
        return ApplyRepositoryResponse(**result)
    except HTTPException:
        raise
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
