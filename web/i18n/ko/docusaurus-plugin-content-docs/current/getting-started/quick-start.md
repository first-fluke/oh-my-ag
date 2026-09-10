---
title: 빠른 시작
description: 빈 프로젝트에서 검증된 oh-my-agent 프롬프트까지 가장 짧은 경로와 예상 결과, 복구 단계를 설명합니다.
---

# 빠른 시작

전체 레퍼런스를 읽기 전에 OMA 설치와 호스트 통합이 작동하는지 확인하려면 이 페이지를 사용하세요. 프로젝트 디렉토리와 지원되는 AI CLI 또는 IDE가 하나 이상 필요합니다. 설치 프로그램은 macOS, Linux, Windows에서 `bun`, `uv`, Serena, CUE를 부트스트랩할 수 있습니다. 첫 프롬프트에는 선택한 호스트 통합이 필요하지만 프로바이더와 브라우저 통합은 선택 사항입니다.

## 1. OMA 설치와 통합 계층 설정

프로젝트 디렉토리에서 부트스트랩 설치 프로그램을 실행합니다.

```bash
curl -fsSL https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.sh | bash
```

Windows PowerShell에서는 다음을 실행합니다.

```powershell
irm https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.ps1 | iex
```

대화형 설정에서 응답 언어, CLI 벤더, 기능 프로바이더, 모델 프리셋, 프로젝트 스킬 프리셋, 스택 변형을 선택합니다. 첫 실행에서는 기본값을 유지하고 이미 사용하는 벤더를 선택하며 저장소에 가장 가까운 프로젝트 프리셋을 고르세요.

이미 `bun`이 있다면 설치 프로그램을 직접 실행합니다.

```bash
bunx oh-my-agent@latest
```

부트스트랩 스크립트는 현재 프로젝트에 설치합니다. HOME 수준에 설치하려면 `oma install --global`을 사용하세요. 프로젝트 설치와 전역 설치를 함께 사용할 때는 먼저 [설치](./installation.md)를 읽으세요.

## 2. 결과 확인

같은 프로젝트 디렉토리에서 상태 점검을 실행합니다.

```bash
oma doctor
```

성공하면 선택한 벤더 통합과 `.agents/` 파일이 준비된 상태입니다. 선택 사항인 MCP, 브라우저, 메모리, 코드 인텔리전스 통합은 경고로 표시될 수 있지만 해당 통합을 사용하는 태스크에만 필요합니다. 각 표준 에이전트 역할에 해석된 모델과 CLI를 확인하려면 `oma doctor --profile`을 사용하세요.

명령을 찾을 수 없다면 CLI가 현재 `PATH` 밖에 설치된 것입니다. 새 셸을 열거나 패키지 매니저의 bin 디렉토리를 추가하세요. `oma doctor`가 잘못된 설정을 보고하면 표시된 필드를 고친 뒤 다시 실행합니다. 복구를 위해 `.agents/oma-config.yaml`을 삭제하지 마세요. 이 파일은 업데이트 사이에 설정을 보존하는 사용자 소유 설정입니다.

## 3. 작은 태스크 하나 실행

설정한 AI 도구에서 저장소를 열고 독립적인 변경 하나를 설명합니다.

```text
Add a validation message to the existing email field. Follow the project's current form and test conventions. Done when the invalid-email case is covered by a focused test.
```

선택한 호스트에서 키워드 훅이 활성화되어 있으면 일치하는 워크플로우를 활성화할 수 있습니다. 스킬 라우팅은 호스트 또는 선택한 워크플로우가 수행하므로, 임의의 호스트 프롬프트만으로 훅, 특정 스킬, `CHARTER_CHECK`가 실행된다고 보장할 수 없습니다. 실행 계약은 저장소 관례를 확인하고 범위가 정해진 변경만 수행하며 어떤 검사를 실행했는지 보고해야 합니다. 정확한 파일과 명령은 프로젝트에 따라 달라지므로 위 프롬프트는 예시입니다.

API와 UI 경계를 넘는 태스크에는 `/work` 또는 `/orchestrate`를 명시적으로 선택합니다. 단일 도메인이라면 [단일 스킬 실행](../guide/single-skill.md)을 계속 읽으세요. 더 긴 예시는 [사용 가이드](../guide/usage.md)에 있습니다.

## 4. 규모를 키우기 전에 기본값 확인

OMA는 `model_preset: auto`, 코드 인텔리전스의 Serena, 시맨틱 메모리의 Agent Memory, 네이티브 웹 검색, 비활성화된 텔레메트리로 시작합니다. Serena는 공유 `bridge` 전송을 사용하고 별도 설정이 없으면 자동으로 업데이트됩니다. 브라우저 DevTools MCP는 선택 사항이며, 새 대화형 설정에서는 먼저 Aside를 제안합니다. 동작과 오버라이드 키는 [중요한 기본값](./important-defaults.md)에서 확인하세요.

관리되는 태스크가 멈추면 먼저 `oma agent status <session-id> [agent-id]`를 실행한 다음 `.agents/state/agent-runs/`의 실행 기록과 주입된 구조화 클레임 경로를 확인합니다. 이 기록에는 실행, 태스크, 워크스페이스, 종료 코드, 검증 상태가 표시됩니다. `.agents/state/memories/` 아래의 사람이 읽는 `result-*.md`와 `progress-*.md`가 있으면 추가 맥락을 제공합니다. 실행이 더 이상 활성 상태가 아님을 확인한 뒤 실패한 가장 작은 명령만 다시 실행하세요. 지속 워크플로우는 완료되거나 `workflow done`이라고 말할 때까지 활성 상태로 남습니다. 상태 파일 복구는 [워크플로우](../core-concepts/workflows.md#persistent-mode-mechanics)를 참고하세요.

## 다음 단계

- 우선순위, 프로바이더, 복구 선택은 [중요한 기본값](./important-defaults.md)
- 프리셋, 벤더 설정, 전역 설치, 업데이트는 [설치](./installation.md)
- 33개 스킬 패키지와 디스패치 역할은 [에이전트](../core-concepts/agents.md)
- 계획, 병렬 실행, QA, 지속 모드는 [워크플로우](../core-concepts/workflows.md)
