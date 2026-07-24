"""
로컬에서 서버를 띄우고 테스트하기 위한 헬퍼 스크립트.

API:
    free_port() -> int
    wait_http_ready(url, timeout_sec) -> bool
    spawn_and_wait_ready(cmd, *, env, cwd, ready_url, timeout_sec, pidfile) -> Popen
    stop_by_pidfile(pidfile) -> None
    load_seed_result(stdout) -> dict  # 마지막 비공백 줄을 JSON 파싱
"""

from __future__ import annotations

import json
import os
import socket
import subprocess
import time
import urllib.request
from pathlib import Path


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def wait_http_ready(url: str, timeout_sec: float) -> bool:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        try:
            # nosemgrep: python.lang.security.audit.dynamic-urllib-use-detected.dynamic-urllib-use-detected
            urllib.request.urlopen(url, timeout=1).read()
            return True
        except Exception:
            time.sleep(0.2)
    return False


def spawn_and_wait_ready(
    cmd: list[str],
    *,
    env: dict,
    cwd: str,
    ready_url: str,
    timeout_sec: float = 15.0,
    pidfile: Path | None = None,
) -> subprocess.Popen:
    proc = subprocess.Popen(
        cmd,
        env=env,
        cwd=cwd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        preexec_fn=os.setsid,  # UNIX only
    )
    if pidfile:
        pidfile.parent.mkdir(parents=True, exist_ok=True)
        pidfile.write_text(str(proc.pid))

    if not wait_http_ready(ready_url, timeout_sec):
        # 멈추고 실패 처리
        proc.kill()
        proc.wait()
        raise RuntimeError(f"Server at {ready_url} did not become ready within {timeout_sec}s.")

    return proc


def stop_by_pidfile(pidfile: Path) -> None:
    if not pidfile.exists():
        return
    try:
        pid_str = pidfile.read_text().strip()
        if pid_str.isdigit():
            pid = int(pid_str)
            import signal
            try:
                os.killpg(os.getpgid(pid), signal.SIGTERM)
            except OSError:
                pass
    finally:
        try:
            pidfile.unlink()
        except OSError:
            pass


def load_seed_result(stdout: str) -> dict:
    lines = [ln.strip() for ln in stdout.splitlines() if ln.strip()]
    if not lines:
        return {}
    return json.loads(lines[-1])
