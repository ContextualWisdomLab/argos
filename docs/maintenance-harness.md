# Maintainer harness

This document records the repository-maintenance harness previously exposed in the customer-facing README.

The repository carries an autonomous maintenance harness derived from `greatSumini/cc-system`. Maintainers can run `scripts/run-server.py` to execute the ideation → plan-and-build → commit → check → rollback loop. Per-iteration artifacts are written under `iterations/<N>-<timestamp>/`.

Subsessions spawned by the harness receive `HARNESS_HEADLESS=1` so unattended maintenance steps can proceed without interactive confirmation. Do not export that variable globally from an interactive shell: doing so can move an ordinary interactive session into unattended mode.

Harness execution is a maintainer-controlled repository operation. It is not part of the Argos customer installation, hosted product, CLI contract, telemetry protocol, or self-hosting requirements.
