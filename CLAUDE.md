# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

argos — Claude Code 팀 사용량 애널리틱스 (Next.js 웹 대시보드 + npm CLI `argos-ai`) 작업 가이드.

## 프로덕션 버그 대응 프로토콜

**500 에러 신고 수신 즉시 — 코드 분석 전에 먼저 실행:**

```bash
vercel logs --status-code 500 --since 24h -x --project argos-web
```

로그에서 에러 메시지를 확인한 뒤 코드 분석 시작. 로그가 근본 원인을 직접 가리키는 경우가 대부분임.

**자주 나오는 패턴:**

| 에러 메시지 | 원인 | 조치 |
|---|---|---|
| `column 'xxx' does not exist` | 마이그레이션 미적용 | `pnpm --filter @argos/web db:migrate` 후 재배포 |
| `UNIQUE constraint failed` | 중복 insert | race condition 또는 클라이언트 중복 요청 |
| `Cannot find module` | 빌드 실패 | vercel deployment 로그 확인 |

---

## API 에러 응답 규격

모든 API 에러 응답은 동일한 shape을 사용한다:

```ts
{ error: { code: string; message: string } }
```

- 400/401/403/404/409/410: `{ error: { code: 'SNAKE_CASE', message: '...' } }`
- 500: `handleRouteError(err)` 호출 (error-helper.ts)
- 직접 `{ error: 'string' }` 패턴 사용 금지 — `jsonError(code, message, status)` 헬퍼 사용

**클라이언트에서 에러 메시지 추출:**
```ts
const msg = data.error?.message ?? 'An error occurred'
```

---

## DB 스키마 변경 절차

1. `schema.prisma` 수정
2. `pnpm --filter @argos/web exec prisma migrate dev --name <설명>` 실행
3. PR에 migration SQL 파일 포함
4. production 배포 시 vercel.json의 buildCommand가 `db:migrate`(= `prisma migrate deploy`)를 자동 실행 (`VERCEL_ENV=production`일 때만)

schema.prisma를 수정하고 migration 파일을 만들지 않으면 CI가 실패한다.
마이그레이션 커밋 후에는 `.claude/skills/prisma-migration-checklist` 스킬의 배포 체크리스트를 따른다.

---

## 모노레포 구조

pnpm workspace(`packages/*`) + Turborepo. 루트 스크립트(`pnpm dev/build/lint/typecheck/test`)는 turbo로 전체 패키지에 실행된다.

```
packages/web    — @argos/web: Next.js 15 App Router 대시보드 (Vercel 배포 타겟)
packages/shared — @argos/shared: 공유 타입/스키마 (zod)
packages/cli    — argos-ai: npm 배포 CLI (bin: argos — 로그인/프로젝트 초기화/hook 설치)
```

`docs/`에 ADR(`docs/adr.md`), 스펙, usecases, findings 등 설계 문서가 있다.

**주요 파일:**
- `packages/web/src/lib/server/auth-actions.ts` — 인증 비즈니스 로직
- `packages/web/src/lib/server/error-helper.ts` — API 에러 응답 헬퍼 (`jsonError`, `handleRouteError`)
- `packages/web/src/lib/server/jwt.ts` — JWT 발급/검증
- `packages/web/src/lib/server/rbac.ts` — 역할 기반 권한 체크
- `packages/web/src/lib/server/db.ts` — Prisma 클라이언트
- `packages/web/prisma/schema.prisma` — DB 스키마
- `vercel.json` — 빌드/마이그레이션 배포 설정

---

## 자주 쓰는 명령어

```bash
# 로컬 개발
pnpm --filter @argos/web dev

# 타입체크 / 린트
pnpm --filter @argos/web typecheck
pnpm --filter @argos/web lint

# 테스트 (vitest)
pnpm --filter @argos/web test

# 전체 패키지 일괄 (turbo)
pnpm typecheck && pnpm lint && pnpm test

# DB 마이그레이션 (로컬)
pnpm --filter @argos/web exec prisma migrate dev --name <이름>

# 프로덕션 로그
vercel logs --status-code 500 --since 24h -x --project argos-web
```

---

## 저장소 전용 Claude 스킬/에이전트

`.claude/skills/`에 이 저장소 전용 스킬이, `.claude/agents/`에 서브에이전트 정의가 있다. 대표적으로:

- `commit` — 커밋/푸시 절차
- `new-task` / `harness-starter` — 작업 파이프라인 오케스트레이션
- `publish-cli` — `packages/cli`(argos-ai) npm 배포 절차
- `prisma-migration-checklist` — 마이그레이션 커밋 후 배포 체크리스트
- `test-strategy` — 테스트 작성 지침
- `ui-design-system` — 대시보드 UI 톤앤매너/공용 컴포넌트 규칙 (UI 작업 시 필수 참조)
- `findings-audit`, `ideation`, `persuasion-review` — 감사/기획 워크플로
