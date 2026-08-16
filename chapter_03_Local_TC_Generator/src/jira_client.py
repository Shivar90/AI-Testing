"""Jira REST API client — fetches ticket details."""

from __future__ import annotations

import requests
from dataclasses import dataclass
from typing import Any


@dataclass
class JiraTicket:
    key: str
    summary: str
    description: str
    acceptance_criteria: str


def _extract_fields(issue: dict[str, Any]) -> JiraTicket:
    """Extract summary, description, and acceptance criteria from a Jira issue payload."""
    fields = issue.get("fields", {})

    summary = fields.get("summary", "Not specified")

    description = fields.get("description", "")
    if isinstance(description, dict):
        description = _extract_text_from_atlasdoc(description)

    acceptance_criteria = fields.get("customfield_10008", "") or fields.get("acceptance_criteria", "")

    return JiraTicket(
        key=issue.get("key", "unknown"),
        summary=summary,
        description=description or "Not specified",
        acceptance_criteria=acceptance_criteria or "Not specified",
    )


def _extract_text_from_atlasdoc(doc: dict[str, Any]) -> str:
    """Convert a Jira AtlasDoc/Atlassian Document Format dict to plain text."""
    if not isinstance(doc, dict):
        return str(doc) if doc else "Not specified"

    parts: list[str] = []
    node_type = doc.get("type", "")

    if node_type == "text":
        parts.append(doc.get("text", ""))
    else:
        for child in doc.get("content", []) or []:
            parts.append(_extract_text_from_atlasdoc(child))

    return "\n".join(p for p in parts if p)


def fetch_ticket(ticket_key: str, config: dict[str, Any]) -> JiraTicket:
    """Fetch a single Jira ticket by key and return a JiraTicket dataclass.

    Tries /rest/api/3/ first, falls back to /rest/api/2/ for Jira Server.
    Raises requests.HTTPError on persistent failures (404 on both endpoints,
    auth errors, etc.).
    """
    jira_url = config["jira_url"].rstrip("/")
    email = config["jira_email"]
    token = config["jira_token"]

    for api_version in ("3", "2"):
        url = f"{jira_url}/rest/api/{api_version}/issue/{ticket_key}"
        try:
            resp = requests.get(url, auth=(email, token), timeout=15)
            if resp.status_code == 404 and api_version == "3":
                continue
            resp.raise_for_status()
            return _extract_fields(resp.json())
        except requests.ConnectionError:
            raise
        except requests.HTTPError as e:
            if e.response is not None and e.response.status_code == 404 and api_version == "3":
                continue
            raise

    raise requests.HTTPError(f"Ticket {ticket_key} not found on either API version.")
