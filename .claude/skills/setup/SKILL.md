---
name: setup
description: CLI 설치, MCP 연결, 에이전트-CLI 매핑 초기 설정
disable-model-invocation: true
---

# /setup

## 실행 전 필수 참조

다음 파일을 순서대로 읽고 따르세요:

1. `.agents/workflows/setup.md` (정식 워크플로우 — 모든 스텝 준수)
2. `.agents/config/user-preferences.yaml` (현재 설정 확인)

## Claude Code 어댑션

- inline 실행
- CLI 설치 상태 확인: Bash 도구로 `which gemini`, `which claude`, `which codex`
- MCP 설정: `.agents/mcp.json` 읽기

## 핵심 스텝 요약

1. **언어 설정**: `.agents/config/user-preferences.yaml` 확인/생성
2. **CLI 설치 확인**: gemini, claude, codex 설치 여부
3. **MCP 연결 확인**: 각 CLI의 MCP 설정 상태
4. **에이전트-CLI 매핑**: `agent_cli_mapping` 구성
5. **설정 완료 요약**: 현재 상태 보고

$ARGUMENTS
