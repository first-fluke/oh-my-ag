---
description: Manage MCP tools with natural language commands — list, enable, disable tools and tool groups
---

# MANDATORY RULES — VIOLATION IS FORBIDDEN

- **Response language follows `language` setting in `.agent/config/user-preferences.yaml` if configured.**
- **NEVER skip steps.** Execute from Step 1 in order.
- **Read configuration files BEFORE making changes.**

---

## Step 1: Show Current Status

1. Read `.agent/mcp.json` (프로젝트 설정)
2. Read `~/.gemini/settings.json` if exists (Gemini CLI 전역 설정) — optional
3. 각 MCP 서버별 상태 표시:
   - `available_tools: null` → "전체 활성화 (제한 없음)"
   - `available_tools: [...]` → "N개 도구 활성화" + 목록
4. `toolGroups` 정의가 있으면 사용 가능한 그룹 목록 표시

**출력 예시:**
```
📋 현재 MCP 도구 상태

[serena]
- 상태: 전체 활성화 (제한 없음)
- 사용 가능한 도구: 15개

📦 사용 가능한 도구 그룹:
- memory: read_memory, write_memory, edit_memory, list_memories, delete_memory
- code-analysis: get_symbols_overview, find_symbol, find_referencing_symbols, search_for_pattern
- code-edit: replace_symbol_body, insert_after_symbol, insert_before_symbol, rename_symbol
- file-ops: list_dir, find_file
- all: 전체 도구 (제한 없음)

무엇을 변경하시겠습니까?
```

---

## Step 2: Parse User Command

자연어 명령을 해석합니다:

| 명령 패턴 | 해석 |
|---------|-----|
| "현재 상태", "목록", "보여줘" | Step 1 다시 실행 |
| "메모리 도구만", "{그룹명}만 활성화" | 해당 그룹 도구만 `available_tools`에 설정 |
| "{도구명} 비활성화", "{도구명} 끄기" | 해당 도구를 `available_tools`에서 제거 |
| "전체 활성화", "모두 켜줘", "리셋" | `available_tools: null` 설정 |
| "{도구1}, {도구2}만 켜줘" | 지정된 도구만 `available_tools`에 설정 |
| "임시로", "--temp" | 세션 동안만 적용 (Step 3b) |

**그룹 조합 지원:**
- "메모리 + 파일 도구" → `memory` + `file-ops` 그룹 병합
- "코드 분석 빼고 전부" → `all`에서 `code-analysis` 제외

---

## Step 3: Update Configuration

### Step 3a: 영구 수정 (기본)

1. **변경 전/후 diff 표시:**
   ```
   📝 mcp.json 변경 예정:

   변경 전:
   - serena.available_tools: null (전체)

   변경 후:
   - serena.available_tools: ["read_memory", "write_memory", "edit_memory", "list_memories", "delete_memory"]

   적용하시겠습니까? (Y/N)
   ```

2. **사용자 확인 후** `.agent/mcp.json` 수정

3. **완료 메시지:**
   ```
   ✅ 완료! 이제 serena는 메모리 도구만 사용 가능합니다.

   ⚠️ 참고: IDE/CLI 재시작 후 완전히 적용됩니다.
   현재 세션에서는 이전 설정이 계속 적용될 수 있습니다.
   ```

### Step 3b: 임시 적용 (`--temp` 또는 "임시로")

세션 동안만 적용되는 임시 설정:

1. `write_memory`로 `.serena/memories/tool-overrides.md` 생성:
   ```markdown
   # Tool Overrides (Temporary)

   ## Session
   Created: {ISO timestamp}
   Expires: Session end

   ## Overrides
   ```json
   {
     "serena": {
       "available_tools": ["read_memory", "write_memory"]
     }
   }
   ```

   ## Note
   이 파일은 임시 설정입니다. 다음 세션에서는 무시됩니다.
   영구 적용하려면 `/tools` 워크플로우를 `--temp` 없이 실행하세요.
   ```

2. **완료 메시지:**
   ```
   ✅ 임시 적용 완료!

   이 세션에서만 serena는 메모리 도구만 사용합니다.
   영구 적용하려면 다시 `/tools 메모리만 활성화` (--temp 없이) 실행하세요.
   ```

---

## Step 4: Handle Special Cases

### 알 수 없는 도구명
```
⚠️ '{도구명}'은(는) 알 수 없는 도구입니다.

유사한 도구:
- read_memory
- write_memory

정확한 도구명을 입력해주세요.
```

### 서버 충돌
여러 MCP 서버가 설정되어 있을 때:
```
📋 여러 MCP 서버가 감지되었습니다:
- serena
- custom-memory

어떤 서버의 도구를 변경하시겠습니까?
1. serena
2. custom-memory
3. 전체
```

### 빈 도구 목록
```
⚠️ available_tools를 빈 배열로 설정하면 해당 서버의 모든 도구가 비활성화됩니다.
정말 계속하시겠습니까? (Y/N)
```

---

## Quick Reference

| 명령 | 결과 |
|-----|-----|
| `/tools` | 현재 상태 표시 |
| `/tools 메모리만` | 메모리 도구만 활성화 |
| `/tools 코드 분석 + 메모리` | 두 그룹 활성화 |
| `/tools 전체` | 모든 도구 활성화 (리셋) |
| `/tools read_memory, write_memory만` | 지정 도구만 활성화 |
| `/tools 코드 편집 비활성화` | 해당 그룹 제거 |
| `/tools 메모리만 --temp` | 임시 적용 (이 세션만) |

---

## Runtime Override Protocol

다른 워크플로우가 도구 제한을 확인하는 방법:

1. **워크플로우 시작 시:** `read_memory("tool-overrides.md")` 확인
2. **오버라이드 존재 시:** 해당 설정을 우선 적용
3. **없거나 만료 시:** `mcp.json` 설정 사용

**Note:** IDE/CLI가 `available_tools`를 직접 지원하지 않는 경우,
워크플로우 레벨에서 도구 사용을 자체적으로 제한해야 합니다.
