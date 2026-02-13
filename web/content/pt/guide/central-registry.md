---
title: Registro Central para Configuração Multi-Repo
description: Opere este repositório como um registro central versionado e sincronize projetos consumidores de forma segura via atualizações baseadas em PR.
---

# Registro Central para Configuração Multi-Repo

Este repositório pode servir como um **registro central** para skills de agentes, de modo que múltiplos repositórios consumidores permaneçam alinhados com atualizações versionadas.

## Arquitetura

```text
┌─────────────────────────────────────────────────────────┐
│  Registro Central (este repo)                            │
│  • release-please para versionamento automático          │
│  • Geração automática de CHANGELOG.md                    │
│  • prompt-manifest.json (versão/arquivos/checksums)      │
│  • agent-skills.tar.gz artefato de release               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Repo Consumidor                                         │
│  • .agent-registry.yaml para fixação de versão           │
│  • Detecção de nova versão → PR (sem auto-merge)         │
│  • Action reutilizável para sincronização de arquivos    │
└─────────────────────────────────────────────────────────┘
```

## Para Mantenedores do Registro

As releases são automatizadas via [release-please](https://github.com/googleapis/release-please):

1. Use Conventional Commits (`feat:`, `fix:`, `chore:`, ...).
2. Faça push para `main` para criar/atualizar o PR de Release.
3. Faça merge do PR de Release para publicar os artefatos do GitHub Release:
   - `CHANGELOG.md` (gerado automaticamente)
   - `prompt-manifest.json` (lista de arquivos + checksums SHA256)
   - `agent-skills.tar.gz` (diretório `.agent/` comprimido)

## Para Projetos Consumidores

Copie os templates de `docs/consumer-templates/` para o seu projeto:

```bash
# Arquivo de configuração
cp docs/consumer-templates/.agent-registry.yaml /path/to/your-project/

# Workflows do GitHub
cp docs/consumer-templates/check-registry-updates.yml /path/to/your-project/.github/workflows/
cp docs/consumer-templates/sync-agent-registry.yml /path/to/your-project/.github/workflows/
```

Em seguida, fixe a versão desejada em `.agent-registry.yaml`:

```yaml
registry:
  repo: first-fluke/oh-my-ag
  version: "1.2.0"
```

Funções dos workflows:

- `check-registry-updates.yml`: verifica novas versões e abre um PR.
- `sync-agent-registry.yml`: sincroniza `.agent/` quando a versão fixada é alterada.

**Importante**: O auto-merge é intencionalmente desabilitado. Todas as atualizações devem ser revisadas manualmente.

## Usando a Action Reutilizável

Repositórios consumidores podem chamar a action de sincronização diretamente:

```yaml
- uses: first-fluke/oh-my-ag/.github/actions/sync-agent-registry@main
  with:
    registry-repo: first-fluke/oh-my-ag
    version: "1.2.0" # or "latest"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
