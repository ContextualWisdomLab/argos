## 2026-07-28 - Dependency Vulnerability Resolution
**Vulnerability:** brace-expansion and other libraries had reported vulnerabilities via trivy and dependency-review actions.
**Learning:** Fixing one vulnerability via package overrides (e.g., brace-expansion) can introduce breaking changes in transient dependencies like minimatch, causing linting failures.
**Prevention:** Consider upgrading the consuming package (minimatch -> v10.0.0) alongside the vulnerable package to maintain compatibility, and test lint/build processes locally after package overrides.
