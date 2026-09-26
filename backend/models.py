from typing import Literal

from pydantic import BaseModel, Field


class ErrorLogRequest(BaseModel):
    repository_url: str = Field(..., min_length=1)
    error_log: str | None = None


class AnalysisResponse(BaseModel):
    status: str
    repository: str
    project_type: str
    framework: str
    package_manager: str | None = None
    install_command: str | None = None
    check_command: str | None = None
    install_exit_code: int | None = None
    exit_code: int
    stdout: str
    stderr: str
    detected_error: str
    error_type: str
    root_cause: str
    suggested_fix: str
    confidence: int = Field(ge=0, le=100)
    ai_response: str
    fix_plan: dict | None = None
    evidence: list[str] = Field(default_factory=list)
    fixability: str = "uncertain"
    agents: dict[str, str] = Field(default_factory=dict)
    verification: dict = Field(default_factory=dict)
    iterations: int = 1
    final_status: str = "ANALYSIS_ONLY"


class FixPlan(BaseModel):
    action: Literal["modify_file", "install_package", "install_dependency"]
    file: str | None = None
    operation: Literal["append_line", "replace_text"] | None = None
    old_content: str | None = None
    content: str | None = None
    package_manager: Literal["npm", "pnpm", "yarn", "pip"] | None = None
    package: str | None = None


class FixRequest(BaseModel):
    repository_url: str = Field(..., min_length=1)
    plan: FixPlan


class ApplyRepositoryRequest(BaseModel):
    repository_url: str = Field(..., min_length=1)
    fix_plan: FixPlan


class ApplyRepositoryResponse(BaseModel):
    status: Literal["success", "failure"]
    repository: str
    branch: str | None = None
    changed_files: list[str] = Field(default_factory=list)
    commit_sha: str | None = None
    commit_message: str | None = None
    verification_command: str | None = None
    verification_exit_code: int | None = None
    push_status: Literal["success", "failure", "not_attempted"]
    pull_request_url: str | None = None
    pull_request_number: int | None = None
    pull_request_status: Literal["success", "failure", "not_attempted"] = "not_attempted"
    stages: list[str] = Field(default_factory=list)
    message: str


class FixResponse(BaseModel):
    status: Literal["success", "failure"]
    repository: str
    action: str
    changed_file: str | None = None
    verification_exit_code: int
    install_exit_code: int | None = None
    stdout: str
    stderr: str
    message: str
    iterations: int = 1
