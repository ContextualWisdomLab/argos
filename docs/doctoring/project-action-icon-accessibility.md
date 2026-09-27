# Project action icon accessibility evidence

## Decision

Project edit and delete controls already expose explicit `aria-label` values, while both project-creation controls include visible `Create project` text. Their Lucide glyphs are redundant decoration rather than separate controls or status indicators, so each glyph is marked `aria-hidden="true"` while its owning native button remains exposed.

## Verification contract

The component-level DOM regression renders one real project card and proves:

- the pencil and trash glyphs are hidden from the accessibility tree;
- every plus glyph associated with visible create text is hidden;
- the edit, delete, and create buttons retain their expected accessible names.

The contract does not hide the buttons, remove visible text, or replace native button semantics.

## Reference

Web Accessibility Initiative. (2026, June 4). *Accessible Rich Internet Applications (WAI-ARIA) 1.3* [Working draft]. World Wide Web Consortium. https://www.w3.org/TR/wai-aria-1.3/
