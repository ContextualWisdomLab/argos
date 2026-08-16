# Storybook inventory

Argos 웹 대시보드에서 반복되는 UI 객체의 상태 목록이다. 각 행은 나중에
Storybook CSF 스토리로 옮길 계약이다. `@storybook/react` 를 아직 설치하지
않았으므로 `*.stories.tsx` 는 추가하지 않는다. 설치 후 이 표를 스토리
파일로 1:1 승격한다.

## PendingActionLabel

경로: `packages/web/src/components/ui/pending-action-label.tsx`

구매자 다음 행동: 생성·저장·이동·삭제 버튼을 누른 뒤, 같은 버튼을 다시
누르지 말고 대기 문구가 사라질 때까지 기다린다.

| Story | pending | idleLabel | pendingLabel | Owner extras | 확인 포인트 |
|---|---|---|---|---|---|
| IdleCreate | false | 생성 | 생성 중… | enabled | 스피너 없음, 이름 `생성` |
| PendingCreate | true | 생성 | 생성 중… | disabled, aria-busy | 장식 스피너, 이름 `생성 중…` |
| PendingSave | true | 저장 | 저장 중… | disabled, aria-busy | 설정 저장과 동일 문구 |
| PendingRename | true | 변경 | 변경 중… | disabled, aria-busy | 프로젝트 이름 변경 |
| PendingTransfer | true | 이동 | 이동 중… | disabled, aria-busy, destructive | 프로젝트 이전 |
| PendingAddMember | true | 추가 | 추가 중… | disabled, aria-busy | 프로젝트 멤버 추가 |
| PendingRemoveMember | true | 제거 | 제거 중… | disabled, aria-busy | 멤버 제거 |
| DestructiveDelete | true | 삭제 | 삭제 중… | disabled, aria-busy, destructive | 조직/프로젝트/세션 삭제 |
| ReducedMotionPending | true | 생성 | 생성 중… | `prefers-reduced-motion: reduce` | `motion-reduce:animate-none` |
| KeyboardPending | true | 생성 | 생성 중… | Tab 후 Enter | 스피너는 포커스 대상이 아님 |
| NarrowViewportPending | true | 생성 | 생성 중… | 320px | 라벨이 잘리지 않음 |

## 아직 스토리로 승격하지 않는 상태

- Success / recoverable error: 모달은 성공 시 닫히고, 필드 오류는
  `role="alert"` 로 이미 연결된다. 버튼 객체에 성공 아이콘을 넣지 않는다.
- Select-only mutation (역할, Claude 요금제): 버튼 라벨이 없다.

## APA 7th references

World Wide Web Consortium. (2023, October 5). *Web Content Accessibility
Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/

World Wide Web Consortium. (2026, June 4). *Accessible Rich Internet
Applications (WAI-ARIA) 1.3* (Working Draft).
https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/
