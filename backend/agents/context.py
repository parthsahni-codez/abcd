from dataclasses import dataclass, field
from typing import Any


@dataclass
class AgentContext:
    repository_url: str
    workspace: str
    repo_path: str
    project: dict[str, Any] = field(default_factory=dict)
    dependencies: dict[str, Any] = field(default_factory=dict)
    static_analysis: dict[str, Any] = field(default_factory=dict)
    tests: dict[str, Any] = field(default_factory=dict)
    logs: dict[str, Any] = field(default_factory=dict)
    root_cause: dict[str, Any] = field(default_factory=dict)
    fix_plan: dict[str, Any] | None = None
    validation: dict[str, Any] = field(default_factory=dict)
    agent_status: dict[str, str] = field(default_factory=dict)
    iteration: int = 1

    def mark(self, agent: str, status: str) -> None:
        self.agent_status[agent] = status
