---
title: "Guia: Motor de diagramas (archify)"
sidebar_label: Diagramas
description: Como o oh-my-agent escolhe entre Mermaid e a skill opcional de agente tt-a1i/archify para diagramas de arquitetura, sequência e fluxo de dados — a seção de configuração diagram, oma diagram resolve / oma diagram archify, seu uso por /architecture e /explain e o loop sem limite fixo de validação-reparo-entrega.
---

# Motor de diagramas

`/architecture` (ADRs, recomendações e revisões) e `/explain` (explainers de alterações de código) emitem diagramas estruturais. Eles sempre são blocos **Mermaid** dentro do artefato Markdown e, quando [archify](https://github.com/tt-a1i/archify) pode ser resolvido, o que é o caso normal, também um **diagrama HTML interativo e validado** ao lado do artefato: tema claro/escuro, pan-zoom, busca, rastreamento de relações e exportação PNG/SVG/WebM, renderizado a partir de uma especificação JSON tipada.

Mermaid nunca desaparece: é a SSOT textual que vive no Markdown e nos diffs do Git. archify é um artefato derivado.

---

## Archify sempre atualizado — nada para instalar

archify é uma skill de agente sob licença MIT (Node ≥ 18, sem dependências de runtime). O oh-my-agent não depende de uma cópia instalada uma vez; mantém **sua própria cópia gerenciada** e acompanha a versão mais recente:

- Cache: `~/.cache/oma-diagram/archify/<tag>/` mais um ponteiro `state.json`.
- Antes de cada uso, `oma diagram resolve` consulta no GitHub a tag da versão mais recente (limitada a uma vez por `check_interval_min`, padrão 60 min), baixa o tarball do código quando existe uma tag mais nova (diretório atômico por tag; tags antigas são removidas) e, caso contrário, reutiliza a cópia em cache.
- Falhas de rede nunca são fatais: a cópia em cache é usada e informada como `stale` com o motivo. Somente uma primeira execução sem rede e sem cache recorre a uma cópia da skill instalada pelo usuário e, depois disso, ao Mermaid.

```bash
# Illustrative output; the release tag, cache path, and quality can vary.
oma diagram update          # force a check / download now
oma diagram resolve
# engine:   archify  (requested: auto)
# reason:   archify 2.15.0 via managed:v2.15.0 (current)
# root:     /Users/you/.cache/oma-diagram/archify/v2.15.0
# quality:  showcase
oma diagram resolve --offline   # never touch the network
```

Ordem de resolução (o primeiro resultado vence, de forma idêntica em todos os runtimes de vendor):

1. `diagram.archify.path` em `oma-config.yaml` — fixação explícita, desativa auto-latest
2. Variável de ambiente `ARCHIFY_HOME` — fixação explícita
3. **Managed latest** (`~/.cache/oma-diagram/archify`)
4. Diretórios de skills instalados pelo usuário: projeto `.agents` / `.claude` / `.codex` / `.cursor` / `.qwen` / `.kiro` `/skills/archify`, depois os mesmos em `~`, além de `~/.raven/workspace/skills/archify`

<!-- oma-docs:ignore-start -->
Uma ocorrência exige que a instalação archify gerenciada ou fixada contenha `bin/archify.mjs`.
<!-- oma-docs:ignore-end -->

---

## Configuração

Seção esparsa em `.agents/oma-config.yaml` (chaves ausentes usam os padrões mostrados):

```yaml
diagram:
  engine: auto                # auto | archify | mermaid
  explain_sidecar: false      # /explain also writes an archify sidecar
  archify:
    managed: true             # false = never download; use pins / skill dirs only
    channel: stable           # stable (latest GitHub Release) | main (HEAD of main)
    check_interval_min: 60    # minutes between remote checks; 0 = every call
    path: null                # explicit install dir (pin)
    quality: showcase         # showcase | standard  → --quality
    open: false               # pass --open to deliver
```

| `engine` | Comportamento |
|---|---|
| `auto` (padrão) | archify sempre que for resolvido (latest gerenciado, fixação ou diretório de skill); caso contrário, Mermaid |
| `archify` | Exige archify. `oma diagram resolve` sai com 1 quando nada for resolvido (primeira execução offline); workflows param em vez de rebaixar silenciosamente |
| `mermaid` | Nunca chama archify |

Um prompt pode substituir a configuração em uma execução (`/explain 640 with archify`).

---

## CLI

```bash
oma diagram resolve [--engine auto|archify|mermaid] [--refresh] [--offline] [--json]
oma diagram update  [--json]
oma diagram archify <archify args…>
```

`oma diagram archify` executa o executável archify resolvido com `ARCHIFY_UPDATE_CHECK_DISABLED=1` (sem rede) e propaga o código de saída, para que `validate` / `deliver` / `visual-check` se comportem exatamente como a documentação do archify descreve:

```bash
oma diagram archify guide "show the auth request lifecycle" --json
oma diagram archify validate architecture adr-auth.archify.json --quality showcase --json
oma diagram archify deliver  architecture adr-auth.archify.json adr-auth.archify.html --quality showcase --json
oma diagram archify visual-check adr-auth.archify.html --json   # exit 2 = no Chrome, reported as skipped
```

`--json` em `resolve` retorna `{ ok, requested, engine, quality, open, explainSidecar, archify?: { root, bin, version, source, status?, note? }, reason, probed }` — `source` é `managed:<tag>`, `config:…`, `env:…` ou um rótulo de diretório de skill; `status` (`fresh` / `current` / `stale`) e `note` são definidos para cópias gerenciadas.

---

## Uso pelos workflows

O protocolo compartilhado está em `.agents/skills/_shared/conditional/diagram-engine.md`. Os dois workflows seguem a mesma sequência:

1. `oma diagram resolve --json`
2. Escreva primeiro o bloco Mermaid (sempre).
3. Se `engine: archify`: traduza a topologia Mermaid para a IR JSON do archify (`architecture` / `sequence` / `dataflow` / `lifecycle` / `workflow`), lendo somente o schema correspondente e um exemplo da instalação.
4. `validate` → reparar → `deliver`. **Não há um limite fixo de iterações.** O agente continua reparando enquanto a contagem de erros objetivos do archify melhora e só para pela regra de convergência do próprio archify (duas rodadas consecutivas sem melhoria). Rótulos semânticos nunca são apagados somente para passar.
5. Vincule o HTML: nunca o incorpore.

### `/architecture`

Somente para decisões estruturais (limites, dependências e fluxo de dados). Saída ao lado do artefato Markdown em `.agents/results/architecture/`:

```
adr-notification-service.md            # Mermaid block + "Interactive:" link
adr-notification-service.archify.json  # frozen spec (kept even on failure)
adr-notification-service.archify.html  # delivered viewer
```

### `/explain`

Opt-in, porque o contrato do explainer (um único arquivo autocontido, com tema baseado em variáveis CSS) não permite incorporar um segundo documento HTML completo. Habilite com `diagram.explain_sidecar: true` ou peça isso no prompt. O sidecar `{date}-{slug}.archify.html` é derivado do diagrama primário de Sistema/Fluxo de dados do explainer e vinculado com um `<a href>` simples; uma falha do sidecar nunca impede o explainer.

---

## Modos de falha

| Situação | Resultado |
|---|---|
| A verificação de atualização falha (offline, limitada por taxa) | A cópia em cache é usada e informada como `stale` com o motivo |
| Sem cache, sem rede, sem diretório de skill, `engine: auto` | Somente Mermaid; o relatório diz para executar `oma diagram update` uma vez online |
| O mesmo, mas `engine: archify` | O workflow para (`ok: false`) com a dica `oma diagram update` |
| `validate` nunca converge | Mermaid continua sendo o diagrama entregue; o último `.archify.json` fica disponível para uma pessoa; os diagnósticos são informados literalmente |
| Chrome ausente para `visual-check` | Informado como `skipped`, nunca como aprovação |

---

## Consulte também

- [Explicador de código](/docs/guide/code-explainer) — workflow `/explain`
- [Semântica de oma-config.yaml](/docs/guide/oma-config-semantics)
- upstream archify: [tt-a1i/archify](https://github.com/tt-a1i/archify)
