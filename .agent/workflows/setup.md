---
description: Initial setup workflow — verify CLI installations, check MCP connections, configure language and agent-CLI mapping
---

# MANDATORY RULES — VIOLATION IS FORBIDDEN

- **Response language follows `language` setting in `.agent/config/user-preferences.yaml` if configured.**
- **NEVER skip steps.** Execute from Step 1 in order.
- **Read configuration files BEFORE making changes.**

---

## Step 1: 언어 설정 확인

1. `.agent/config/user-preferences.yaml` 존재 여부 확인
2. 없으면:
   - 사용자에게 언어 선택 요청 (ko, en, ja, zh, ...)
   - 기본 설정 파일 생성
3. 있으면:
   - 현재 언어 설정 표시
   - 변경 여부 확인

---

## Step 2: CLI 설치 상태 확인

각 CLI 설치 확인:
```bash
which gemini && gemini --version
which claude && claude --version
which codex && codex --version
```

결과 표시:
```
🔍 CLI 설치 상태
┌─────────┬──────────┬─────────────┐
│ CLI     │ 상태     │ 버전        │
├─────────┼──────────┼─────────────┤
│ gemini  │ ✅ 설치됨 │ v2.1.0      │
│ claude  │ ✅ 설치됨 │ v1.0.30     │
│ codex   │ ❌ 미설치 │ -           │
└─────────┴──────────┴─────────────┘
```

미설치 CLI에 대한 설치 가이드 제공:
- **gemini**: `npm install -g @anthropic-ai/gemini-cli`
- **claude**: `npm install -g @anthropic-ai/claude-code`
- **codex**: `npm install -g @openai/codex-cli`

---

## Step 3: MCP 연결 상태 확인

1. `.agent/mcp.json` 존재 및 구성 확인
2. 각 CLI별 MCP 설정 상태:
   - Gemini CLI: `~/.gemini/settings.json`
   - Claude CLI: `~/.claude.json` 또는 `--mcp-config`
   - Codex CLI: `~/.codex/config.toml`
   - **Antigravity IDE**: `~/.gemini/antigravity/mcp_config.json`
3. Serena MCP 연결 테스트

결과 표시:
```
🔗 MCP 연결 상태
┌─────────────────┬──────────┬─────────────────────┐
│ 환경            │ MCP 설정 │ 서버                │
├─────────────────┼──────────┼─────────────────────┤
│ gemini CLI      │ ✅ 설정됨 │ serena (SSE)        │
│ claude CLI      │ ✅ 설정됨 │ serena              │
│ Antigravity IDE │ ⚠️ 브릿지 필요 │ -              │
│ codex CLI       │ ❌ 미설정 │ -                   │
└─────────────────┴──────────┴─────────────────────┘
```

누락된 MCP 설정에 대해:
- 설정 방법 안내 표시
- 자동 설정 옵션 제공 (선택)

---

## Step 3.1: Antigravity IDE SSE 브릿지 설정

> **중요**: Antigravity IDE는 SSE 방식을 직접 지원하지 않습니다.
> Serena를 SSE 서버로 실행하는 경우, 브릿지 스크립트가 필요합니다.

### Serena 서버 실행 확인

```bash
# Serena SSE 서버가 실행 중인지 확인
curl -s http://localhost:12341/sse -H "Accept: text/event-stream" | head -1
```

### 브릿지 설정 방법

1. **브릿지 스크립트 위치 확인**:
   ```bash
   ls scripts/mcp-sse-bridge.js
   ```

2. **Antigravity mcp_config.json 설정**:

   파일 경로: `~/.gemini/antigravity/mcp_config.json`

   ```json
   {
     "mcpServers": {
       "serena": {
         "command": "node",
         "args": [
           "/absolute/path/to/scripts/mcp-sse-bridge.js"
         ],
         "disabled": false
       }
     }
   }
   ```

3. **자동 설정 (선택)**:

   사용자에게 자동 설정 여부 확인 후:
   ```bash
   # 현재 프로젝트 경로 기준으로 설정
   PROJECT_PATH=$(pwd)

   # jq로 mcp_config.json 업데이트
   jq '.mcpServers.serena = {
     "command": "node",
     "args": ["'$PROJECT_PATH'/scripts/mcp-sse-bridge.js"],
     "disabled": false
   }' ~/.gemini/antigravity/mcp_config.json > /tmp/mcp_config.json \
   && mv /tmp/mcp_config.json ~/.gemini/antigravity/mcp_config.json
   ```

4. **IDE 재시작 안내**:
   ```
   ⚠️ Antigravity IDE를 재시작해야 변경사항이 적용됩니다.
   ```

### 브릿지 동작 방식

```
┌─────────────────┐     stdio      ┌──────────────────┐     HTTP/SSE     ┌─────────────────┐
│ Antigravity IDE │ ◄────────────► │ mcp-sse-bridge.js│ ◄──────────────► │ Serena SSE 서버 │
└─────────────────┘                └──────────────────┘                  └─────────────────┘
                                                                          (localhost:12341)
```

---

## Step 4: 에이전트-CLI 매핑 설정

1. 현재 매핑 표시
2. 변경 여부 확인:
   ```
   현재 에이전트-CLI 매핑:
   ┌──────────┬─────────┐
   │ Agent    │ CLI     │
   ├──────────┼─────────┤
   │ frontend │ gemini  │
   │ backend  │ gemini  │
   │ mobile   │ gemini  │
   │ pm       │ gemini  │
   │ qa       │ gemini  │
   │ debug    │ gemini  │
   └──────────┴─────────┘

   변경하시겠습니까? (예: "backend를 codex로", "pm을 claude로")
   ```

3. 변경 요청 시 `.agent/config/user-preferences.yaml` 업데이트

---

## Step 5: 설정 완료 요약

```
✅ 설정 완료!

📝 설정 요약:
- 응답 언어: 한국어 (ko)
- 타임존: Asia/Seoul
- 설치된 CLI: gemini ✅, claude ✅, codex ❌
- MCP 상태: Serena 연결됨
- Antigravity IDE: SSE 브릿지 설정됨 ✅

📋 에이전트-CLI 매핑:
- frontend → gemini
- backend → gemini
- mobile → gemini
- pm → gemini
- qa → gemini
- debug → gemini

🚀 시작하려면:
- /plan: 프로젝트 계획 수립
- /orchestrate: 자동화된 멀티 에이전트 실행
- /coordinate: 대화형 멀티 에이전트 조율

💡 Antigravity IDE 사용 시:
- Serena 서버 실행: serena-mcp-server --port 12341
- IDE 재시작 후 /coordinate 명령 사용 가능
```
