## 2023-10-27 - [Windows cmd.exe Command Injection in CLI]
**Vulnerability:** Node.js `spawn` with `windowsVerbatimArguments: true` bypasses default escaping, leaving Windows shell metacharacters (`|`, `<`, `>`, `&`, etc.) unescaped when opening URLs via `cmd.exe /c start`.
**Learning:** Only escaping `&` is insufficient. All `cmd.exe` shell metacharacters must be explicitly escaped with a caret (`^`) when passing untrusted input (like URLs from an API response) to prevent command injection, because protocol validation alone (e.g., `http://`) does not stop appended commands.
**Prevention:** Always escape the full set of shell metacharacters (`&`, `|`, `;`, `<`, `>`, `(`, `)`, `^`) with a caret (`^`) when manually escaping arguments for `cmd.exe` on Windows.
