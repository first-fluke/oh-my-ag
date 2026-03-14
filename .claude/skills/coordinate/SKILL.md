---
name: coordinate
description: 태스크 기반 멀티 에이전트 조율 (Issue Remediation Loop 포함)
disable-model-invocation: true
---

# /coordinate

## 실행 전 필수 참조

다음 파일을 순서대로 읽고 따르세요:

1. `.agents/workflows/coordinate.md` (정식 워크플로우)
2. `.agents/skills/_shared/skill-routing.md` (에이전트 라우팅)
3. `.agents/skills/_shared/context-loading.md` (리소스 로딩)
4. `.agents/skills/_shared/prompt-structure.md` (4요소 프레임워크)

## Claude Code 네이티브 어댑션

CLI 스폰 대신 Task tool + TaskCreate로 태스크 추적 및 에이전트 스폰.

### Step 1: 요구사항 분석

- 사용자 요구사항 분석
- 관련 도메인 식별 (skill-routing.md 기반)

### Step 2: PM 태스크 분해

- 복잡한 요구사항: `pm-planner` 서브에이전트 Task tool 스폰
- 간단한 요구사항: inline으로 태스크 분해

### Step 3: 사용자 확인

- 플랜을 사용자에게 제시
- **반드시 사용자 확인 후 진행** (MUST get confirmation)

### Step 4: TaskCreate로 태스크 생성 + 에이전트 스폰

각 에이전트 태스크를 TaskCreate로 생성하여 진행 추적:

```
1. TaskCreate로 각 태스크 등록 (subject, description)
2. 우선순위 티어별로 에이전트 Task tool 스폰 (병렬)
   - 같은 티어 에이전트는 같은 메시지에서 복수 Task tool 호출
3. 완료 시 TaskUpdate로 상태 갱신
```

에이전트 매핑: `.claude/agents/{agent}.md` 참조

### Step 5: 모니터링

Task tool 결과 직접 반환 → 폴링 불필요.

### Step 6: QA 리뷰

`qa-reviewer` 서브에이전트 Task tool 스폰 (결과 리뷰)

### Step 7: Issue Remediation Loop (네이티브 루프)

```
LOOP:
  [1] 구현 에이전트 Task tool 스폰 (병렬)
  [2] 결과 수신
  [3] QA 에이전트 Task tool 스폰 (결과 리뷰)
  [4] QA 결과 파싱:
      - CRITICAL/HIGH 이슈 0건 → ACCEPT ✓
      - CRITICAL/HIGH 이슈 존재:
        → 이슈를 해당 에이전트의 피드백으로 구성:
          ## Issue Remediation
          **Agent**: {agent-name}
          **Issues**:
          - [CRITICAL] file:line — description — fix instruction
          - [HIGH] file:line — description — fix instruction
        → 해당 에이전트만 Task tool 재스폰 (이슈 + 수정 지침 포함)
        → [3]으로 돌아감 (QA 재리뷰)
```

이 루프는 CLI의 "Step 7: Address Issues and Iterate"를
Task tool 기반 동기 루프로 대체합니다.

### 최종 보고

- 완료된 태스크 목록
- 잔여 이슈 (있다면)
- 다음 단계 제안

$ARGUMENTS
