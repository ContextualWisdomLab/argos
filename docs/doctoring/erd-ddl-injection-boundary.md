# ERD DDL injection boundary

## Decision

`ERDModel` treats every caller-supplied SQL fragment as untrusted. Table, column, and foreign-key identifiers are restricted to the existing lowercase `snake_case` identifier contract. Column `type` accepts a single SQL type identifier with an optional numeric length/precision clause, plus a small explicit set of well-known multi-word type forms. Column defaults accept scalar literals and a short list of side-effect-free built-ins; arbitrary function calls are rejected.

This boundary is intentionally narrower than a complete SQL parser. The ERD model is a DDL generator, not an arbitrary SQL execution surface. PostgreSQL `CREATE TABLE` syntax treats a column data type and column constraints as separate grammar positions, so constraints such as `PRIMARY KEY`, `NOT NULL`, and `REFERENCES` must not be accepted through the `type` field. A caller that needs a new type form should add it explicitly with focused positive and negative tests instead of broadening the grammar to arbitrary token streams.

OWASP recommends parameterized queries when values can be bound and allow-list validation when SQL structure such as identifiers cannot be parameterized. DDL type declarations and identifiers are structural SQL, so Argos applies positive allow-list validation before interpolation rather than relying on escaping. Generated DDL must still be executed by a database principal with least privilege appropriate to the deployment.

## State-integrity boundary

Validation is only useful if validated objects cannot be mutated afterward. `ERDModel` therefore copies accepted `Column` and `ForeignKey` inputs before storing them and returns copied table snapshots from all public getters. A caller retaining a reference to its input or to a returned snapshot cannot mutate the model's validated internal state.

## Verification

Permanent Vitest regressions cover:

- rejection of SQL constraints placed in the type field;
- acceptance of explicitly supported multi-word data-type forms;
- rejection of arbitrary default-function execution;
- acceptance of scalar and allow-listed built-in defaults;
- mutation of a caller-owned column object after validation; and
- mutation of a caller-owned foreign-key object after validation.

The repository's exact-head CI, security gates, review agents, and required coverage gates remain authoritative. A queued, pending, cancelled, skipped-required, absent, stale-head, or failed result is not release evidence.

## Rollback

If a legitimate data type or default is rejected, add the minimum required grammar to the allow-list together with a regression proving both the intended valid syntax and nearby structural SQL remains rejected. Do not revert to a general whitespace/token regular expression and do not add an escaping-based bypass.

## References

OWASP Foundation. (n.d.). *SQL injection prevention cheat sheet*. OWASP Cheat Sheet Series. https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

OWASP Foundation. (n.d.). *Input validation cheat sheet*. OWASP Cheat Sheet Series. https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html

PostgreSQL Global Development Group. (2026). *PostgreSQL 18 documentation: CREATE TABLE*. https://www.postgresql.org/docs/current/sql-createtable.html
