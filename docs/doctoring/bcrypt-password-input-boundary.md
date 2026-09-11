# Bcrypt password input boundary

## Decision

Argos currently stores user passwords with `bcryptjs`. Every login, registration,
and password-reset transport therefore uses one shared schema that applies two
separate limits before a password reaches bcrypt:

1. a 1,024-character coarse input cap bounds parsing and UTF-8 measurement work
   for hostile multi-megabyte requests; and
2. a 72-byte UTF-8 compatibility cap rejects input that bcrypt would otherwise
   truncate silently.

The byte limit is calculated over Unicode code points with standard UTF-8 byte
widths. It is not an ASCII-only character limit. The same contract is exported
from `@argos/shared` and consumed by the web password-reset route, so transports
cannot drift independently.

## Threat model

An unauthenticated caller can submit passwords to registration, login, and
password-reset surfaces. Without an early bounded contract, very large values can
consume request parsing, encoding, validation, hashing, memory, and log capacity.
A character-only limit also fails to describe bcrypt's actual 72-byte input
boundary: visually short Unicode strings can exceed that boundary and become
silently equivalent after truncation.

This change prevents both failure modes:

- input work is bounded before hashing; and
- passwords that bcrypt cannot verify in full are rejected rather than silently
  truncated.

It does not claim to make bcrypt a preferred modern password-storage algorithm.
OWASP treats bcrypt as a legacy option when Argon2id or scrypt is unavailable.

## Standards interpretation

NIST SP 800-63B-4 recommends permitting at least 64 characters, accepting Unicode,
and verifying the entire submitted password rather than truncating it. The same
publication recognizes that megabyte-scale passwords can require unreasonable
processing and that a maximum is appropriate. OWASP likewise recommends a maximum
of at least 64 characters, warns that long inputs can cause denial of service, and
states that bcrypt implementations generally accept at most 72 bytes.

The current repository cannot simultaneously preserve existing bcrypt hashes and
provide an unrestricted 64-Unicode-code-point contract for every script, because
some 64-code-point passwords exceed 72 UTF-8 bytes. The present boundary is a
fail-closed compatibility control, not the desired end state. A separately
reviewed migration must introduce Argon2id, preserve login compatibility through
algorithm-tagged hashes and rehash-on-success, and then raise the public password
contract without weakening resource limits.

No formal NIST or OWASP conformity is claimed.

## Verification contract

The regression suite covers:

- 8-character minimum behavior;
- 72-byte ASCII acceptance and 73-byte rejection;
- exact 72-byte boundaries for 2-byte, 3-byte, and 4-byte Unicode code points;
- oversized coarse input rejection;
- login, registration, and password-reset contract reuse;
- password-confirmation mismatch behavior; and
- direct password-reset route import from the shared schema.

The exact pull-request head must additionally pass repository type checking, full
tests, coverage, build, dependency review, SAST, and security checks before an
independent approval and merge.

## Operational implications

- Client error handling should display the schema's fixed byte-limit message
  without echoing the password.
- Logs, traces, and analytics must never record password values or prefixes.
- Rate limiting remains necessary; input length limits do not replace online
  authentication throttling.
- The 1,024-character coarse cap is an internal resource guard, not a promise
  that bcrypt accepts that many characters.

## References

National Institute of Standards and Technology. (2025). *Digital identity
guidelines: Authentication and authenticator management* (NIST Special
Publication 800-63B-4). U.S. Department of Commerce.
https://doi.org/10.6028/NIST.SP.800-63B-4

OWASP Foundation. (2023). *API4:2023 unrestricted resource consumption*. OWASP
API Security Top 10.
https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/

OWASP Foundation. (n.d.). *Authentication cheat sheet*. OWASP Cheat Sheet
Series. Retrieved August 5, 2026, from
https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

OWASP Foundation. (n.d.). *Password storage cheat sheet*. OWASP Cheat Sheet
Series. Retrieved August 5, 2026, from
https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
