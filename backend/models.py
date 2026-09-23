from pydantic import BaseModel
from typing import Optional

class ErrorLogRequest(BaseModel):
    error_log: str

class AIResponse(BaseModel):
    response: str

class RepositoryAnalyzeRequest(BaseModel):
    repository_url: str

class RepositoryAnalyzeResponse(BaseModel):
    repository: str
    project_type: str
    framework: str
    build_command: str
    exit_code: int
    stdout: str
    stderr: str
    error: str
    analysis: str
