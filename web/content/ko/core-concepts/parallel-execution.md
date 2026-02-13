---
title: 병렬 실행
description: 여러 에이전트를 동시에 실행하는 CLI 오케스트레이션 패턴.
---

# 병렬 실행

## 기본 패턴

```bash
oh-my-ag agent:spawn backend "인증 API 구현" session-01 &
oh-my-ag agent:spawn frontend "로그인 폼 생성" session-01 &
wait
```

## 워크스페이스 지정 패턴

```bash
oh-my-ag agent:spawn backend "인증 + DB 마이그레이션" session-02 -w ./apps/api
oh-my-ag agent:spawn frontend "로그인 + 토큰 갱신" session-02 -w ./apps/web
```

## 모니터링 패턴

```bash
bunx oh-my-ag dashboard:web
# http://localhost:9847 접속
```

## 멀티-CLI 설정

`.agent/config/user-preferences.yaml`에서 에이전트별 CLI를 설정합니다:

```yaml
# 응답 언어
language: ko  # ko, en, ja, zh, ...

# 기본 CLI (단일 작업)
default_cli: gemini

# 에이전트별 CLI 매핑 (멀티-CLI 모드)
agent_cli_mapping:
  frontend: gemini
  backend: codex
  mobile: gemini
  pm: claude
  qa: claude
  debug: gemini
```

대화형으로 설정하려면 `/setup`을 실행하세요.

## CLI 벤더 선택 우선순위

1. `--vendor` 명령줄 인자
2. `user-preferences.yaml`의 `agent_cli_mapping`
3. `user-preferences.yaml`의 `default_cli`
4. `cli-config.yaml`의 `active_vendor` (레거시)
5. 하드코딩 기본값: `gemini`
