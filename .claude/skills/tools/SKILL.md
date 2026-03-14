---
name: tools
description: MCP 도구 상태 확인 및 관리 — 도구 그룹 활성화/비활성화
disable-model-invocation: true
---

# /tools

## 실행 전 필수 참조

다음 파일을 읽고 따르세요:

1. `.agents/workflows/tools.md` (정식 워크플로우 — 모든 스텝 준수)

## Claude Code 어댑션

- inline 실행
- `.agents/mcp.json` 직접 읽기/수정 (Read, Edit 도구)

## 사용법

- `/tools` — 현재 도구 상태 표시
- `/tools memory only` — memory 도구만 활성화
- `/tools all` — 모든 도구 활성화 (리셋)
- `/tools memory only --temp` — 임시 세션 전용 오버라이드

## 도구 그룹

| 그룹 | 도구 |
|:----|:----|
| memory | read_memory, write_memory, edit_memory, list_memories |
| code-analysis | get_symbols_overview, find_symbol, find_referencing_symbols, search_for_pattern |
| code-edit | apply_diff, create_file |
| file-ops | list_dir, read_file |
| all | 위 전체 |

## 핵심 스텝 요약

1. **상태 표시**: `.agents/mcp.json` 읽기, 활성 도구/그룹 표시
2. **명령 파싱**: "enable only {group}", "disable {tool}", "enable all"
3. **설정 변경**: 영구 (mcp.json 수정) 또는 임시 (--temp)
4. **특수 상황**: 알 수 없는 도구, 서버 충돌, 빈 도구 목록 처리

$ARGUMENTS
