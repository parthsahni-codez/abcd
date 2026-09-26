import os
import requests
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:latest")

RESPONSE_SCHEMA = {
    "type": "object",
    "required": ["error", "error_type", "root_cause", "evidence", "fixability", "suggested_fix", "confidence", "fix_plan"],
    "additionalProperties": False,
    "properties": {
        "error": {"type": "string"},
        "error_type": {"type": "string"},
        "root_cause": {"type": "string"},
        "evidence": {"type": "array", "items": {"type": "string"}},
        "fixability": {"type": "string"},
        "suggested_fix": {"type": "string"},
        "confidence": {"type": "integer", "minimum": 0, "maximum": 100},
        "fix_plan": {
            "anyOf": [
                {"type": "null"},
                {"oneOf": [
                    {"type": "object", "additionalProperties": False, "required": ["action", "file", "operation", "old_content", "content"], "properties": {
                        "action": {"const": "modify_file"},
                        "file": {"type": "string"},
                        "operation": {"type": "string", "enum": ["append_line", "replace_text"]},
                        "old_content": {"type": "string"},
                        "content": {"type": "string"},
                    }},
                    {"type": "object", "additionalProperties": False, "required": ["action", "package_manager", "package"], "properties": {
                        "action": {"type": "string", "enum": ["install_package", "install_dependency"]},
                        "package_manager": {"type": "string"},
                        "package": {"type": "string"},
                    }},
                ]},
            ]
        },
    },
}

def ask_qwen(prompt: str) -> str:
    """
    Sends a prompt to the local Ollama API running the Qwen model.
    """
    url = f"{OLLAMA_URL}/api/generate"
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": RESPONSE_SCHEMA,
        "options": {"temperature": 0},
    }
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as error:
        raise RuntimeError(f"Could not connect to Ollama at {url}: {error}") from error
    except ValueError as error:
        raise RuntimeError("Ollama returned an invalid JSON response") from error

    model_response = data.get("response")
    if not isinstance(model_response, str) or not model_response.strip():
        raise RuntimeError("Ollama returned no model response")

    return model_response
