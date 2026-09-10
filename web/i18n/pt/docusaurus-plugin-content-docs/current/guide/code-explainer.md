---
title: "Guia: Explicador de código"
sidebar_label: Explicadores de código
description: Guia completo do workflow /explain do oh-my-agent e da skill oma-explanation — transforma um diff, PR, branch ou intervalo de commits em um documento HTML interativo autocontido com as seções Background, Intuition, Code e Quiz, cobrindo resolução de referências, níveis de leitor, gates de segredos, checklist de validação e casos-limite.
---

# Explicador de código

`/explain` transforma uma alteração de código em um documento HTML rico e autocontido que ensina o que mudou e por quê: contexto profundo opcional para iniciantes, uma seção de intuição central com dados de brinquedo, um walkthrough de código ordenado para compreensão e um quiz de cinco perguntas. A saída é um único arquivo `.html` que funciona offline, com diagramas, destaques e um quiz acessível, salvo em `.agents/results/explain/` e validado contra um checklist determinístico antes da entrega.

`/explain` funciona somente como slash command: não é ativado automaticamente pela linguagem natural. “explain” é vocabulário cotidiano, por isso é intencionalmente excluído da detecção de palavras-chave (o mesmo precedente de `/convert`). Diga `/explain` explicitamente ou peça a outra skill para produzir um “documento explicativo” como saída delegada.

---

## Quando usar

- Explicar um PR, branch, intervalo de commits ou alteração atual staged/unstaged como documento
- Integrar uma pessoa da equipe a uma alteração que ela não escreveu
- Produzir um artefato didático revisável depois que uma alteração grande ou sutil entrar

## Quando NÃO usar

- *Vídeo* explicativo narrado → use [`oma-video`](/docs/guide/video-generation) (modo explainer); `/explain` produz um documento HTML, não um vídeo
- Verificar se a documentação ainda corresponde à base de código → use `oma-docs` (detecção de drift)
- Deck de apresentação / slides → use `oma-slide` (contrato de deck fixo em 1920×1080)
- Encontrar defeitos ou emitir veredictos de revisão → use `/review` / `code-review`; `/explain` narra uma alteração didaticamente, não a avalia

---

## Início rápido

```text
/explain
/explain 640
/explain a1b2c3d..e5f6a7b
/explain payments-refactor for reviewer
```

A referência-alvo é resolvida a partir da formulação:

| Você digita | Resolução do alvo | Nível do leitor |
|----------|--------------------|--------------|
| `/explain` | Alterações staged (`git diff --cached`), com fallback para a árvore de trabalho suja | `onboarding` |
| `/explain 640`, `/explain #640` | PR #640 via `gh pr diff` | `onboarding` |
| `/explain a..b` | Intervalo SHA `a..b` (ou `a...b`) | `onboarding` |
| `/explain feature-branch for reviewer` | `git diff main...feature-branch` | `reviewer` |

Se nenhuma referência explícita for informada e tanto as alterações staged quanto a árvore de trabalho suja estiverem vazias, a resolução recorre a `HEAD~1..HEAD`.

---

## Ordem de resolução das referências

1. **Argumento explícito** — um número de PR (`#640`), nome de branch ou intervalo SHA (`a..b` / `a...b`)
2. **Alterações staged** — `git diff --cached`
3. **Árvore de trabalho suja** — `git diff`
4. **Fallback** — `HEAD~1..HEAD`

Um diff vazio ou uma referência não resolvível interrompe o workflow; ele oferece commits recentes como candidatos, em vez de adivinhar uma alternativa.

---

## Níveis de leitura

| Nível | Efeito |
|-------|--------|
| `onboarding` (padrão) | Contexto profundo completo (Tier A), para quem não conhece o sistema ao redor |
| `reviewer` | Condensa a camada de contexto profundo; as seções Intuition e Code permanecem completas |

Solicite `reviewer` adicionando “for reviewer” ao comando, como em `/explain feature-branch for reviewer`.

---

## Conteúdo do documento

Todo explainer é uma única página longa com rolagem (sem abas e sem navegação multipágina), com um índice seguido de quatro seções fixas, nesta ordem:

1. **Background** — Tier A (contexto profundo de sistema/arquitetura, marcado como “ignorável se você já conhece o sistema”) e Tier B (contexto restrito a esta alteração)
2. **Intuition** — a essência da alteração com exemplos obrigatórios de dados de brinquedo, reforçada por 2–3 famílias de diagramas reutilizadas (mock simplificado de UI, diagrama de sistema/fluxo de dados com dados de exemplo, estado antes/depois) renderizadas apenas como HTML/SVG inline — sem arte ASCII
3. **Code** — walkthrough agrupado para compreensão humana (não em ordem alfabética nem na ordem do diff), referenciando código por meio de `file:line`
4. **Quiz** — 5 perguntas por padrão (parametrizável), cada uma voltada a um aspecto distinto da alteração, com distratores plausíveis e texto de feedback em todas as opções (certas e erradas)

A prosa e o conteúdo do quiz são escritos no idioma de saída solicitado (idioma do prompt → `.agents/oma-config.yaml` `language` → inglês); código, identificadores e inline code permanecem em inglês conforme as regras de i18n. O contrato completo de conteúdo está em `.agents/skills/oma-explanation/resources/document-structure.md`.

---

## Contrato HTML

O arquivo gerado deve abrir corretamente offline via `file://` com **zero carregamentos de recursos externos**: sem scripts/stylesheets de CDN, webfonts ou imagens externas (somente SVG inline ou data URIs). Âncoras de hyperlink (`<a href="https://...">`) são permitidas; a proibição cobre somente o *carregamento* de recursos.

- Blocos de código usam `<pre>`; qualquer container customizado declara `white-space: pre-wrap`. Não use bibliotecas externas de syntax highlighting.
- Pilha de fontes: `local()` Pretendard primeiro (para CJK), depois fontes CJK do sistema e, por fim, `system-ui`.
- Responsivo a partir de 375px, contraste WCAG AA nos temas claro e escuro, suporte a `prefers-color-scheme: dark` e respeito a `prefers-reduced-motion`.
- O quiz é JavaScript vanilla: opções como elementos `<button>`, feedback imediato de certo/errado anunciado por uma região `aria-live="polite"`, respostas corretas distribuídas aleatoriamente entre posições, resumo de pontuação final e navegação completa por teclado.

Especificação comportamental completa: `.agents/skills/oma-explanation/resources/html-contract.md`.

---

## Segredos e defesa contra injeção de prompt

O conteúdo do diff e as descrições de PR são tratados estritamente como **dados**: quaisquer instruções incorporadas à alteração explicada são ignoradas.

Os segredos passam por dois gates:

1. **Pré-geração:** o diff coletado é verificado antes de qualquer autoria.
2. **Pós-geração:** o HTML final também é verificado, pois a prosa de contexto pode citar arquivos inalterados que uma verificação apenas do diff não encontraria.

Ao detectar qualquer ocorrência, a geração para imediatamente, somente os locais mascarados são informados (nunca o valor real) e uma continuação com conteúdo redigido exige confirmação explícita.

---

## Checklist de validação

Depois da geração, um checklist baseado em grep é executado contra o arquivo de saída: nenhuma referência a carregamento de recursos externos, conformidade de `pre`/`pre-wrap` em containers de código, presença do script do quiz, formato de nome `{YYYY-MM-DD}-{slug}.html` (data em Asia/Seoul) e verificação final de segredos no HTML. Em caso de falha, o loop corrige e valida novamente até **3 iterações**, depois para e mostra os itens restantes em vez de entregar silenciosamente.

Esta é uma restrição da v1: a validação é baseada em grep/arquivo e verifica somente a *presença* do script do quiz (não sua correção comportamental completa). Use um navegador (ou o MCP chrome-devtools) para exercitar manualmente o quiz quando o comportamento for importante.

Você pode validar um artefato existente com o comando de CLI registrado:

```bash
oma explain validate .agents/results/explain/2026-09-09-payment-refactor.html
oma explain validate --input-dir .agents/results/explain --output json
```

A primeira forma verifica um arquivo HTML. A forma de diretório verifica todos os relatórios em um diretório e retorna um relatório legível por máquina. Use `--report-file <path>` (a grafia legada é `--out-file`) para persistir o relatório JSON. Uma saída diferente de zero significa que pelo menos um artefato falhou nas verificações determinísticas; ela não inspeciona a precisão didática da prosa nem das respostas do quiz.

---

## Saída

```
.agents/results/explain/{YYYY-MM-DD}-{slug}.html
```

A data é localizada em Asia/Seoul. Executar novamente a mesma combinação de data + slug sobrescreve o arquivo anterior; preservar uma execução anterior é sua responsabilidade. Depois que a validação passa, o workflow tenta executar `open <path>` (somente aviso; em um ambiente headless ou sem `open` ele apenas informa o caminho) e relata um TL;DR junto do caminho do arquivo.

---

## Sidecar archify opcional

Quando `diagram.explain_sidecar: true` está definido em `oma-config.yaml` ou você o solicita (`/explain 640 with archify`), `/explain` também deriva um `{date}-{slug}.archify.html` interativo do diagrama de fluxo principal do explainer e o vincula por uma âncora simples. Ele nunca é incorporado: o explainer continua sendo um único arquivo autocontido; uma falha do sidecar nunca impede a entrega. Consulte [Diagram Engine](/docs/guide/diagram-engine).

## Casos-limite

| Situação | Comportamento |
|-----------|----------|
| Diff vazio / referência não resolvível | Para, oferece commits recentes como candidatos e nunca adivinha outra referência |
| Diff grande demais | Exclui automaticamente lockfiles/arquivos gerados, agrupa o restante por arquivo e lista as exclusões no rodapé de proveniência |
| Diff somente binário ou gerado | Para: não há nada que possa ser explicado |
| CLI `gh` ausente ou não autenticada (referência de PR) | Orientação de instalação/autenticação e alternativa de diff de branch local |
| Merge/rebase em andamento | Para: worktree instável |
| Diretório que não é Git | Para imediatamente |
| Validação falha após 3 loops de correção | Para e mostra os itens que falharam no checklist |
| `open` falha / ambiente headless | Somente aviso: o caminho informado é suficiente |

---

## Consulte também

- [Workflow `/explain`](/docs/core-concepts/workflows) — pipeline de resolução de referências → coleta → gate de segredos → geração → validação → entrega
- [Geração de vídeo](/docs/guide/video-generation) — o *modo* explainer de `oma-video` produz um vídeo narrado em vez de um documento HTML
