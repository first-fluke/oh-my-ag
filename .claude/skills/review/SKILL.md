---
name: review
description: OWASP 보안, 성능, 접근성, 코드 품질 리뷰 (Fix-Verify Loop 포함)
disable-model-invocation: true
---

# /review

## 실행 전 필수 참조

다음 파일을 순서대로 읽고 따르세요:

1. `.agents/workflows/review.md` (7스텝 QA 파이프라인)
2. `.agents/skills/qa-agent/SKILL.md` (QA Agent 전문성)

## Claude Code 어댑션

### 기본 모드 (리뷰만)

QA 리뷰를 `qa-reviewer` 서브에이전트에 위임:

1. `.claude/agents/qa-reviewer.md` 에이전트를 Task tool로 스폰
2. 리뷰 대상 파일/범위를 프롬프트에 포함
3. 리뷰 결과를 사용자에게 보고 (CRITICAL → HIGH → MEDIUM → LOW 순)

Task tool 스폰 시 프롬프트 예시:
```
Review the following files for security, performance, accessibility, and code quality issues:
[파일 목록]
Follow .agents/skills/qa-agent/SKILL.md for review standards.
Report findings as: CRITICAL / HIGH / MEDIUM / LOW with file:line, description, and remediation code.
```

### Fix-Verify Loop (--fix 옵션 시)

사용자가 수정까지 원할 경우, 리뷰 → 수정 → 재리뷰 루프 실행:

```
[1] qa-reviewer Task tool 스폰 → 이슈 리스트 수신
[2] CRITICAL/HIGH 이슈 존재?
    NO → 보고 후 종료
    YES →
      [3] 해당 도메인 에이전트 Task tool 스폰 (이슈 + 수정 지침)
          - backend 이슈 → backend-impl 에이전트
          - frontend 이슈 → frontend-impl 에이전트
          - mobile 이슈 → mobile-impl 에이전트
      [4] 수정 결과 수신
      [5] qa-reviewer 재스폰 (수정된 코드 재리뷰)
      [6] → [2]로 돌아감 (최대 3회 반복)
```

## 리뷰 범위 결정

- `$ARGUMENTS`에 파일/디렉토리 지정 시 → 해당 범위만
- 지정 없으면 → `git diff --name-only` 또는 최근 변경 파일

$ARGUMENTS
