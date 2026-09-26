import json
import os


def audit(repo_path: str, project_info: dict) -> dict:
	"""Read dependency manifests without installing or executing project code."""
	package_file = os.path.join(repo_path, "package.json")
	if os.path.isfile(package_file):
		with open(package_file, encoding="utf-8") as file:
			package = json.load(file)
		return {
			"package_manager": project_info.get("package_manager") or "npm",
			"manifests": ["package.json"],
			"dependencies": package.get("dependencies", {}),
			"dev_dependencies": package.get("devDependencies", {}),
			"issues": [],
		}
	requirements = os.path.join(repo_path, "requirements.txt")
	if os.path.isfile(requirements):
		return {"package_manager": "pip", "manifests": ["requirements.txt"], "issues": []}
	return {"package_manager": project_info.get("package_manager"), "manifests": [], "issues": []}
