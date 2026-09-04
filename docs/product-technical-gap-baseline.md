# Product / Technical Gap Baseline

이 문서는 Argos의 live code와 열린 변경에서 확인된 상용화 Gap을 누적 관리한다. 추정이나 자동 생성 문구보다 protected branch, exact PR head, 실행 테스트와 공식 upstream 계약을 우선한다.

## 인증 자격증명 경계

### 문제

NextAuth Credentials adapter는 공유 인증 스키마를 거치지 않고 `loginUser()`로 비밀번호를 전달할 수 있었다. 기존 보완 PR은 1,024자 상한만 추가했지만, `packages/shared/src/schemas/auth.ts`의 실제 계약은 그 상한과 별도로 bcrypt 호환 UTF-8 72바이트 경계를 검증한다. 두 진입점의 규칙이 달라지면 동일한 사용자 자격증명이 transport에 따라 다르게 취급된다.

### 제약과 선택

- 비밀번호 정책의 domain truth는 공유 인증 계약에 둔다. NextAuth adapter에 바이트 계산 로직을 복사하지 않는다.
- 거대한 입력은 공유 스키마의 1,024자 상한에서 먼저 잘라 검증 비용을 제한한다.
- bcrypt.js가 처리하는 최대 길이는 문자 수가 아니라 UTF-8 72바이트다. adapter는 이 경계를 우회해 `bcrypt.compare()`를 호출하지 않는다.
- 인증 실패는 기존 NextAuth 계약대로 `null`을 반환하며, 사용자에게 내부 검증 사유를 노출하지 않는다.

### RED / GREEN evidence

- RED `1b41673427ac33e74ca285e88e24b704902128c2`: 72-byte ASCII 허용, 73-byte ASCII 거부, 72바이트를 넘는 다중 바이트 입력 거부, 1,024자 초과 입력 거부를 adapter-level regression으로 고정했다.
- GREEN `038f830b1e5de9f8dccef17124f2f3a1568a2594`: 공유 `LoginRequestSchema`를 재사용하는 credential-admission boundary를 추가했다.
- GREEN `7f4729ed82f0e88f6d5bd41166e1b160ab5fbdca`: NextAuth `authorize`가 raw email/password를 직접 `loginUser`에 전달하지 않고 admission 결과만 전달하도록 변경했다.
- Follow-up `3e07d77df5adf298559bcb218e8049a137e8d5c2`, `389ed792f15516c61a72d33704609b9634ee5aa0`: NextAuth raw credential type과 공개 계약 문서를 명시했다.
- Documentation repair `db0fb3aad8987b37814976750fbf442f696323e3`, `968f56c1f06c9f9d753e3b39bd8a41d3175ebf25`: bcrypt 비용이 입력 길이에 비례한다는 부정확한 설명과 중복 CHANGELOG 항목을 제거했다.

### 현재 acceptance

이 변경은 exact head에서 Web unit test, typecheck, lint, build와 repository security checks가 모두 terminal GREEN이어야 한다. 이전 head의 성공 증거는 승계하지 않는다. source-neutral retrigger commit이나 gate 완화는 acceptance가 아니다.

### 남은 Gap

Argos가 장기적으로 자격증명 원장을 직접 소유할지, CWL canonical identity backend인 Keyverse의 released contract를 소비할지는 별도 architecture decision으로 명시되어야 한다. 이 결정 전에는 Keyverse source copy, cross-service SQL, mutable sibling head 의존을 추가하지 않는다.

## Traceability

bcrypt.js 공식 문서는 bcrypt 입력 최대 길이가 UTF-8 72바이트이며, 호환성을 위해 라이브러리가 이 제한을 암묵적으로 검사하지 않으므로 호출자가 필요한 경우 truncation 여부를 검사해야 한다고 명시한다. 현재 Argos는 이미 공유 스키마에서 동일 경계를 적용하므로 모든 password-backed adapter가 그 계약을 재사용한다.

### Reference

dcodeIO. (n.d.). *bcrypt.js* [Computer software]. GitHub. Retrieved September 3, 2026, from https://github.com/dcodeIO/bcrypt.js
