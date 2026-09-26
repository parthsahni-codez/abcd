import os


IGNORED_DIRECTORIES = {"node_modules", "node_modules_old", ".next", "dist", "build", "venv", "__pycache__", "temp_repos", ".git"}


def analyze(repo_path: str) -> dict:
	"""Inventory source/config files while excluding generated and dependency trees."""
	files = []
	for root, directories, names in os.walk(repo_path):
		directories[:] = [directory for directory in directories if directory not in IGNORED_DIRECTORIES]
		for name in names:
			path = os.path.join(root, name)
			if os.path.getsize(path) <= 1_000_000:
				files.append(os.path.relpath(path, repo_path))
	return {"files": files[:500], "file_count": len(files), "issues": []}
