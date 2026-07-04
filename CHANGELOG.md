# Changelog

## [Unreleased]

### 🎨 변경 사항 (UX / 접근성)

- 웹 대시보드의 각종 로그아웃 버튼(`org-sidebar.tsx`, `org-header.tsx`, `no-organization-state.tsx`)에 스크린 리더용 `aria-label="Log out of your account"` (또는 `Sign out of your account`) 속성을 추가하여 접근성을 개선했습니다.

## [Unreleased]
### Added
- [🎨 Palette: UX 개선] `overview-stats` 컴포넌트의 하드코딩된 ID를 `useId()` 훅으로 교체하여 접근성 및 다중 렌더링 시의 ID 충돌 방지.
- [🎨 Palette: UX 개선] `event-list` 컴포넌트 내 RowView 버튼에 `aria-expanded` 속성 및 키보드 포커스(`focus-visible`) 스타일 추가하여 키보드 접근성 향상.
