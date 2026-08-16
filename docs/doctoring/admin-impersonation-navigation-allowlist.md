# Admin impersonation navigation allowlist

## Decision

Admin "Open dashboard as user" must not assign `window.location` to an
API-supplied URL until that URL is proven to be the same-origin
`/admin/impersonate` route with a single non-empty `token` query parameter and
no credentials, hash, or extra search keys. The same generation counter that
already invalidates stale clipboard completions now also invalidates in-flight
password-reset and impersonation requests when the selected customer changes.

If an administrator starts a reset-link or impersonation request for Alice and
then selects Bob, Alice's later response must not populate Bob's panel, must not
leave Bob's actions stuck in a busy state, and must not navigate the browser
into Alice's session.

## Threat model

The impersonation API is expected to return a relative path. A compromised,
misconfigured, or proxied response can still return an absolute cross-origin
URL, a protocol-relative host, a credentialed URL, or extra query/hash data.
Assigning that value is an open redirect: the administrator sees a trusted
Argos origin in the current page and can be sent to a phishing login that
captures the next privileged action.

A second failure mode is time-of-check/time-of-use across customer selection.
Password reset links and impersonation tokens are customer-bound secrets. A
stale success that lands on the newly selected customer causes the operator to
share or enter the wrong person's session.

This change does not replace server-side token issuance or session binding. It
is a fail-closed client allow-list plus request-generation invalidation.

## Standards interpretation

OWASP's unvalidated-redirects guidance requires an allow-list rather than a
denylist, and prefers mapping a short server-side token to a fixed destination
instead of accepting a free-form URL. The WHATWG URL Standard is the parser
used to compare origin, path, userinfo, search, and fragment after resolution
against the current trusted origin. CWE-601 describes the phishing impact of
redirecting through a trusted host.

No formal OWASP or W3C conformity is claimed.

## Verification contract

The regression suite covers:

- same-origin relative and absolute `/admin/impersonate?token=...` acceptance;
- rejection of cross-origin, protocol-relative, credentialed, `javascript:`,
  extra-query, hash, missing-token, empty-token, and non-string values;
- delayed reset-link success after a customer switch does not attach Alice's
  link to Bob;
- delayed impersonation success after a customer switch does not call
  `location.assign`.

The exact pull-request head must additionally pass repository type checking,
full tests, coverage, build, dependency review, SAST, and security checks
before an independent approval and merge.

## Operational implications

- If the API returns any URL other than `/admin/impersonate?token=<token>`, the
  administrator stays on the admin page and sees "Unable to open dashboard as
  selected user." Recreate the impersonation from the current customer row.
- After switching customers, ignore any still-running create-link or
  impersonation work. Start the action again on the customer now selected.
- Copy, create-link, and impersonation share one generation counter. Starting
  any of them cancels UI completion of the others.

## References

OWASP Foundation. (n.d.). *Unvalidated redirects and forwards cheat sheet*.
OWASP Cheat Sheet Series. Retrieved August 16, 2026, from
https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html

MITRE. (n.d.). *CWE-601: URL redirection to untrusted site ('open redirect')*.
Common Weakness Enumeration. Retrieved August 16, 2026, from
https://cwe.mitre.org/data/definitions/601.html

WHATWG. (n.d.). *URL living standard*. Retrieved August 16, 2026, from
https://url.spec.whatwg.org/
