"""LLM client — Groq (default) with Ollama fallback."""

from __future__ import annotations

import json
import requests
from typing import Any

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
# gemma2-9b-it was decommissioned by Groq on Aug 8, 2025.
# llama-3.1-8b-instant is the recommended fast + cost-efficient replacement.
GROQ_DEFAULT_MODEL = "llama-3.1-8b-instant"


def _call_groq(prompt: str, config: dict[str, Any]) -> tuple[str | None, str | None]:
    """Send a prompt to Groq.

    Returns a ``(result, error)`` tuple. *result* is the response text on
    success or ``None`` on failure. *error* is a human-readable description
    of what went wrong (or ``None`` on success).
    """
    api_key = config.get("groq_api_key", "").strip()
    if not api_key:
        return None, "Groq API key is missing from config"

    url = f"{GROQ_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_DEFAULT_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip(), None
    except requests.HTTPError as e:
        status = e.response.status_code if e.response is not None else "Unknown"
        detail = ""
        if e.response is not None:
            try:
                detail = e.response.json().get("error", {}).get("message", "")
            except (json.JSONDecodeError, ValueError):
                detail = e.response.text[:300]
        return None, f"Groq HTTP {status}: {detail or e}"
    except requests.ConnectionError as e:
        return None, f"Groq connection error: {e}"
    except requests.RequestException as e:
        return None, f"Groq request error: {e}"
    except (KeyError, IndexError) as e:
        return None, f"Groq response parse error: {e}"


def _call_ollama(prompt: str, config: dict[str, Any]) -> tuple[str | None, str | None]:
    """Send a prompt to Ollama.

    Returns a ``(result, error)`` tuple. *result* is the response text on
    success or ``None`` on failure. *error* is a human-readable description
    of what went wrong (or ``None`` on success).
    """
    ollama_url = config.get("ollama_url", "http://localhost:11434").rstrip("/")
    model = config.get("ollama_model", "gemma3:1b")

    url = f"{ollama_url}/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
    }

    try:
        resp = requests.post(url, json=payload, timeout=120)
        resp.raise_for_status()
        # Ollama returns JSON lines or a single JSON object depending on version
        try:
            data = resp.json()
            if isinstance(data, list):
                text = "".join(chunk.get("response", "") for chunk in data)
            else:
                text = data.get("response", "")
            result = text.strip()
            return (result or None, None) if result else (None, f"Ollama returned an empty response for model '{model}' at {ollama_url}")
        except json.JSONDecodeError:
            # Fallback: parse streaming JSON lines manually
            lines = resp.text.strip().split("\n")
            text = ""
            for line in lines:
                try:
                    chunk = json.loads(line)
                    text += chunk.get("response", "")
                except json.JSONDecodeError:
                    continue
            return (text.strip() or None, None) if text.strip() else (None, f"Ollama returned an empty response for model '{model}' at {ollama_url}")
    except requests.ConnectionError:
        return None, f"Ollama server not running at {ollama_url}. Start it with `ollama serve`."
    except requests.HTTPError as e:
        status = e.response.status_code if e.response is not None else "Unknown"
        detail = ""
        if e.response is not None:
            try:
                detail = e.response.json().get("error", "") or e.response.text[:300]
            except (json.JSONDecodeError, ValueError):
                detail = e.response.text[:300]
        return None, f"Ollama HTTP {status}: {detail or e}"
    except requests.RequestException as e:
        return None, f"Ollama request error: {e}"


def generate(prompt: str, config: dict[str, Any]) -> str:
    """Generate a response from the LLM.

    Default flow: try Groq first, fall back to Ollama if Groq fails.
    If provider is explicitly 'ollama', call Ollama directly.
    Raises RuntimeError if both providers fail — the error message includes
    the specific reason each provider failed.
    """
    provider = config.get("provider", "groq")

    if provider == "ollama":
        result, err1 = _call_ollama(prompt, config)
        if result:
            return result
        # If Ollama fails explicitly, try Groq as last resort
        result, err2 = _call_groq(prompt, config)
        if result:
            return result
        raise RuntimeError(
            "Both Ollama and Groq failed to generate a response.\n"
            f"  Ollama: {err1}\n"
            f"  Groq: {err2}"
        )

    # Default: Groq first, Ollama fallback
    result, err1 = _call_groq(prompt, config)
    if result:
        return result

    result, err2 = _call_ollama(prompt, config)
    if result:
        return result

    raise RuntimeError(
        "Both Groq and Ollama failed to generate a response.\n"
        f"  Groq: {err1}\n"
        f"  Ollama: {err2}"
    )
