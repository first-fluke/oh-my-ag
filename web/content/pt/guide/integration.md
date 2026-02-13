---
title: Integração com Projeto Existente
description: Fluxo de integração seguro e não-destrutivo para adicionar skills do oh-my-ag a um projeto Antigravity existente.
---

# Integrar em um Projeto Existente

Este guia substitui o fluxo legado do `AGENT_GUIDE.md` na raiz e reflete a estrutura atual de workspace (`cli` + `web`) e o comportamento da CLI.

## Objetivo

Adicionar skills do `oh-my-ag` a um projeto existente sem sobrescrever os assets atuais.

## Caminho Recomendado (CLI)

Execute isto na raiz do projeto alvo:

```bash
bunx oh-my-ag
```

O que ele faz:

- Instala ou atualiza `.agent/skills/*`
- Instala recursos compartilhados em `.agent/skills/_shared`
- Instala `.agent/workflows/*`
- Instala `.agent/config/user-preferences.yaml`
- Opcionalmente instala workflows globais em `~/.gemini/antigravity/global_workflows`

## Caminho Manual Seguro

Use quando precisar de controle total sobre cada diretório copiado.

```bash
cd /path/to/your-project

mkdir -p .agent/skills .agent/workflows .agent/config

# Copiar apenas diretórios de skills ausentes (exemplo)
for skill in workflow-guide pm-agent frontend-agent backend-agent mobile-agent qa-agent debug-agent orchestrator commit; do
  if [ ! -d ".agent/skills/$skill" ]; then
    cp -r /path/to/oh-my-ag/.agent/skills/$skill .agent/skills/$skill
  fi
done

# Copiar recursos compartilhados se ausentes
[ -d .agent/skills/_shared ] || cp -r /path/to/oh-my-ag/.agent/skills/_shared .agent/skills/_shared

# Copiar workflows se ausentes
for wf in coordinate.md orchestrate.md plan.md review.md debug.md setup.md tools.md; do
  [ -f ".agent/workflows/$wf" ] || cp /path/to/oh-my-ag/.agent/workflows/$wf .agent/workflows/$wf
done

# Copiar preferências de usuário padrão apenas se ausentes
[ -f .agent/config/user-preferences.yaml ] || cp /path/to/oh-my-ag/.agent/config/user-preferences.yaml .agent/config/user-preferences.yaml
```

## Checklist de Verificação

```bash
# 9 skills instaláveis (excluindo _shared)
find .agent/skills -mindepth 1 -maxdepth 1 -type d ! -name '_shared' | wc -l

# Recursos compartilhados
[ -d .agent/skills/_shared ] && echo ok

# 7 workflows
find .agent/workflows -maxdepth 1 -name '*.md' | wc -l

# Verificação básica de saúde dos comandos
bunx oh-my-ag doctor
```

## Dashboards Opcionais

Os dashboards são opcionais e utilizam a CLI instalada:

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

URL padrão do dashboard web: `http://localhost:9847`

## Estratégia de Rollback

Antes da integração, crie um commit de checkpoint no seu projeto:

```bash
git add -A
git commit -m "chore: checkpoint before oh-my-ag integration"
```

Se precisar desfazer, reverta esse commit com o processo normal da sua equipe.

## Suporte a Symlinks Multi-CLI

Quando você executar `bunx oh-my-ag`, verá este prompt após selecionar as skills:

```text
Also develop with other CLI tools?
  ○ Claude Code (.claude/skills/)
  ○ OpenCode, Amp, Codex (.agents/skills/)
  ○ GitHub Copilot (.github/skills/)
```

Selecione quaisquer ferramentas CLI adicionais que você utiliza junto com o Antigravity. O instalador irá:

1. Instalar skills em `.agent/skills/` (localização nativa do Antigravity)
2. Criar symlinks do diretório de skills de cada CLI selecionada para `.agent/skills/`

Isso garante uma fonte única da verdade enquanto permite que as skills funcionem em múltiplas ferramentas CLI.

### Estrutura de Symlinks

```
.agent/skills/frontend-agent/      <- Fonte (SSOT)
.claude/skills/frontend-agent/     -> ../../.agent/skills/frontend-agent/
.agents/skills/frontend-agent/     -> ../../.agent/skills/frontend-agent/ (OpenCode, Amp, Codex)
.github/skills/frontend-agent/     -> ../../.agent/skills/frontend-agent/ (GitHub Copilot)
```

O instalador ignora symlinks existentes e alerta se um diretório real existir no local de destino.

## Observações

- Não sobrescreva pastas existentes em `.agent/skills/*` a menos que pretenda substituir skills personalizadas.
- Mantenha arquivos de política específicos do projeto (`.agent/config/*`) sob a propriedade do seu repositório.
- Para padrões de orquestração multi-agente, continue com o [`Guia de Uso`](./usage.md).
