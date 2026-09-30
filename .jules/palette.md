## 2025-02-27 - Icon decoration hidden from screen readers
**Learning:** Found that decorative icons (like `Icon` and `ChevronRight` in `EventList` items) inside interactive elements without explicit `aria-hidden="true"` can cause redundant screen reader announcements when their text label is present right next to them.
**Action:** Always add `aria-hidden="true"` to such decorative icons within UI components.
