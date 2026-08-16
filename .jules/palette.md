## 2026-08-16 - Do Not Mutate Focused Action Names for Status

**Learning:** When providing success feedback for an action like copying a link, changing the accessible name of the currently focused button (e.g., from "Copy link" to "Copied") using `aria-live` nested inside the button is unreliable and can confuse users.

**Action:** Keep the action's visible and accessible label stable. Use a pre-existing sibling status container (`role="status"`, `aria-atomic="true"`) to announce the success message ("Link copied to clipboard.") and manage this feedback independently of the interactive control, clearing it when stale. Automated DOM tests do not prove screen-reader support across combinations.
