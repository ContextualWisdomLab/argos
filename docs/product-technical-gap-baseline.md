# Argos product–technical gap baseline

Updated: 2026-10-01

## Goal and loop

Preserve the buyer-visible calendar accessibility delta while keeping the repository dependency lock free of known fixable HIGH/MEDIUM findings. Execute review → root-cause repair → exact-current-head Checks → protected merge eligibility. A skipped, queued, pending, failed, predecessor, or self-review result is not passing evidence.

## Bounded context and ownership

Argos owns its calendar presentation components and their accessibility semantics. The shared package manifest and lock are the repository dependency-supply boundary. Organization workflow policy remains owned by `.github`; this repository consumes that released boundary and does not copy or weaken its scanners.

## Current successor topology

- Predecessor: PR #730, exact head `8c88e094ba134c104d2b067a33e8ad0dcaaf147e`, kept open and Draft.
- Canonical dependency owner: PR #615 at `dec7aabf934fe655f3844814518da80472a56c59`.
- Stable successor: PR #731, initial exact head `9bc3730ea238f91f2c94417d59be9a95c6f3b8b4`, tree `6ae24b2a7f9c80bec1ffd8e01eb1f0664350b6e7`.
- Protected integration base: `developmental@2fa92012bcf80acc1f921a4bafea76b3b1424b46`.
- Release state: Proposed / merge HOLD.

The successor preserves every predecessor commit in ordinary first-parent history and adds the canonical dependency-owner commit as an additional parent. It carries the complete `ContextSection`, `WeekNavigator`, and `EventList` accessibility delta plus the exact `package.json` and `pnpm-lock.yaml` repair. No Force Push or destructive rebase is used.

## Material RCA

Security Scan run `36791510954`, Trivy job `110145270168`, reported seven findings at predecessor head `8c88e094...`: baseline-browser-mapping CVE-2026-45819; browserslist CVE-2026-73088/CVE-2026-73089; deepmerge-ts CVE-2026-40345; next CVE-2026-75604/GHSA-2xp9-vwfh-vxw4; and sharp GHSA-rgj7-g3m4-5g8c.

Exact comparison with the previously repaired tree showed that two repeated generator commits reverted only `package.json` and `pnpm-lock.yaml`. Direct edits on that generator branch had already been overwritten repeatedly. The stable successor therefore isolates the active single-writer collision while retaining the valid feature delta and its ancestry.

## PRD acceptance

- Calendar context, week navigation, and event list retain the accessibility behavior introduced by #730.
- The UI never gains merge authority from dependency-only or predecessor evidence.
- No valid predecessor delta is discarded or closed merely to manufacture zero open PRs.

## TRD acceptance

- The manifest/lock resolve the reviewed patched dependency set from canonical owner #615.
- Exact-head CI, Security Scan, and SAST Semgrep are terminal-success.
- A non-skipped exact-head CodeQL generation is terminal-success.
- Review findings are resolved without self-approval or ruleset bypass.
- Ordinary protected merge occurs only after all required exact-head contexts are terminal-success.
- Predecessor #730 is retired only after protected integration or independently verified complete successor carryover.

## Current evidence and status

At successor head `9bc3730...`, CI run `36794051248`, Security Scan `36794051269`, and SAST Semgrep `36794051311` completed successfully. Draft-event CodeQL PR `36794051220` was skipped and is explicitly non-passing. PR #731 entered Ready only as review admission; merge remains on HOLD until this documentation descendant receives fresh exact-head Checks, including non-skipped CodeQL, and any required independent review evidence.
