import os
import subprocess
import uuid
import logging
from pathlib import Path

import requests
import repository_scanner
import test_runner
from fix_executor import apply_plan


logger = logging.getLogger(__name__)


def _github_environment(token: str) -> dict[str, str]:
	environment = os.environ.copy()
	environment["GIT_TERMINAL_PROMPT"] = "0"
	environment["GIT_CONFIG_COUNT"] = "1"
	environment["GIT_CONFIG_KEY_0"] = "http.https://github.com/.extraheader"
	environment["GIT_CONFIG_VALUE_0"] = f"AUTHORIZATION: bearer {token}"
	return environment


def _run_git(command: list[str], cwd: str | None, token: str, timeout: int = 180) -> subprocess.CompletedProcess[str]:
	return subprocess.run(
		command,
		cwd=cwd,
		env=_github_environment(token),
		capture_output=True,
		text=True,
		timeout=timeout,
		check=False,
	)


def _failure(message: str, branch: str | None = None, changed_files: list[str] | None = None, verification_command: str | None = None, verification_exit_code: int | None = None, stages: list[str] | None = None):
	completed_stages = stages or []
	return {
		"status": "failure",
		"repository": "",
		"branch": branch,
		"changed_files": changed_files or [],
		"commit_sha": None,
		"commit_message": None,
		"verification_command": verification_command,
		"verification_exit_code": verification_exit_code,
		"push_status": "success" if "PUSHED" in completed_stages else "not_attempted",
		"pull_request_status": "success" if "PR_CREATED" in completed_stages else "failure" if "PUSHED" in completed_stages else "not_attempted",
		"stages": completed_stages,
		"message": message,
	}


def _repository_slug(normalized_url: str) -> str:
	return normalized_url.removesuffix(".git").removeprefix("https://github.com/")


def _create_pull_request(normalized_url: str, token: str, branch: str, base: str, body: str) -> dict:
	response = requests.post(
		f"https://api.github.com/repos/{_repository_slug(normalized_url)}/pulls",
		headers={"Accept": "application/vnd.github+json", "Authorization": f"Bearer {token}", "X-GitHub-Api-Version": "2022-11-28"},
		json={"title": "fix: AI-generated fix for build failure", "head": branch, "base": base, "body": body},
		timeout=30,
	)
	if response.status_code >= 400:
		raise RuntimeError(f"Pull Request creation failed: {response.text[-4000:]}")
	data = response.json()
	return {"url": data.get("html_url"), "number": data.get("number")}


def publish_verified_fix(repository_url: str, plan: dict, details: dict | None = None) -> dict:
	token = os.getenv("GITHUB_TOKEN")
	if not token:
		raise RuntimeError("GitHub authentication is not configured.")

	normalized_url = repository_scanner.validate_github_url(repository_url)
	workspace = repository_scanner.get_temp_workspace()
	branch = f"autodevops/fix-{uuid.uuid4().hex[:8]}"
	stages: list[str] = ["FIX_VERIFIED"]
	verification_command = None
	verification_exit_code = None
	try:
		repository_name = normalized_url.rstrip("/").split("/")[-1][:-4]
		repo_path = str(Path(workspace) / repository_name)
		clone = _run_git(["git", "clone", "--depth", "1", normalized_url, repo_path], None, token)
		if clone.returncode != 0:
			raise RuntimeError(f"Repository clone failed: {clone.stderr[-4000:]}")

		branch_result = _run_git(["git", "checkout", "-b", branch], repo_path, token)
		if branch_result.returncode != 0:
			raise RuntimeError(f"Branch creation failed: {branch_result.stderr[-4000:]}")
		stages.append("BRANCH_CREATED")
		logger.info("[GITHUB] BRANCH_CREATED %s", branch)

		applied = apply_plan(repo_path, plan)
		verification = test_runner.run_tests(repo_path, repository_scanner.detect_project_type(repo_path))
		verification_exit_code = verification.get("exit_code", 0)
		if verification_exit_code == 0:
			verification_exit_code = verification.get("install_exit_code", 0)
		verification_command = verification.get("command") or verification.get("install_command")
		if verification_exit_code != 0:
			raise RuntimeError(f"FIX_FAILED: verification failed with exit code {verification_exit_code}: {verification.get('stderr', '')[-4000:]}")

		changed_file = applied.get("changed_file")
		if changed_file:
			intended_files = [changed_file]
		else:
			diff = _run_git(["git", "diff", "--name-only"], repo_path, token)
			all_changed_files = [line.strip() for line in diff.stdout.splitlines() if line.strip()]
			allowed_manifests = {"package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "requirements.txt", "pyproject.toml"}
			if any(path not in allowed_manifests for path in all_changed_files):
				raise RuntimeError("Dependency fix changed an unexpected file; nothing was pushed.")
			intended_files = all_changed_files
		if not intended_files:
			raise RuntimeError("No intended file changes were produced by the verified fix.")

		stage = _run_git(["git", "add", "--", *intended_files], repo_path, token)
		if stage.returncode != 0:
			raise RuntimeError(f"Staging failed: {stage.stderr[-4000:]}")
		staged = _run_git(["git", "diff", "--cached", "--name-only"], repo_path, token)
		staged_files = [line.strip() for line in staged.stdout.splitlines() if line.strip()]
		if set(staged_files) != set(intended_files):
			raise RuntimeError("Staged files did not match the intended verified fix files.")

		commit_message = "Apply verified AutoDevOps fix"
		commit = _run_git(["git", "-c", "user.name=AutoDevOps", "-c", "user.email=autodevops@noreply.local", "commit", "-m", commit_message], repo_path, token)
		if commit.returncode != 0:
			raise RuntimeError(f"Commit failed: {commit.stderr[-4000:]}")
		commit_sha_result = _run_git(["git", "rev-parse", "HEAD"], repo_path, token)
		commit_sha = commit_sha_result.stdout.strip()
		stages.append("COMMITTED")
		logger.info("[GITHUB] COMMITTED %s", commit_sha)

		remote = requests.get(
			f"https://api.github.com/repos/{_repository_slug(normalized_url)}",
			headers={"Accept": "application/vnd.github+json", "Authorization": f"Bearer {token}", "X-GitHub-Api-Version": "2022-11-28"},
			timeout=30,
		)
		if remote.status_code >= 400:
			raise RuntimeError(f"GitHub authentication or repository lookup failed: {remote.text[-4000:]}")
		base_branch = remote.json().get("default_branch")
		if not base_branch:
			raise RuntimeError("GitHub repository did not provide a default branch.")

		push = _run_git(["git", "push", "origin", branch], repo_path, token)
		if push.returncode != 0:
			raise RuntimeError(f"Push failed: {push.stderr[-4000:]}")
		stages.append("PUSHED")
		logger.info("[GITHUB] PUSHED %s", branch)
		metadata = details or {}
		pr_body = "\n".join([
			"## AutoDevOps verified fix",
			"",
			f"Original error: {metadata.get('original_error', 'Captured build/test failure')}",
			f"Root cause identified by AI: {metadata.get('root_cause', 'See verified fix plan')}",
			f"Files changed: {', '.join(staged_files)}",
			f"Fix generated: {plan}",
			f"Verification command: {verification_command}",
			f"Verification result: exit code {verification_exit_code}",
			f"Repair attempts: {metadata.get('iterations', 1)}",
			"Status: FIX_VERIFIED",
		])
		pull_request = _create_pull_request(normalized_url, token, branch, base_branch, pr_body)
		stages.append("PR_CREATED")
		logger.info("[GITHUB] PR_CREATED #%s", pull_request["number"])
		return {
			"status": "success",
			"repository": normalized_url,
			"branch": branch,
			"changed_files": staged_files,
			"commit_sha": commit_sha,
			"commit_message": commit_message,
			"verification_command": verification_command,
			"verification_exit_code": verification_exit_code,
			"push_status": "success",
			"pull_request_url": pull_request["url"],
			"pull_request_number": pull_request["number"],
			"pull_request_status": "success",
			"stages": stages,
			"message": "The verified fix was pushed to the new branch and a Pull Request was created.",
		}
	except (RuntimeError, subprocess.TimeoutExpired, requests.RequestException) as error:
		return {
			**_failure(str(error), branch=branch, verification_command=verification_command, verification_exit_code=verification_exit_code, stages=stages),
			"repository": normalized_url,
		}
	finally:
		repository_scanner.cleanup_workspace(workspace)
