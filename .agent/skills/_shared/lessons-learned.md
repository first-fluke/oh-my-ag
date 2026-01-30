# Lessons Learned

세션 간 누적되는 교훈 저장소. 모든 에이전트는 실행 시작 시 이 파일을 참조한다.
QA Agent와 Orchestrator가 세션 종료 후 새 교훈을 추가한다.

---

## 사용 방법

### 읽기 (모든 에이전트)
- Complex 태스크 시작 시: 자신의 도메인 섹션을 읽고 동일 실수 방지
- Medium 태스크: 관련 항목이 있으면 참고
- Simple 태스크: 스킵 가능

### 쓰기 (QA Agent, Orchestrator)
세션 종료 후 아래 형식으로 추가:
```markdown
### {YYYY-MM-DD}: {agent-type} - {한줄 요약}
- **문제**: {무엇이 잘못되었나}
- **원인**: {왜 발생했나}
- **해결**: {어떻게 고쳤나}
- **예방**: {앞으로 어떻게 방지하나}
```

---

## Backend Lessons

> 이 섹션은 backend-agent, debug-agent (backend 버그 시) 가 참조합니다.

### 초기 교훈 (프로젝트 설정 시 기록)
- **SQLAlchemy 2.0 스타일만 사용**: `query()` 대신 `select()` 사용. 레거시 스타일은 경고 발생.
- **Alembic autogenerate 후 반드시 리뷰**: 자동 생성된 마이그레이션에 인덱스 누락 또는 잘못된 타입이 있을 수 있음.
- **FastAPI Depends 체인**: 의존성 함수 내에서 다른 Depends를 호출하면 순서 문제 발생 가능. 테스트로 확인.
- **async/await 일관성**: 하나의 라우터에서 sync/async 혼용하지 말 것. 모두 async로 통일.

---

## Frontend Lessons

> 이 섹션은 frontend-agent, debug-agent (frontend 버그 시) 가 참조합니다.

### 초기 교훈
- **Next.js App Router**: `useSearchParams()`는 반드시 `<Suspense>` 바운더리 안에서 사용. 안 그러면 빌드 에러.
- **shadcn/ui 컴포넌트**: import 경로가 `@/components/ui/button`이지 `shadcn/ui`가 아님.
- **TanStack Query v5**: `useQuery`의 첫 번째 인자가 객체 형태 `{ queryKey, queryFn }`. v4의 `useQuery(key, fn)` 형태 사용 불가.
- **Tailwind 다크 모드**: `dark:` 접두사는 `darkMode: 'class'` 설정이 있어야 동작.

---

## Mobile Lessons

> 이 섹션은 mobile-agent, debug-agent (mobile 버그 시) 가 참조합니다.

### 초기 교훈
- **Riverpod 2.4+ code generation**: `@riverpod` 어노테이션 사용 시 `build_runner` 실행 필요. 빌드 전에 `dart run build_runner build`.
- **GoRouter redirect**: redirect 함수에서 현재 경로를 반환하면 무한 루프. 반드시 `null` 반환하여 리다이렉트 없음을 표시.
- **Flutter 3.19+ Material 3**: `useMaterial3: true`가 기본값. ThemeData에서 명시적으로 설정하지 않아도 M3 적용됨.
- **iOS 시뮬레이터에서 네트워크**: localhost 대신 `127.0.0.1` 사용. 또는 Android는 `10.0.2.2`.

---

## QA / Security Lessons

> 이 섹션은 qa-agent가 참조합니다.

### 초기 교훈
- **rate limiting 확인 방법**: `curl`로 연속 요청 보내서 429 응답 확인. 코드 리뷰만으로는 부족.
- **CORS 와일드카드**: 개발 환경에서 `*` 사용은 OK, 하지만 production 빌드에서는 반드시 특정 도메인으로 제한.
- **npm audit vs safety**: frontend는 `npm audit`, backend (Python)은 `pip-audit` 또는 `safety check`.

---

## Debug Lessons

> 이 섹션은 debug-agent가 참조합니다.

### 초기 교훈
- **React hydration 에러**: `Date.now()`, `Math.random()`, `window.innerWidth` 등 서버/클라이언트 값이 다른 코드가 원인. `useEffect` + `useState`로 감싸기.
- **N+1 쿼리 감지**: SQLAlchemy에서 `echo=True` 설정하면 모든 쿼리 로깅. 같은 패턴 쿼리가 반복되면 N+1.
- **Flutter hot reload 후 상태 유실**: StatefulWidget의 initState가 hot reload 시 재실행되지 않음. 상태 초기화 로직은 didChangeDependencies에.

---

## Cross-Domain Lessons

> 모든 에이전트가 참조합니다.

### 초기 교훈
- **API 계약 불일치**: backend가 `snake_case`, frontend가 `camelCase` 기대 시 파싱 실패. 계약서에 casing 명시 필수.
- **시간대 문제**: backend는 UTC로 저장, frontend는 로컬 타임존으로 표시. ISO 8601 형식 통일.
- **인증 토큰 전달**: backend가 `Authorization: Bearer {token}` 기대하는데 frontend가 `token` 헤더로 보내는 실수 주의.

---

## 교훈 추가 프로토콜

### QA Agent가 추가하는 경우
리뷰 중 반복되는 이슈를 발견하면:
1. 해당 도메인 섹션에 교훈 추가
2. 형식: `### {날짜}: {한줄 요약}` + 문제/원인/해결/예방
3. MCP 메모리 도구: `[EDIT]("lessons-learned.md", 추가 내용)`

### Orchestrator가 추가하는 경우
세션 종료 시 실패한 태스크가 있으면:
1. 실패 원인 분석
2. 해당 도메인 섹션에 교훈 추가
3. 다음 세션에서 같은 실수 방지

### 교훈이 너무 많아지면 (50개 이상)
- 오래된 교훈 (6개월+)은 아카이브로 이동
- 프레임워크 버전 업그레이드로 무효화된 교훈 삭제
- 이 정리는 수동으로 수행 (에이전트가 임의 삭제하지 말 것)
