"""persuasion-review 5a0 UX probe 어댑터용 공유 plumbing.

프로젝트의 `persuasion-data/ux_probe_adapter.py` 가 import 해서 사용하는 유틸.
run_simulation.py 가 어댑터를 동적 로드하기 직전 이 스크립트 디렉토리를
sys.path 에 주입하므로 어댑터에서는 `from probe_harness import ...` 로 쓴다.

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
from urllib.parse import urlsplit


_LOOPBACK_HOSTS = frozenset({"127.0.0.1", "::1", "localhost"})


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _validated_loopback_http_url(url: str) -> str:
    """Return ``url`` only when it targets the local UX probe server."""
    try:
        parsed = urlsplit(url)
        port = parsed.port
    except ValueError as exc:
        raise ValueError("probe readiness URL is malformed") from exc

    if (
        parsed.scheme not in {"http", "https"}
        or parsed.hostname not in _LOOPBACK_HOSTS
        or parsed.username is not None
        or parsed.password is not None
        or not parsed.netloc
    ):
        raise ValueError("probe readiness URL must be loopback HTTP(S)")
    if port is not None and not 1 <= port <= 65535:
        raise ValueError("probe readiness URL port is out of range")
    return url


class _LoopbackRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Allow redirects only when they remain on a loopback HTTP(S) target."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        _validated_loopback_http_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


_LOOPBACK_OPENER = urllib.request.build_opener(_LoopbackRedirectHandler)


def wait_http_ready(url: str, timeout_sec: float) -> bool:
    ready_url = _validated_loopback_http_url(url)
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        try:
            # nosemgrep: python.lang.security.audit.dynamic-urllib-use-detected.dynamic-urllib-use-detected -- validated above as loopback HTTP(S) only.
            with _LOOPBACK_OPENER.open(ready_url, timeout=1) as response:
                response.read()
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
    popen_kwargs: dict = {
        "env": env,
        "cwd": cwd,
        "stdout": subprocess.PIPE,
        "stderr": subprocess.STDOUT,
    }
    if os.name == "posix":
        popen_kwargs["preexec_fn"] = os.setsid
    proc = subprocess.Popen(cmd, **popen_kwargs)
    if not wait_http_ready(ready_url, timeout_sec):
        _terminate(proc)
        raise RuntimeError(f"server did not become ready in {timeout_sec}s: {ready_url}")
    if pidfile is not None:
        pidfile.parent.mkdir(parents=True, exist_ok=True)
        pidfile.write_text(str(proc.pid), encoding="utf-8")
    return proc


def stop_by_pidfile(pidfile: Path) -> None:
    if not pidfile.exists():
        return
    try:
        pid = int(pidfile.read_text(encoding="utf-8").strip())
    except Exception:
        pidfile.unlink(missing_ok=True)
        return
    _kill_process_group(pid)
    pidfile.unlink(missing_ok=True)


def load_seed_result(stdout: str) -> dict:
    """seed 스크립트 stdout 의 마지막 비공백 줄을 JSON 으로 파싱.

    seed 스크립트는 stdout 마지막 줄에 단일 JSON 오브젝트를 찍어야 한다.
    예: `{"trainer_id": 1, "member_ids": [1, 2, 3]}`
    """
    for line in reversed(stdout.splitlines()):
        if line.strip():
            return json.loads(line)
    raise ValueError("seed produced no output")


def _terminate(proc: subprocess.Popen) -> None:
    if os.name == "posix":
        try:
            os.killpg(os.getpgid(proc.pid), 15)
        except Exception:
            proc.terminate()
    else:
        proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()


def _kill_process_group(pid: int) -> None:
    if os.name == "posix":
        try:
            os.killpg(os.getpgid(pid), 15)
        except (OSError, ProcessLookupError):
            try:
                os.kill(pid, 15)
            except OSError:
                return
    else:
        try:
            os.kill(pid, 15)
        except OSError:
            return
    for _ in range(25):
        try:
            os.kill(pid, 0)
        except OSError:
            return
        time.sleep(0.2)
    try:
        if os.name == "posix":
            os.killpg(os.getpgid(pid), 9)
        else:
            os.kill(pid, 9)
    except OSError:
        pass
