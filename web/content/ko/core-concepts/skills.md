---
title: Skills
description: 점진적 공개와 토큰 최적화 스킬 아키텍처.
---

# Skills

## Progressive Disclosure

요청 의도에 따라 스킬이 자동 선택됩니다. 대부분의 경우 수동 선택이 필요 없습니다.

## 2계층 설계

각 스킬은 **토큰 최적화된 2계층 설계**를 사용합니다:

| 레이어 | 내용 | 크기 |
|--------|------|------|
| `SKILL.md` | 정체성, 라우팅 조건, 핵심 규칙 | ~40줄 (~800B) |
| `resources/` | 실행 프로토콜, 예시, 체크리스트, 플레이북, 스니펫, 기술 스택 | 필요 시 로드 |

이를 통해 초기 스킬 로딩 시 **~75% 토큰 절약** (스킬당 3-7KB → ~800B).

## 공통 리소스 레이어 (`_shared/`)

모든 스킬에서 중복 제거된 공통 리소스:

| 리소스 | 용도 |
|--------|------|
| `reasoning-templates.md` | 다단계 추론을 위한 구조화된 빈칸 채우기 템플릿 |
| `clarification-protocol.md` | 질문 vs 가정 판단, 모호성 수준별 대응 |
| `context-budget.md` | 모델 등급별 토큰 효율적 파일 읽기 전략 |
| `context-loading.md` | Orchestrator 프롬프트 구성을 위한 태스크-리소스 매핑 |
| `skill-routing.md` | 키워드→스킬 매핑, 병렬 실행 규칙 |
| `difficulty-guide.md` | Simple/Medium/Complex 평가 및 프로토콜 분기 |
| `lessons-learned.md` | 크로스 세션 누적 도메인 교훈 |
| `verify.sh` | 에이전트 완료 후 자동 검증 스크립트 |
| `api-contracts/` | PM이 작성, Backend가 구현, Frontend/Mobile이 소비 |
| `serena-memory-protocol.md` | CLI 모드 메모리 읽기/쓰기 프로토콜 |
| `common-checklist.md` | 범용 코드 품질 체크리스트 |

## 스킬별 리소스

각 스킬이 도메인 특화 리소스를 제공:

| 리소스 | 용도 |
|--------|------|
| `execution-protocol.md` | 4단계 Chain-of-thought 워크플로우 (분석 → 설계 → 구현 → 검증) |
| `examples.md` | 2-3개 few-shot 입출력 예시 |
| `checklist.md` | 도메인별 셀프 검증 체크리스트 |
| `error-playbook.md` | "3 strikes" 에스컬레이션 규칙을 포함한 장애 복구 |
| `tech-stack.md` | 상세 기술 사양 |
| `snippets.md` | 바로 사용 가능한 코드 패턴 |

## 설계 효과

초기 컨텍스트를 가볍게 유지하면서 필요 시 깊은 실행을 지원합니다.
