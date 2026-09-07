# CLI browser-launch security boundary

## Threat model

The CLI receives an authorization URL from a remote API and crosses an operating-system process boundary to open it. The previous Windows path invoked `cmd.exe /c start` with `windowsVerbatimArguments: true`. Node.js documents that this option disables argument quoting and escaping on Windows, while the command interpreter gives metacharacters executable meaning. Escaping one character therefore did not establish a complete command/data separation boundary.

## Decision

1. Reject raw C0 control characters and DEL before URL parsing can normalize them.
2. Parse with the WHATWG `URL` implementation and serialize the canonical result.
3. Allow only `http:` and `https:` protocols with a non-empty host.
4. Reject embedded username or password fields.
5. On Windows, invoke `explorer.exe` directly with one validated URL argument; do not invoke `cmd.exe`, `start`, a shell option, or `windowsVerbatimArguments`.
6. On macOS and Linux, preserve direct argument-array invocation through `open` and `xdg-open` after the same validation.

The allowlist and shell removal are complementary. URL validation constrains the authorized business object, while direct process invocation prevents the URL from becoming command-language source text.

## Verification contract

The regression suite proves:

- Windows launches `explorer.exe`, never `cmd.exe`;
- the validated URL is one argument and Windows has no verbatim-argument mode;
- macOS and Linux continue using argument arrays;
- `javascript:`, `file:`, `data:`, `mailto:`, malformed URLs, credentials, and control characters fail closed;
- mixed-case and default-port input is returned as one canonical HTTP(S) URL.

## References

Microsoft. (2026). *Launch the default Windows app for a URI*. Microsoft Learn. https://learn.microsoft.com/windows/apps/develop/launch/launch-default-app

Node.js contributors. (2026). *Child process*. Node.js v26.5.1 documentation. https://nodejs.org/api/child_process.html

OWASP Foundation. (n.d.). *OS command injection defense cheat sheet*. OWASP Cheat Sheet Series. https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html

WHATWG. (2026). *URL standard*. https://url.spec.whatwg.org/
