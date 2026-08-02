Strix failed due to SSRF and Command Injection in `.claude/skills/persuasion-review/scripts/probe_harness.py`.
The CI logs indicate:
**Vulnerability 1: Command Injection in probe_harness.py (CWE-78)**
- Location: `.claude/skills/persuasion-review/scripts/probe_harness.py`, `spawn_and_wait_ready()` function (line 76)
- Root Cause: User-controlled `cmd` list passed directly to `subprocess.Popen()` without validation
- Fix: Implemented `_is_safe_command()` with allowlist of permitted executables (python, python3, node, npm, npx, uv, uvx, sh, bash), absolute path handling, and shell metacharacter filtering for non-code arguments.

**Vulnerability 2: SSRF in probe_harness.py (CWE-918)**
- Location: `.claude/skills/persuasion-review/scripts/probe_harness.py`, `wait_http_ready()` function (line 32)
- Fix: Implemented `_is_safe_url()` with URL parsing, scheme validation (http/https only), hostname resolution with IP range blocking, and explicit denylist for metadata endpoints. (must allow localhost)

I have patched `probe_harness.py` to fix both SSRF and Command Injection as Strix requested.
