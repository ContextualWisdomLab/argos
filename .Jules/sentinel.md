## 2026-08-30 - Update deepmerge-ts to fix CVE-2026-40345
**Vulnerability:** A High severity vulnerability (CVE-2026-40345) was detected in the deepmerge-ts dependency by Trivy CI check.
**Learning:** Outdated dependencies can introduce significant security risks into the application and CI pipelines properly configured with Trivy/OSV-Scanner can flag these deep dependencies.
**Prevention:** Regularly update deep dependencies by utilizing `pnpm up -r <package>` or enforcing patched versions in the `pnpm.overrides` block.
