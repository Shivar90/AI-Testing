"""Chat screen (Screen 1) — interact with the app like ChatGPT."""

from __future__ import annotations

import re
import sys
from pathlib import Path

import streamlit as st

# Ensure src/ is on the path so sibling modules import cleanly
_SRC_DIR = Path(__file__).resolve().parent
if str(_SRC_DIR) not in sys.path:
    sys.path.insert(0, str(_SRC_DIR))

from config_store import load_config
from jira_client import fetch_ticket
from llm_client import generate

_TEMPLATES_DIR = _SRC_DIR / "templates"
_TEMPLATE_FILE = _TEMPLATES_DIR / "testcase_creator.md"

st.set_page_config(page_title="Jira Test Case Generator", page_icon="🧪", layout="centered")

# --- Sidebar navigation ---
st.sidebar.title("Navigation")
st.sidebar.page_link("app.py", label="Chat", icon="💬")
st.sidebar.page_link("pages/settings.py", label="Settings", icon="⚙️")

# --- Load config ---
config = load_config()

# --- Session state for chat history ---
if "messages" not in st.session_state:
    st.session_state.messages = []

# --- Render chat history ---
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# --- Chat input ---
if prompt := st.chat_input("Type your request, e.g. 'create test cases for VWO-49'"):
    st.session_state.messages.append({"role": "user", "content": prompt})

    with st.chat_message("user"):
        st.markdown(prompt)

    # --- Parse Jira ticket key ---
    match = re.search(r"([A-Z][A-Z0-9]+-\d+)", prompt)
    if not match:
        with st.chat_message("assistant"):
            msg = "I couldn't find a Jira ticket key (e.g., VWO-49) in your message. Please include one."
            st.markdown(msg)
        st.session_state.messages.append({"role": "assistant", "content": msg})
        st.stop()

    ticket_key = match.group(1)

    # --- Fetch ticket ---
    with st.chat_message("assistant"):
        fetching_msg = f"Fetching ticket **{ticket_key}** from Jira…"
        st.markdown(fetching_msg)
    st.session_state.messages.append({"role": "assistant", "content": fetching_msg})

    try:
        ticket = fetch_ticket(ticket_key, config)
    except Exception as e:
        with st.chat_message("assistant"):
            msg = f"Failed to fetch ticket **{ticket_key}**: {e}"
            st.markdown(msg)
        st.session_state.messages.append({"role": "assistant", "content": msg})
        st.stop()

    # --- Build prompt from template ---
    try:
        template = _TEMPLATE_FILE.read_text(encoding="utf-8")
    except FileNotFoundError:
        with st.chat_message("assistant"):
            msg = f"Template file not found at `{_TEMPLATE_FILE}`. Please ensure `templates/testcase_creator.md` exists."
            st.markdown(msg)
        st.session_state.messages.append({"role": "assistant", "content": msg})
        st.stop()

    requirements = f"""Jira Ticket: {ticket.key}
Summary: {ticket.summary}
Description: {ticket.description}
Acceptance Criteria: {ticket.acceptance_criteria}"""

    prompt_text = template.replace("[NUMBER]", "5").replace("[PASTE REQUIREMENTS HERE]", requirements)

    # --- Generate test cases ---
    with st.chat_message("assistant"):
        generating_msg = f"Generating test cases via {config.get('provider', 'groq').upper()}…"
        st.markdown(generating_msg)
    st.session_state.messages.append({"role": "assistant", "content": generating_msg})

    try:
        result = generate(prompt_text, config)
        with st.chat_message("assistant"):
            st.markdown(result)
        st.session_state.messages.append({"role": "assistant", "content": result})
    except RuntimeError as e:
        with st.chat_message("assistant"):
            msg = f"LLM generation failed: {e}"
            st.markdown(msg)
        st.session_state.messages.append({"role": "assistant", "content": msg})
