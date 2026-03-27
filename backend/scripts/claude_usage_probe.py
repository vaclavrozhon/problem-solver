from __future__ import annotations

import json
import os
import re
import subprocess
import time
from typing import Any


def _now_ts() -> int:
    return int(time.time())


def _claude_bin() -> str:
    return os.getenv("CLAUDE_BIN", "claude")


def _claude_timeout_seconds() -> float:
    raw = os.getenv("CLAUDE_TIMEOUT_MS", "45000")
    try:
        return max(1.0, int(raw) / 1000.0)
    except ValueError:
        return 45.0


def _probe_model() -> str:
    return os.getenv("CLAUDE_USAGE_PROBE_MODEL", "haiku")


def _normalize_window(raw: dict[str, Any] | None) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    used = raw.get("used_percent")
    resets_at = raw.get("resets_at")
    try:
        used_value = int(used) if used is not None else None
    except (TypeError, ValueError):
        used_value = None
    try:
        resets_value = int(resets_at) if resets_at is not None else None
    except (TypeError, ValueError):
        resets_value = None
    return {
        "used_percent": max(0, min(100, used_value))
        if used_value is not None
        else None,
        "remaining_percent": max(0, min(100, 100 - used_value))
        if used_value is not None
        else None,
        "resets_at": resets_value,
    }


def _default_snapshot(error: str | None = None) -> dict[str, Any]:
    return {
        "available": False,
        "captured_at": None,
        "session": None,
        "weekly": None,
        "overage": None,
        "error": error,
    }


def _extract_windows_from_rate_limit_payload(
    payload: dict[str, Any],
) -> dict[str, Any] | None:
    lower = json.loads(json.dumps(payload).lower()) if payload else {}
    if not isinstance(lower, dict):
        return None
    mapped: dict[str, Any] = {"session": None, "weekly": None, "overage": None}

    def walk(value: Any) -> None:
        if isinstance(value, list):
            for item in value:
                walk(item)
            return
        if not isinstance(value, dict):
            return
        limit_type = str(
            value.get("rate_limit_type")
            or value.get("ratelimittype")
            or value.get("limit_type")
            or ""
        )
        utilization = value.get("utilization")
        used_percent = value.get("used_percent")
        if used_percent is None and utilization is not None:
            try:
                used_percent = round(float(utilization) * 100)
            except (TypeError, ValueError):
                used_percent = None
        if used_percent is None:
            remaining = (
                value.get("remaining")
                or value.get("remaining_requests")
                or value.get("remaining_tokens")
            )
            limit = (
                value.get("limit")
                or value.get("request_limit")
                or value.get("token_limit")
            )
            if remaining is not None and limit and float(limit) > 0:
                try:
                    used_percent = round((1 - float(remaining) / float(limit)) * 100)
                except (TypeError, ValueError, ZeroDivisionError):
                    pass
        if used_percent is not None or limit_type:
            normalized = {
                "used_percent": used_percent,
                "resets_at": value.get("resets_at") or value.get("resetsat"),
            }
            if limit_type in {"five_hour", "session"} and mapped["session"] is None:
                mapped["session"] = normalized
            elif (
                limit_type
                in {"seven_day", "seven_day_sonnet", "seven_day_opus", "weekly"}
                and mapped["weekly"] is None
            ):
                mapped["weekly"] = normalized
            elif limit_type in {"overage", "extra_usage"} and mapped["overage"] is None:
                mapped["overage"] = normalized
        for nested in value.values():
            walk(nested)

    walk(lower)
    if mapped["session"] or mapped["weekly"] or mapped["overage"]:
        return {
            "available": True,
            "captured_at": _now_ts(),
            "session": _normalize_window(mapped["session"]),
            "weekly": _normalize_window(mapped["weekly"]),
            "overage": _normalize_window(mapped["overage"]),
            "error": None,
        }
    return None


def _parse_tui_reset_time(reset_str: str, tz_name: str) -> int | None:
    from datetime import datetime, timedelta

    try:
        from zoneinfo import ZoneInfo

        tz = ZoneInfo(tz_name)
    except Exception:
        return None
    text = reset_str.strip()
    now = datetime.now(tz)
    match = re.match(r"^(\d{1,2})(am|pm)$", text, re.IGNORECASE)
    if match:
        hour = int(match.group(1)) % 12 + (12 if match.group(2).lower() == "pm" else 0)
        dt = now.replace(hour=hour, minute=0, second=0, microsecond=0)
        if dt <= now:
            dt += timedelta(days=1)
        return int(dt.timestamp())
    match = re.match(
        r"^([A-Za-z]+)\s+(\d{1,2})(?:,?\s*(\d{1,2})(am|pm))?$", text, re.IGNORECASE
    )
    if match:
        try:
            base = datetime.strptime(
                f"{match.group(1)} {match.group(2)} {now.year}", "%b %d %Y"
            )
        except ValueError:
            return None
        hour = 0
        if match.group(3):
            hour = int(match.group(3)) % 12 + (
                12 if match.group(4).lower() == "pm" else 0
            )
        dt = base.replace(hour=hour, tzinfo=tz)
        if dt.timestamp() < now.timestamp():
            dt = dt.replace(year=now.year + 1)
        return int(dt.timestamp())
    return None


def _parse_tui_usage_text(text: str) -> dict[str, Any] | None:
    text = re.sub(r"(?i)(Re(?:set\w*|ses\w*))\s*(\d{1,2}(?:am|pm))", r"\1 \2", text)
    windows: dict[str, dict[str, Any]] = {}
    sections = {
        "session": re.search(
            r"Current\s+session(.+?)(?=Current\s+week|Extra\s+usage|Esc\s+to|$)",
            text,
            re.DOTALL | re.IGNORECASE,
        ),
        "weekly": re.search(
            r"Current\s+week\s*\([^)]*all[^)]*\)(.+?)(?=Current\s+week|Extra\s+usage|Esc\s+to|$)",
            text,
            re.DOTALL | re.IGNORECASE,
        ),
        "overage": re.search(
            r"Extra\s+usage(.+?)(?=Esc\s+to|$)", text, re.DOTALL | re.IGNORECASE
        ),
    }
    for key, match in sections.items():
        if not match:
            continue
        body = match.group(1)
        pct_match = re.search(r"(\d{1,3})\s*%\s*used", body, re.IGNORECASE)
        if not pct_match:
            continue
        pct = int(pct_match.group(1))
        reset_match = re.search(
            r"(?:Reset\w*\s+)?((?:[A-Za-z]+\s+\d{1,2}(?:,?\s*\d{1,2}(?:am|pm))?|\d{1,2}(?:am|pm)))\s*\(([A-Za-z]+/[A-Za-z_/]+)\)",
            body,
            re.IGNORECASE,
        )
        resets_at = (
            _parse_tui_reset_time(reset_match.group(1), reset_match.group(2))
            if reset_match
            else None
        )
        windows[key] = {"used_percent": pct, "resets_at": resets_at}
    if not windows:
        return None
    return {
        "available": True,
        "captured_at": _now_ts(),
        "session": _normalize_window(windows.get("session")),
        "weekly": _normalize_window(windows.get("weekly")),
        "overage": _normalize_window(windows.get("overage")),
        "error": None,
    }


def _run_tui_probe() -> dict[str, Any] | None:
    try:
        import pexpect
    except ImportError:
        return None

    def _drain(child: Any, wait: float) -> str:
        try:
            child.expect(r"___NEVER_MATCHES___", timeout=wait)
        except (pexpect.TIMEOUT, pexpect.EOF):
            pass
        return child.before or ""

    child = None
    try:
        child = pexpect.spawn(
            _claude_bin(),
            args=[
                "--model",
                _probe_model(),
                "--permission-mode",
                "plan",
                "--effort",
                "low",
            ],
            encoding="utf-8",
            timeout=45,
        )
        _drain(child, wait=7)
        child.send("/usage\r")
        raw = _drain(child, wait=10)
        child.sendcontrol("c")
        try:
            child.close(force=True)
        except Exception:
            pass
    except Exception:
        if child is not None:
            try:
                child.close(force=True)
            except Exception:
                pass
        return None
    ansi = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")
    text = ansi.sub("", raw)
    text = re.sub(r"[\x00-\x08\x0b-\x1f\x7f]", " ", text)
    return _parse_tui_usage_text(text)


def _run_stream_probe() -> dict[str, Any] | None:
    command = [
        _claude_bin(),
        "-p",
        "OK",
        "--model",
        _probe_model(),
        "--permission-mode",
        "plan",
        "--tools",
        "",
        "--effort",
        "low",
        "--no-session-persistence",
        "--output-format",
        "stream-json",
        "--verbose",
    ]
    try:
        completed = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=_claude_timeout_seconds(),
        )
    except subprocess.TimeoutExpired:
        return None
    if completed.returncode != 0:
        return None
    accumulated: dict[str, Any] = {"session": None, "weekly": None, "overage": None}
    for line in completed.stdout.splitlines():
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            continue
        partial = _extract_windows_from_rate_limit_payload(
            payload if isinstance(payload, dict) else {}
        )
        if not partial:
            continue
        for key in ("session", "weekly", "overage"):
            existing = accumulated[key]
            incoming = partial.get(key)
            if incoming is None:
                continue
            if existing is None:
                accumulated[key] = incoming
            elif (
                existing.get("used_percent") is None
                and incoming.get("used_percent") is not None
            ):
                merged = dict(incoming)
                if merged.get("resets_at") is None:
                    merged["resets_at"] = existing.get("resets_at")
                accumulated[key] = merged
            elif (
                existing.get("resets_at") is None
                and incoming.get("resets_at") is not None
            ):
                accumulated[key] = {**existing, "resets_at": incoming["resets_at"]}
    if accumulated["session"] or accumulated["weekly"] or accumulated["overage"]:
        return {
            "available": True,
            "captured_at": _now_ts(),
            "session": _normalize_window(accumulated["session"]),
            "weekly": _normalize_window(accumulated["weekly"]),
            "overage": _normalize_window(accumulated["overage"]),
            "error": None,
        }
    return None


def _run_usage_command_probe() -> dict[str, Any] | None:
    command = [
        _claude_bin(),
        "-p",
        "/usage",
        "--model",
        _probe_model(),
        "--permission-mode",
        "plan",
        "--tools",
        "",
        "--effort",
        "low",
        "--no-session-persistence",
    ]
    try:
        completed = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=_claude_timeout_seconds(),
        )
    except subprocess.TimeoutExpired:
        return None
    if completed.returncode != 0:
        return None
    text = completed.stdout.strip()
    if not text:
        return None
    patterns = {
        "session": re.compile(r"(?:current\s+session|session)\D+(\d{1,3})%"),
        "weekly": re.compile(r"(?:current\s+week|weekly|week)\D+(\d{1,3})%"),
        "overage": re.compile(r"(?:extra\s+usage|overage)\D+(\d{1,3})%"),
    }
    extracted: dict[str, Any] = {}
    for key, pattern in patterns.items():
        match = pattern.search(text.lower())
        if match:
            extracted[key] = {"used_percent": int(match.group(1)), "resets_at": None}
    if not extracted:
        return None
    return {
        "available": True,
        "captured_at": _now_ts(),
        "session": _normalize_window(extracted.get("session")),
        "weekly": _normalize_window(extracted.get("weekly")),
        "overage": _normalize_window(extracted.get("overage")),
        "error": None,
    }


def read_live_claude_usage_snapshot() -> dict[str, Any]:
    tui = _run_tui_probe()
    if tui:
        stream = _run_stream_probe()
        if stream:
            for key in ("session", "weekly", "overage"):
                tui_window = tui.get(key)
                stream_window = stream.get(key)
                if (
                    tui_window
                    and stream_window
                    and tui_window.get("resets_at") is None
                    and stream_window.get("resets_at") is not None
                ):
                    tui[key] = {**tui_window, "resets_at": stream_window["resets_at"]}
        return tui
    for reader in (_run_stream_probe, _run_usage_command_probe):
        snapshot = reader()
        if snapshot:
            return snapshot
    return _default_snapshot("Claude usage data unavailable.")


def main() -> None:
    try:
        snapshot = read_live_claude_usage_snapshot()
    except Exception as exc:
        snapshot = _default_snapshot(str(exc))
    print(json.dumps(snapshot))


if __name__ == "__main__":
    main()
