import json
import os
from typing import Any

DEFAULT_CONFIG: dict[str, Any] = {
    "jira_email": "",
    "jira_token": "",
    "jira_url": "",
    "ollama_url": "http://localhost:11434",
    "ollama_model": "gemma3:1b",
    "groq_api_key": "",
    "provider": "groq",
}

CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")


def load_config() -> dict[str, Any]:
    """Load configuration from the local config.json file.

    Falls back to DEFAULT_CONFIG (merged) if the file doesn't exist or is
    corrupted, so callers always receive a complete config dict.
    """
    config = dict(DEFAULT_CONFIG)
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                saved = json.load(f)
            config.update(saved)
        except (json.JSONDecodeError, OSError):
            pass
    return config


def save_config(config: dict[str, Any]) -> None:
    """Persist configuration to the local config.json file."""
    config = {k: v for k, v in config.items() if k in DEFAULT_CONFIG}
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)
    _hide_secrets()


def _hide_secrets() -> None:
    """Restrict file permissions to the current user (best-effort on Windows)."""
    try:
        os.chmod(CONFIG_FILE, 0o600)
    except (OSError, NotImplementedError):
        pass


if __name__ == "__main__":
    cfg = load_config()
    save_config(cfg)
