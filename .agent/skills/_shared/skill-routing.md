# Skill Routing Map

Orchestrator와 workflow-guide가 태스크를 올바른 에이전트에 배정하기 위한 라우팅 규칙.

---

## 키워드 → 스킬 매핑

| 사용자 요청 키워드 | 1차 스킬 | 비고 |
|-------------------|---------|------|
| API, endpoint, REST, GraphQL, database, migration | **backend-agent** | |
| 인증, auth, JWT, login, register, password | **backend-agent** | frontend에도 auth UI 태스크 생성 가능 |
| UI, 컴포넌트, component, page, form, 화면(웹) | **frontend-agent** | |
| 스타일, Tailwind, 반응형, responsive, CSS | **frontend-agent** | |
| 모바일, iOS, Android, Flutter, React Native, 앱 | **mobile-agent** | |
| 오프라인, push notification, camera, GPS | **mobile-agent** | |
| 버그, bug, error, crash, 안됨, 깨짐, 느림 | **debug-agent** | |
| 리뷰, review, 보안, security, 성능, performance | **qa-agent** | |
| 접근성, accessibility, WCAG, a11y | **qa-agent** | |
| 계획, plan, 분해, breakdown, 태스크, sprint | **pm-agent** | |
| 자동, automatic, 병렬, parallel, orchestrate | **orchestrator** | |
| 워크플로우, workflow, 가이드, manual, step-by-step | **workflow-guide** | |

---

## 복합 요청 라우팅

| 요청 패턴 | 실행 순서 |
|----------|----------|
| "풀스택 앱 만들어줘" | pm → (backend + frontend) 병렬 → qa |
| "모바일 앱 만들어줘" | pm → (backend + mobile) 병렬 → qa |
| "풀스택 + 모바일" | pm → (backend + frontend + mobile) 병렬 → qa |
| "버그 수정하고 리뷰해줘" | debug → qa |
| "기능 추가하고 테스트해줘" | pm → 해당 agent → qa |
| "자동으로 다 해줘" | orchestrator (내부적으로 pm → agents → qa) |
| "수동으로 관리할게" | workflow-guide |

---

## 에이전트 간 의존성 규칙

### 병렬 실행 가능 (의존성 없음)
- backend + frontend (API 계약서가 사전 정의된 경우)
- backend + mobile (API 계약서가 사전 정의된 경우)
- frontend + mobile (서로 독립)

### 순차 실행 필수
- pm → 다른 모든 에이전트 (계획이 먼저)
- 구현 에이전트 → qa (구현 완료 후 리뷰)
- 구현 에이전트 → debug (구현 완료 후 디버깅)
- backend → frontend/mobile (API 계약서 없이 병렬 실행 시)

### QA는 항상 마지막
- qa-agent는 모든 구현 태스크 완료 후에 실행
- 예외: 사용자가 특정 파일만 리뷰 요청한 경우 즉시 실행 가능

---

## 에스컬레이션 규칙

| 상황 | 에스컬레이션 대상 |
|------|-----------------|
| 에이전트가 다른 도메인 버그 발견 | debug-agent에 태스크 생성 |
| QA에서 CRITICAL 발견 | 해당 도메인 에이전트 재실행 |
| 아키텍처 변경 필요 | pm-agent에 재계획 요청 |
| 성능 이슈 발견 (구현 중) | 현재 에이전트가 수정, 심각하면 debug-agent |
| API 계약 불일치 | orchestrator가 backend 에이전트 재실행 |

---

## 에이전트별 턴 제한 가이드

| 에이전트 | 기본 턴 | 최대 턴 (재시도 포함) |
|---------|--------|---------------------|
| pm-agent | 10 | 15 |
| backend-agent | 20 | 30 |
| frontend-agent | 20 | 30 |
| mobile-agent | 20 | 30 |
| debug-agent | 15 | 25 |
| qa-agent | 15 | 20 |
