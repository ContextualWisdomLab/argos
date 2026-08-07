# ERD DDL injection boundary

## Scope

`packages/web/src/lib/erd.ts` generates PostgreSQL `CREATE TABLE` text from the in-memory ERD model. This is a code-generation boundary rather than a normal parameterized DML query: SQL identifiers, data types, and selected default expressions occupy grammar positions where bind parameters are not generally available. The safe contract is therefore **positive allow-list validation plus explicit identifier quoting**, not deny-listing individual punctuation characters.

This document governs the `ERDModel` surface only. Generated DDL is still executable administrative input and must be reviewed and executed under least privilege in downstream migration tooling.

## Threat model

The relevant attacker controls or influences table/column metadata before `ERDModel.generateDDL()` is called. The security goals are:

1. A value supplied as a data type cannot smuggle a column constraint, reference, check expression, second statement, comment, operator, or unknown type grammar into the generated DDL.
2. A default value cannot invoke an arbitrary database function or inject another SQL statement.
3. A caller cannot mutate a previously validated `Column` or `ForeignKey` object after insertion and thereby change model-owned state without validation.
4. Accepted snake_case names remain valid even if they coincide with PostgreSQL keywords, because every generated identifier is double-quoted.
5. Malformed runtime values that bypass TypeScript's compile-time types fail closed before they reach grammar validation or model storage.

## Accepted grammar

### Identifiers

Database object identifiers use lower-case snake_case and are always emitted as PostgreSQL quoted identifiers. This keeps the storage naming policy deterministic and prevents accepted words such as `select` or `from` from becoming ambiguous SQL grammar.

### Data types

The model accepts only the reviewed type families encoded in `SIMPLE_SQL_TYPES`, `MULTI_WORD_SQL_TYPES`, and `PARAMETERIZED_SQL_TYPE`. Supported parameterized types are bounded to integer arity for `CHAR`, `VARCHAR`, `CHARACTER VARYING`, `NUMERIC`, and `DECIMAL`.

Column constraints such as `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `REFERENCES`, and `CHECK` are intentionally not part of `Column.type`. PostgreSQL documents a column definition as a data type followed by separate column-constraint grammar. Keeping those grammar slots distinct prevents a caller from bypassing the model's dedicated constraint fields.

### Default values

Defaults accept only:

- SQL single-quoted scalar strings, including standard doubled-quote escaping;
- signed integer or decimal literals;
- `TRUE`, `FALSE`, and `NULL`;
- reviewed current-time keywords (`CURRENT_DATE`, `CURRENT_TIME`, `CURRENT_TIMESTAMP`, `LOCALTIME`, `LOCALTIMESTAMP`); and
- `now()` as the sole reviewed function-form default.

Arbitrary function calls, malformed strings, statement terminators, and other expressions are rejected. If future product requirements need additional PostgreSQL expressions, extend the allow-list test-first rather than broadening it to a generic SQL-token regex.

## Validated-state ownership

`addColumn()` and `addForeignKey()` validate primitive runtime types and SQL/name contracts, then copy accepted fields into model-owned objects. `addTable()`, `getTable()`, and `getTables()` return independent plain-data snapshots. This makes validation stable across the lifetime of a model: mutating a caller-owned input or returned snapshot cannot alter the internal model.

## Verification contract

The ERD regression suite must continue to cover at least:

- legal simple, multi-word, and parameterized PostgreSQL type forms;
- grammar-smuggling attempts such as `INTEGER PRIMARY KEY`, `TEXT NOT NULL`, `INTEGER UNIQUE`, `INTEGER REFERENCES ...`, and `CHECK` expressions;
- unknown type names;
- scalar and reviewed built-in defaults;
- arbitrary function defaults and malformed quoted strings;
- malformed runtime field types despite TypeScript declarations;
- mutation of caller-owned column and foreign-key objects after insertion;
- independent getter snapshots;
- quoted DDL for normal and reserved-word identifiers; and
- multi-table foreign-key DDL.

Repository CI, security scanning, supply-chain checks, exact-head automated review, and independent approval remain separate merge gates. A predecessor-head pass does not prove a later head.

## Failure and rollback

This boundary is fail-closed. A newly requested type or default expression that is not explicitly supported is rejected instead of passed through. If compatibility pressure reveals a legitimate missing PostgreSQL form, add a focused failing regression, extend the smallest relevant allow-list, and rerun the complete exact-head suite.

Rollback of this hardening must not restore free-form type/default concatenation or semicolon-only filtering. If the ERD DDL generator must temporarily lose a capability, prefer disabling unsupported DDL export over accepting unvalidated grammar.

## References (APA 7th)

Open Worldwide Application Security Project. (n.d.). *Input validation cheat sheet*. OWASP Cheat Sheet Series. Retrieved August 7, 2026, from https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html

Open Worldwide Application Security Project. (n.d.). *SQL injection prevention cheat sheet*. OWASP Cheat Sheet Series. Retrieved August 7, 2026, from https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

PostgreSQL Global Development Group. (2026). *CREATE TABLE*. In *PostgreSQL 18 documentation*. https://www.postgresql.org/docs/18/sql-createtable.html
