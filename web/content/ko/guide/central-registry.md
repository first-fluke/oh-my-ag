---
title: 중앙 레지스트리 멀티 레포 설정
description: 이 저장소를 버전 기반 중앙 레지스트리로 운영하고 컨슈머 프로젝트를 PR 기반으로 안전하게 동기화하는 방법.
---

# 중앙 레지스트리 멀티 레포 설정

이 저장소는 에이전트 스킬의 **중앙 레지스트리**로 사용할 수 있으며, 여러 컨슈머 저장소를 버전 기준으로 일관되게 동기화할 수 있습니다.

## 아키텍처

```text
┌─────────────────────────────────────────────────────────┐
│  중앙 레지스트리 (이 저장소)                            │
│  • release-please 기반 자동 버저닝                      │
│  • CHANGELOG.md 자동 생성                               │
│  • prompt-manifest.json (버전/파일/체크섬)               │
│  • agent-skills.tar.gz 릴리스 아티팩트                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  컨슈머 저장소                                           │
│  • .agent-registry.yaml 기반 버전 고정                  │
│  • 새 버전 감지 시 PR 생성 (자동 머지 없음)             │
│  • 재사용 가능한 동기화 액션                             │
└─────────────────────────────────────────────────────────┘
```

## 레지스트리 유지보수자용

릴리스는 [release-please](https://github.com/googleapis/release-please)로 자동화됩니다.

1. Conventional Commits (`feat:`, `fix:`, `chore:` 등) 규칙을 사용합니다.
2. `main`에 푸시하면 Release PR이 자동 생성/업데이트됩니다.
3. Release PR을 머지하면 GitHub Release 자산이 발행됩니다.
   - `CHANGELOG.md` (자동 생성)
   - `prompt-manifest.json` (파일 목록 + SHA256 체크섬)
   - `agent-skills.tar.gz` (`.agent/` 디렉토리 압축본)

## 컨슈머 프로젝트용

`docs/consumer-templates/`의 템플릿을 프로젝트에 복사합니다.

```bash
# 설정 파일
cp docs/consumer-templates/.agent-registry.yaml /path/to/your-project/

# GitHub 워크플로우
cp docs/consumer-templates/check-registry-updates.yml /path/to/your-project/.github/workflows/
cp docs/consumer-templates/sync-agent-registry.yml /path/to/your-project/.github/workflows/
```

그다음 `.agent-registry.yaml`에서 원하는 버전을 고정합니다.

```yaml
registry:
  repo: first-fluke/oh-my-ag
  version: "1.2.0"
```

워크플로우 역할:

- `check-registry-updates.yml`: 새 버전 확인 후 PR 생성
- `sync-agent-registry.yml`: 고정 버전이 변경되면 `.agent/` 동기화

**중요**: 자동 머지는 의도적으로 비활성화되어 있습니다. 모든 업데이트는 수동 검토가 필요합니다.

## 재사용 가능한 액션 사용

컨슈머 저장소에서 동기화 액션을 직접 호출할 수 있습니다.

```yaml
- uses: first-fluke/oh-my-ag/.github/actions/sync-agent-registry@main
  with:
    registry-repo: first-fluke/oh-my-ag
    version: "1.2.0" # 또는 "latest"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
