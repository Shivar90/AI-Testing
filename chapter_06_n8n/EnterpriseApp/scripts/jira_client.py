"""JIRA Cloud REST client for the Enterprise Application (VWO) sprint setup.

Credentials come from environment variables, falling back to a `.env` file
in the project root (`EnterpriseApp/.env`). The token is NEVER hardcoded or
logged. Per LLM.md: fail loudly on any non-2xx response.
"""

import json
import os
from pathlib import Path

import requests

# Look for `.env` in EnterpriseApp/ (two levels up from this script).
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


def _iso8601(date_str: str | None) -> str | None:
    """Normalize a YYYY-MM-DD date to a full ISO-8601 timestamp (start/end of day)."""
    if not date_str:
        return None
    date_str = date_str.strip()
    if len(date_str) == 10 and date_str[4] == "-":
        return f"{date_str}T00:00:00.000Z"
    return date_str


def _load_dotenv(path: Path) -> None:
    """Minimal .env parser (KEY=VALUE lines, # comments). No extra deps."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def _resolve_env(name: str, default: str = "") -> str:
    """Resolve a credential from the environment, loading .env if needed."""
    if name in os.environ and os.environ[name]:
        return os.environ[name]
    _load_dotenv(ENV_PATH)
    return os.environ.get(name, default)


class JiraClient:
    """Thin wrapper over the JIRA Cloud REST APIs (api/3 + agile/1.0)."""

    def __init__(self):
        self.base_url = _resolve_env("JIRA_URL", "https://shivanandreure90.atlassian.net").rstrip("/")
        self.email = _resolve_env("JIRA_EMAIL")
        self.api_token = _resolve_env("JIRA_API_TOKEN", _resolve_env("JIRA_TOKEN"))

        if not self.email or not self.api_token:
            raise RuntimeError(
                "Missing JIRA credentials. Set JIRA_EMAIL and JIRA_API_TOKEN "
                f"(or JIRA_TOKEN) env vars, or create {ENV_PATH} "
                "from scripts/.env.example."
            )
        if "http" not in self.base_url:
            raise RuntimeError(f"JIRA_URL looks invalid: {self.base_url}")

        self.session = requests.Session()
        self.session.auth = (self.email, self.api_token)
        self.session.headers.update({"Accept": "application/json"})

    def request(
        self,
        method: str,
        path: str,
        json_body: dict | None = None,
        params: dict | None = None,
    ) -> dict:
        """Perform a request; raise with details on non-2xx (fail loudly)."""
        url = f"{self.base_url}{path}"
        resp = self.session.request(method, url, json=json_body, params=params, timeout=60)
        if not resp.ok:
            body = resp.text[:2000]
            hint = ""
            if resp.status_code == 429:
                hint = " (rate-limited by JIRA; wait a few seconds and retry)"
            raise RuntimeError(
                f"JIRA {method} {path} -> {resp.status_code}{hint}: {body}"
            )
        if resp.status_code == 204 or not resp.content:
            return {}
        return resp.json()

    # ---- REST API v3 ----
    def handshake(self) -> dict:
        return self.request("GET", "/rest/api/3/myself")

    def get_project(self, key: str) -> dict | None:
        try:
            return self.request("GET", f"/rest/api/3/project/{key}")
        except RuntimeError as exc:
            if "404" in str(exc):
                return None
            raise

    def create_project(self, project: dict) -> dict:
        """Create a company-managed software project.

        Cloud API v3 requires projectTypeKey + projectTemplateKey + leadAccountId
        (an accountId, not a username). The lead is the authenticated user,
        resolved from /myself.
        """
        me = self.request("GET", "/rest/api/3/myself")
        lead_account_id = me.get("accountId")
        if not lead_account_id:
            raise RuntimeError("Cannot resolve lead accountId from /myself")
        payload = {
            "key": project["key"],
            "name": project["name"],
            "projectTypeKey": "software",
            "projectTemplateKey": project.get(
                "projectTemplateKey",
                "com.pyxis.greenhopper.jira:gh-simplified-scrum-classic",
            ),
            "leadAccountId": lead_account_id,
        }
        return self.request("POST", "/rest/api/3/project", json_body=payload)

    def get_fields(self) -> list[dict]:
        return self.request("GET", "/rest/api/3/field")

    def create_issue(self, fields: dict) -> dict:
        """Create an issue, converting plain-text descriptions to ADF."""
        description = fields.get("description")
        if isinstance(description, str):
            fields = {**fields, "description": self._to_adf(description)}
        return self.request("POST", "/rest/api/3/issue", json_body={"fields": fields})

    @staticmethod
    def _to_adf(text: str) -> dict:
        """Convert plain text (with blank-line paragraph breaks) to ADF."""
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        content = [
            {"type": "paragraph", "content": [{"type": "text", "text": p}]}
            for p in paragraphs
        ]
        if not content:
            content = [{"type": "paragraph", "content": []}]
        return {"type": "doc", "version": 1, "content": content}

    @staticmethod
    def _adf_to_text(adf) -> str:
        """Convert ADF to plain text (paragraph breaks become blank lines)."""
        if isinstance(adf, str):
            return adf
        if not isinstance(adf, dict):
            return ""
        parts: list[str] = []
        for node in adf.get("content", []) or []:
            if node.get("type") == "paragraph":
                text = "".join(
                    child.get("text", "") for child in node.get("content", []) or []
                )
                parts.append(text)
            elif node.get("content"):
                parts.append(JiraClient._adf_to_text(node))
        return "\n\n".join(parts).strip()

    def get_issue(self, key: str, fields: str = "*all") -> dict:
        """Return a single issue's fields by key."""
        return self.request("GET", f"/rest/api/3/issue/{key}", params={"fields": fields})

    def find_field_id(self, display_name: str) -> str | None:
        """Return the id of a (custom) field by its display name, or None."""
        for field in self.get_fields():
            if field.get("name", "").strip().lower() == display_name.strip().lower():
                return field["id"]
        return None

    def search(self, jql: str, fields: str = "key,summary,issuetype,parent") -> dict:
        return self.request(
            "GET",
            "/rest/api/3/search/jql",
            json_body=None,
            params={"jql": jql, "fields": fields, "maxResults": 100},
        )

    def search_jql(self, jql: str, fields: str = "key,summary,issuetype,parent") -> list[dict]:
        """JQL search; returns the list of issues (no envelope)."""
        return self.search(jql, fields).get("issues", [])

    # ---- Agile 1.0 ----
    def find_board(self, project_key: str) -> dict | None:
        data = self.request("GET", f"/rest/agile/1.0/board?projectKeyOrId={project_key}")
        boards = data.get("values", [])
        if not boards:
            return None
        # Prefer a scrum board if several exist.
        for board in boards:
            if board.get("type") == "scrum":
                return board
        return boards[0]

    def find_sprint_by_name(self, board_id: int, name: str) -> dict | None:
        """Return the sprint with the given name on a board, or None."""
        data = self.request(
            "GET",
            f"/rest/agile/1.0/board/{board_id}/sprint",
            params={"state": "active,future,closed", "maxResults": 100},
        )
        for sprint in data.get("values", []):
            if sprint.get("name") == name:
                return sprint
        return None

    def create_sprint(self, board_id: int, sprint: dict) -> dict:
        """Create a sprint on a board.

        SprintCreateBean accepts name, goal, originBoardId, startDate, endDate.
        `state` is not settable at creation (new sprints are 'future'); dates
        must be full ISO-8601 timestamps.
        """
        payload = {
            "name": sprint["name"],
            "goal": sprint.get("goal", ""),
            "originBoardId": board_id,
            "startDate": _iso8601(sprint.get("startDate")),
            "endDate": _iso8601(sprint.get("endDate")),
        }
        return self.request("POST", "/rest/agile/1.0/sprint", json_body=payload)

    def move_issues_to_sprint(self, sprint_id: int, issue_ids: list[str]) -> None:
        if not issue_ids:
            return
        self.request(
            "POST",
            f"/rest/agile/1.0/sprint/{sprint_id}/issue",
            json_body={"issues": issue_ids},
        )


def main() -> None:
    """CLI handshake check: python jira_client.py"""
    client = JiraClient()
    me = client.handshake()
    print(f"Handshake OK: {me.get('displayName', me.get('emailAddress', '?'))} "
          f"({me.get('emailAddress', '?')})")


if __name__ == "__main__":
    main()
