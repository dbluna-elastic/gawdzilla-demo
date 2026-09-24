#!/usr/bin/env python3
"""Create/update Agent Builder tools and patch agent configuration on gawdzilla."""

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
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith(f"{name}="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get(name, "")


def kb_and_key() -> tuple[str, str]:
    key = load_env_key("OK_KIBANA_API_KEY") or load_env_key("ELASTIC_API_KEY")
    key = re.sub(r"^ApiKey\s+", "", key)
    kb = (load_env_key("OK_KIBANA_URL") or "https://gawdzilla-0d3e9e.kb.us-east-2.aws.elastic-cloud.com").rstrip("/")
    if not key:
        raise SystemExit("Missing API key")
    return kb, key


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


def upsert_esql_tool(kb: str, key: str, tool: dict) -> None:
    """tool: id, description, query, params(optional), tags(optional)"""
    tool_id = tool["id"]
    payload = {
        "id": tool_id,
        "type": "esql",
        "description": tool["description"],
        "configuration": {
            "query": tool["query"],
            "params": tool.get("params") or {},
        },
    }
    if tool.get("tags"):
        payload["tags"] = tool["tags"]
    code, existing = request("GET", f"{kb}/api/agent_builder/tools/{tool_id}", key)
    if code == 200:
        update = {
            "description": payload["description"],
            "configuration": payload["configuration"],
        }
        if tool.get("tags") is not None:
            update["tags"] = tool["tags"]
        code, body = request("PUT", f"{kb}/api/agent_builder/tools/{tool_id}", key, update)
        print(f"tool updated {tool_id} HTTP {code}")
    else:
        code, body = request("POST", f"{kb}/api/agent_builder/tools", key, payload)
        print(f"tool created {tool_id} HTTP {code}")
    if code >= 400:
        print(body)
        raise SystemExit(1)


def upsert_workflow_tool(kb: str, key: str, tool_id: str, description: str, workflow_id: str, tags=None) -> None:
    payload = {
        "id": tool_id,
        "type": "workflow",
        "description": description,
        "configuration": {"workflow_id": workflow_id},
    }
    if tags:
        payload["tags"] = tags
    code, _ = request("GET", f"{kb}/api/agent_builder/tools/{tool_id}", key)
    if code == 200:
        update = {"description": description, "configuration": {"workflow_id": workflow_id}}
        if tags is not None:
            update["tags"] = tags
        code, body = request("PUT", f"{kb}/api/agent_builder/tools/{tool_id}", key, update)
        print(f"workflow tool updated {tool_id} HTTP {code}")
    else:
        code, body = request("POST", f"{kb}/api/agent_builder/tools", key, payload)
        print(f"workflow tool created {tool_id} HTTP {code}")
    if code >= 400:
        print(body)
        raise SystemExit(1)


def upsert_index_search(kb: str, key: str, tool_id: str, description: str, pattern: str, tags=None) -> None:
    payload = {
        "id": tool_id,
        "type": "index_search",
        "description": description,
        "configuration": {"pattern": pattern},
    }
    if tags:
        payload["tags"] = tags
    code, _ = request("GET", f"{kb}/api/agent_builder/tools/{tool_id}", key)
    if code == 200:
        update = {"description": description, "configuration": {"pattern": pattern}}
        if tags is not None:
            update["tags"] = tags
        code, body = request("PUT", f"{kb}/api/agent_builder/tools/{tool_id}", key, update)
        print(f"index_search updated {tool_id} HTTP {code}")
    else:
        code, body = request("POST", f"{kb}/api/agent_builder/tools", key, payload)
        print(f"index_search created {tool_id} HTTP {code}")
    if code >= 400:
        print(body)
        raise SystemExit(1)


def patch_agent(kb: str, key: str, agent_id: str, tool_ids: list[str], skill_ids: list[str] | None = None) -> None:
    code, agent = request("GET", f"{kb}/api/agent_builder/agents/{agent_id}", key)
    if code != 200 or not isinstance(agent, dict):
        print(agent)
        raise SystemExit(f"Failed to get agent {agent_id}")
    cfg = dict(agent.get("configuration") or {})
    instructions = cfg.get("instructions") or agent.get("description") or ""
    new_cfg = {
        "instructions": instructions,
        "tools": [{"tool_ids": tool_ids}],
    }
    if skill_ids is not None:
        new_cfg["skill_ids"] = skill_ids
    elif "skill_ids" in cfg:
        new_cfg["skill_ids"] = cfg["skill_ids"]
    # preserve enable_elastic_capabilities if present
    if "enable_elastic_capabilities" in cfg:
        new_cfg["enable_elastic_capabilities"] = cfg["enable_elastic_capabilities"]
    update = {"configuration": new_cfg}
    if agent.get("description"):
        update["description"] = agent["description"]
    code, body = request("PUT", f"{kb}/api/agent_builder/agents/{agent_id}", key, update)
    print(f"agent patched {agent_id} HTTP {code}")
    if code >= 400:
        print(body)
        raise SystemExit(1)
    # verify
    code, agent2 = request("GET", f"{kb}/api/agent_builder/agents/{agent_id}", key)
    cfg2 = agent2.get("configuration") or {}
    print("tools:", cfg2.get("tools"))
    print("skill_ids:", cfg2.get("skill_ids"))


def main() -> None:
    print("Import helper — use from phase scripts or python -c")


if __name__ == "__main__":
    main()
