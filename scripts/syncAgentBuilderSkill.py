#!/usr/bin/env python3
"""Sync a docs/agent-builder-skills/*.md file to Kibana Agent Builder skills API."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path


def load_env_key(name: str) -> str:
    root = Path(__file__).resolve().parents[1]
    env_path = root / ".env"
    if not env_path.exists():
        return os.environ.get(name, "")
    for line in env_path.read_text().splitlines():
        if line.startswith(f"{name}="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get(name, "")


def parse_skill_md(path: Path) -> dict:
    text = path.read_text()
    if not text.startswith("---"):
        raise SystemExit(f"{path}: missing YAML front matter")
    parts = text.split("---", 2)
    if len(parts) < 3:
        raise SystemExit(f"{path}: invalid front matter")
    meta_raw = parts[1]
    content = parts[2].lstrip("\n")
    meta: dict = {}
    current_list_key = None
    for line in meta_raw.splitlines():
        if not line.strip():
            continue
        if line.startswith("  - ") and current_list_key:
            meta.setdefault(current_list_key, []).append(line[4:].strip())
            continue
        if ":" in line and not line.startswith(" "):
            key, val = line.split(":", 1)
            key = key.strip()
            val = val.strip()
            current_list_key = None
            if val == "":
                current_list_key = key
                meta[key] = []
            else:
                meta[key] = val
    required = ["id", "name", "description"]
    for key in required:
        if not meta.get(key):
            raise SystemExit(f"{path}: missing front matter key {key}")
    tool_ids = meta.get("tool_ids") or []
    if isinstance(tool_ids, str):
        tool_ids = [tool_ids]
    return {
        "id": meta["id"],
        "name": meta["name"],
        "description": meta["description"],
        "content": content,
        "tool_ids": tool_ids,
        "referenced_content": [],
    }


def request(method: str, url: str, key: str, body: dict | None = None) -> tuple[int, dict | str]:
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"ApiKey {key}",
            "kbn-xsrf": "true",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode()
            code = resp.status
    except urllib.error.HTTPError as err:
        raw = err.read().decode()
        code = err.code
    try:
        return code, json.loads(raw) if raw else {}
    except json.JSONDecodeError:
        return code, raw


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: syncAgentBuilderSkill.py <skill.md> [--dry-run]", file=sys.stderr)
        raise SystemExit(2)
    path = Path(sys.argv[1])
    dry = "--dry-run" in sys.argv
    payload = parse_skill_md(path)
    key = load_env_key("OK_KIBANA_API_KEY") or load_env_key("ELASTIC_API_KEY")
    key = re.sub(r"^ApiKey\s+", "", key)
    kb = load_env_key("OK_KIBANA_URL") or "https://gawdzilla-0d3e9e.kb.us-east-2.aws.elastic-cloud.com"
    kb = kb.rstrip("/")
    if not key:
        raise SystemExit("Missing OK_KIBANA_API_KEY / ELASTIC_API_KEY")
    if dry:
        print(json.dumps(payload, indent=2))
        return
    skill_id = payload["id"]
    get_code, _ = request("GET", f"{kb}/api/agent_builder/skills/{skill_id}", key)
    if get_code == 200:
        # PUT updates: description, content, tool_ids, referenced_content, name
        update = {
            "name": payload["name"],
            "description": payload["description"],
            "content": payload["content"],
            "tool_ids": payload["tool_ids"],
            "referenced_content": payload["referenced_content"],
        }
        code, body = request("PUT", f"{kb}/api/agent_builder/skills/{skill_id}", key, update)
        action = "updated"
    else:
        code, body = request("POST", f"{kb}/api/agent_builder/skills", key, payload)
        action = "created"
    print(f"{action} {skill_id} HTTP {code}")
    if isinstance(body, dict):
        print(json.dumps({k: body.get(k) for k in ("id", "name", "tool_ids", "description")}, indent=2))
    else:
        print(body)
    if code >= 400:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
