# Product and technical gap baseline

## Timeline sort and dependency-security reconciliation

- **Failed predecessor:** PR #522 exact head `eabcc7315a494d5fe6c70cafc58590f9215833ec`; OSV run `33113518393`, job `98662200496`, and Security Scan run `33113518345`, job `98662200844`, both identified inherited `deepmerge-ts 7.1.5` High-severity vulnerability `GHSA-ggr8-5vv4-36mx` / `CVE-2026-40345`. The two-file timeline optimization did not introduce the dependency.
- **Causal owner:** PR #615 exact head `96e41e67af7d9fc44fc075c073b6544d92f541a9` pins `deepmerge-ts 8.0.2` and has terminal successful Security Scan `34734711718` plus successful SAST and product CI. Its CodeQL failure remains separate fail-closed dispatch evidence and is not treated as passing.
- **Repair:** ordinary two-parent integration preserves the complete owner dependency/workflow tree and the leaf's bounded `.jules/bolt.md` plus `session-timeline-chart.tsx` delta. No security gate, advisory, or warning is suppressed.
- **Performance RED→GREEN:** the owner implementation parsed four usage timestamps 16 times; the leaf pre-parses them once and the committed regression requires exactly four calls while existing chart-output and immutability tests remain applicable.
- **Status:** Proposed until the new exact head completes every applicable hosted check and independent review. Queued, pending, skipped, cancelled, absent, predecessor, or status-only evidence is not passing.
