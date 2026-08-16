"""Settings screen (Screen 2) — enter and persist Jira + LLM credentials."""

import streamlit as st
from pathlib import Path
import sys

# Allow importing config_store when running via streamlit run src/app.py
_SRC_DIR = Path(__file__).resolve().parent.parent
if str(_SRC_DIR) not in sys.path:
    sys.path.insert(0, str(_SRC_DIR))

from config_store import load_config, save_config, DEFAULT_CONFIG


st.set_page_config(page_title="Settings", page_icon="⚙️", layout="centered")

st.title("Settings")

config = load_config()

st.subheader("Jira")
jira_email = st.text_input("JIRA EMAIL", value=config.get("jira_email", ""))
jira_token = st.text_input("JIRA TOKEN", value=config.get("jira_token", ""), type="password")
jira_url = st.text_input("JIRA URL", value=config.get("jira_url", ""))

st.subheader("Ollama (local)")
ollama_url = st.text_input("OLLAMA URL", value=config.get("ollama_url", "http://localhost:11434"))
ollama_model = st.text_input("OLLAMA MODEL", value=config.get("ollama_model", "gemma3:1b"))

st.subheader("Groq")
groq_api_key = st.text_input("GROQ Token", value=config.get("groq_api_key", ""), type="password")

st.subheader("LLM Provider")
provider = st.radio(
    "Default provider",
    options=["groq", "ollama"],
    index=0 if config.get("provider", "groq") == "groq" else 1,
    format_func=lambda x: "Groq (default)" if x == "groq" else "Ollama (fallback)",
)

if st.button("Save Settings"):
    new_config = {
        "jira_email": jira_email.strip(),
        "jira_token": jira_token.strip(),
        "jira_url": jira_url.strip(),
        "ollama_url": ollama_url.strip(),
        "ollama_model": ollama_model.strip(),
        "groq_api_key": groq_api_key.strip(),
        "provider": provider,
    }

    required = ["jira_email", "jira_token", "jira_url", "groq_api_key"]
    missing = [k.replace("_", " ").title() for k in required if not new_config.get(k)]
    if missing:
        st.error(f"Please fill in: {', '.join(missing)}")
    else:
        save_config(new_config)
        st.success("Settings saved successfully!")
