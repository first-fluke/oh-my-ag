---
name: commit
description: Conventional Commits 규격 git 커밋 생성 (피처별 자동 분리)
disable-model-invocation: true
---

# /commit

## 실행 전 필수 참조

다음 파일을 읽고 따르세요:

1. `.agents/skills/commit/SKILL.md` (커밋 규격 및 타입 정의)

## Claude Code 어댑션

- Claude Code의 네이티브 git 도구 활용
- Bash 도구로 `git status`, `git diff --staged`, `git log` 실행
- HEREDOC으로 멀티라인 커밋 메시지 전달

## 커밋 타입

| Type | Description |
|:-----|:-----------|
| feat | 새 기능 |
| fix | 버그 수정 |
| refactor | 리팩토링 |
| docs | 문서 변경 |
| test | 테스트 추가/수정 |
| chore | 빌드/설정 |
| style | 코드 스타일 |
| perf | 성능 개선 |

## 커밋 포맷

```
<type>(<scope>): <description>

[optional body]

Co-Authored-By: First Fluke <our.first.fluke@gmail.com>
```

## 워크플로우

1. **변경 분석**: `git status` + `git diff --staged`
2. **피처 분리**: 다른 scope/type이면 커밋 분리 (5개 이하 파일이면 분리 불필요)
3. **타입 결정**: 변경 내용 → 적절한 type 선택
4. **스코프 결정**: 변경 모듈/컴포넌트
5. **설명 작성**: 명령형, 72자 이내, 소문자, 마침표 없음
6. **커밋 실행**: 메시지 보여주고 바로 실행 (확인 질문 없음)

## 절대 규칙

- `git add -A` / `git add .` 사용 금지 — 항상 파일 지정
- secrets 파일 (.env, credentials) 커밋 금지
- HEREDOC으로 커밋 메시지 전달
- Co-Author: `First Fluke <our.first.fluke@gmail.com>`

$ARGUMENTS
