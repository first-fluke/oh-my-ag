---
title: "Guia: Geração de imagens"
sidebar_label: Geração de imagens
description: "Guia completo da geração de imagens do oh-my-agent, com dispatch multi-vendor via Codex (gpt-image-2), Pollinations (flux/zimage, gratuito) e Antigravity por meio do Gemini Code Assist, imagens de referência, controles de custo, layout de saída, solução de problemas e padrões compartilhados de invocação."
---

# Geração de imagens

`oma-image` é o roteador multi-vendor de imagens do oh-my-agent. Ele gera imagens a partir de prompts em linguagem natural, encaminha a solicitação para a CLI do vendor em que você está autenticado e grava um manifesto ao lado da saída com as entradas e decisões do provider necessárias para auditar ou repetir uma execução. A saída de um provider em produção ainda pode variar.

A skill é ativada automaticamente por palavras-chave como *image*, *illustration*, *visual asset* e *concept art*, ou quando outra skill precisa de uma imagem como efeito colateral (hero shot, thumbnail, foto de produto).

---

## Quando usar

- Gerar imagens, ilustrações, fotos de produto, concept art e visuais para hero ou landing page
- Comparar o mesmo prompt entre vários modelos lado a lado (`--vendor all`)
- Produzir assets a partir de um workflow de edição (Claude Code, Codex, Gemini CLI)
- Permitir que outra skill (design, marketing ou docs) chame o pipeline de imagens como infraestrutura compartilhada

## Quando NÃO usar

- Editar ou retocar uma imagem existente (fora do escopo; use uma ferramenta dedicada)
- Gerar vídeos ou áudio (fora do escopo)
- Fazer composição SVG inline ou vetorial a partir de dados estruturados (use uma skill de templating)
- Apenas redimensionar ou converter formato (use uma biblioteca de imagens, não um pipeline de geração)

---

## Vendors em resumo

A skill prioriza a CLI: quando a CLI nativa de um vendor consegue devolver bytes de imagem brutos, o caminho pelo subprocesso é preferido a uma chave de API direta.

| Vendor | Estratégia | Modelos | Gatilho | Custo |
|---|---|---|---|---|
| `pollinations` | HTTP direto | Gratuitos: `flux`, `zimage`. Com créditos: `qwen-image`, `wan-image`, `gpt-image-2`, `klein`, `kontext`, `gptimage`, `gptimage-large` | `POLLINATIONS_API_KEY` definido (cadastro gratuito em https://enter.pollinations.ai) | Gratuito para `flux` / `zimage` |
| `codex` | Primeiro pela CLI via `codex exec` (OAuth do ChatGPT) | `gpt-image-2` | `codex login` (não exige chave de API) | Cobrado no seu plano do ChatGPT |
| `antigravity` | CLI `agy` usando a assinatura do Gemini Code Assist | O modelo é escolhido internamente por `agy` | `agy` instalado e conectado | Sem cobrança por imagem pelo Code Assist |

O modo de vendor integrado é `auto`: ele executa os providers aprovados pelas verificações de saúde. Os modelos `flux` e `zimage` de Pollinations são gratuitos por imagem, mas ainda exigem uma `POLLINATIONS_API_KEY`; Codex e Antigravity exigem seus próprios logins. As estimativas pagas continuam sujeitas ao controle de confirmação de custo.

---

## Início rápido

Antes da primeira geração, confira qual provider está pronto e autentique um dos caminhos aceitos:

```bash
oma image doctor

# Pollinations: create a free account and export its key.
export POLLINATIONS_API_KEY="<pollinations-key>"

# Or authenticate an alternative provider instead.
codex login
# Sign in to Gemini Code Assist for `agy` when using --vendor antigravity.
```

```bash
# Auto-selects the healthy provider; cost and auth depend on that provider.
oma image generate "minimalist sunrise over mountains"

# Run all configured vendors; every selected vendor must be healthy or the command stops.
oma image generate "cat astronaut" --vendor all

# Specific vendor + size + count, skip cost prompt
oma image generate "logo concept" --vendor codex --size 1024x1024 -n 3 -y

# Cost estimate without spending
oma image generate "test prompt" --dry-run

# Inspect authentication and install status per vendor
oma image doctor

# List registered vendors and supported models
oma image vendor list
```

`oma img` é um alias de `oma image`.

---

## Usar como skill

`oma-image` é uma skill que se ativa automaticamente a partir de linguagem natural e também pode ser invocada explicitamente. Há três pontos de entrada.

### 1. Linguagem natural (autoativação)

Dentro do Claude Code, Codex CLI ou Gemini CLI, basta descrever a imagem. A skill reconhece palavras-chave como *image*, *illustration*, *visual asset*, *concept art*, *hero shot*, *thumbnail* e *product photo*.

Você não precisa memorizar flags da CLI. Descreva o que deseja em linguagem simples e a skill mapeia isso para as opções corretas:

| Você diz | A skill infere |
|---|---|
| "use codex" / "with gpt-image-2" / "free flux" | `--vendor codex` / `--vendor pollinations` |
| "compare across vendors" / "side by side" | `--vendor all` |
| "portrait" / "landscape" / "1024×1536" | `--size 1024x1536` / `--size 1536x1024` |
| "high quality" / "draft" | `--quality high` / `--quality low` |
| "three variations" / "give me 3" | `-n 3` |
| "save to ./hero" / "output to docs/assets" | `--output-dir <dir>` |
| Imagem anexada + "make it nighttime" | `-r <attached path>` |
| "just estimate the cost" / "dry run" | `--dry-run` |

Exemplos:

> "Gere um nascer do sol minimalista sobre montanhas para o hero da landing page, em paisagem e alta qualidade."
> "Compare uma foto de produto de uma caneca de cerâmica entre todos os vendors, com três variações de cada."
> "Use codex para deixar esta foto de lontra dramática e noturna." (com uma referência anexada)

O agente executa o [Protocolo de clarificação](#clarification-protocol), amplia o prompt quando necessário e chama `oma image generate` com as flags inferidas. Use o slash command quando quiser controlar explicitamente os valores exatos das flags.

### 2. Slash command explícito

```text
/oma-image a red apple on white background
/oma-image --vendor all --size 1536x1024 jeju coastline at sunset
/oma-image -n 3 --quality high --output-dir ./hero "minimalist dashboard hero illustration"
```

Todas as flags da CLI (`--vendor`, `-n`, `--size`, `-r`, `--dry-run` e outras) funcionam no slash command e são encaminhadas ao mesmo pipeline `oma image generate`.

### 3. A partir de outra skill (infraestrutura compartilhada)

Outras skills (design, marketing e docs) chamam o pipeline como infraestrutura compartilhada com saída JSON:

```bash
oma image generate "<prompt>" --output json
```

O manifesto escrito em stdout inclui os caminhos de saída, o vendor, o modelo e o custo, o que facilita analisá-lo e encadear a próxima etapa.

---

## Referência da CLI

```bash
oma image generate "<prompt>"
  [--vendor auto|codex|pollinations|antigravity|all]
  [-n 1..5]
  [--size 1024x1024|1024x1536|1536x1024|auto]
  [--quality low|medium|high|auto]
  [--output-dir <dir>] [--allow-external-output]
  [-r <path>]...
  [--timeout 180] [-y] [--no-prompt-in-manifest]
  [--dry-run] [--output text|json]

oma image doctor
oma image vendor list
```

### Flags principais

| Flag | Finalidade |
|---|---|
| `--vendor <name>` | `auto`, `pollinations`, `codex`, `antigravity` ou `all`. Com `all`, todos os vendors solicitados precisam estar saudáveis (modo estrito). |
| `-n, --count <n>` | Número de imagens por vendor, de 1 a 5 (limite de tempo de parede). |
| `--size <size>` | Proporção: `1024x1024` (quadrada), `1024x1536` (retrato), `1536x1024` (paisagem) ou `auto`. |
| `--quality <level>` | `low`, `medium`, `high` ou `auto` (padrão do vendor). |
| `--output-dir <dir>` | Diretório de saída. O padrão é `.agents/results/images/{timestamp}/`. Caminhos fora de `$PWD` exigem `--allow-external-output`. |
| `--allow-external-output` | Permite um diretório de saída fora de `$PWD`. |
| `--model <name>` | Substitui o modelo do vendor selecionado nesta execução. `antigravity` ignora isso porque `agy` escolhe o modelo. |
| `-r, --reference <path>` | Até 10 imagens de referência (PNG/JPEG/GIF/WebP, ≤ 5 MB cada). Repetível ou separada por vírgulas. Compatível com `codex` e `antigravity`; rejeitada por `pollinations`. |
| `-y, --yes` | Ignora a confirmação de custo para execuções estimadas em pelo menos `$0.20`. Também pode ser definido por `OMA_IMAGE_YES=1`. |
| `--no-prompt-in-manifest` | Armazena o SHA-256 do prompt em vez do texto bruto em `manifest.json`. |
| `--dry-run` | Exibe o plano e a estimativa de custo sem gastar. |
| `--output text\|json` | Formato da saída da CLI. JSON é a superfície de integração para outras skills. |
| `--timeout <duration>` | Timeout por imagem. |

---

## Imagens de referência

Anexe até 10 imagens de referência para orientar estilo, identidade do sujeito ou composição.

```bash
oma image generate -r ~/Downloads/otter.jpeg "same otter in dramatic lighting" --vendor codex
oma image generate -r a.png -r b.png "blend these styles" --vendor antigravity
oma image generate -r a.png,b.png "blend these styles" --vendor antigravity
```

| Vendor | Suporte a referências | Como |
|---|---|---|
| `codex` (gpt-image-2) | Sim | Passa `-i <path>` para `codex exec` |
| `antigravity` | Sim | Copia as referências para um diretório por execução e dá acesso a elas ao `agy` |
| `pollinations` | Não | Rejeitadas com exit code 4 (exigem hospedagem por URL) |

### Onde ficam as imagens anexadas

- **Claude Code:** `~/.claude/image-cache/<session>/N.png`, exibidas nas mensagens do sistema como `[Image: source: <path>]`. O escopo é a sessão; copie para um local durável se quiser reutilizá-las depois.
- **Antigravity:** diretório de upload do workspace (a IDE mostra o caminho exato).
- **Codex CLI como host:** é preciso passar o caminho explicitamente; anexos da conversa não são encaminhados.

Quando o usuário anexa uma imagem e pede para gerar ou editar uma imagem com base nela, o agente que faz a chamada **deve** encaminhá-la usando `--reference <path>`, em vez de descrevê-la em prosa. Se a CLI local for antiga demais para oferecer suporte a `--reference`, execute `oma update` e tente novamente.

---

## Layout de saída

Toda execução grava arquivos em `.agents/results/images/`, em um diretório com timestamp e sufixo de hash:

```
.agents/results/images/
├── 20260424-143052-ab12cd/                 # single-vendor run
│   ├── pollinations-flux.jpg
│   └── manifest.json
└── 20260424-143122-7z9kqw-compare/         # --vendor all run
    ├── codex-gpt-image-2.png
    ├── pollinations-flux.jpg
    └── manifest.json
```

`manifest.json` registra o vendor, o modelo, o prompt (ou seu SHA-256), o tamanho, a qualidade e o custo, para que a solicitação possa ser auditada e repetida. Ele não força pixels idênticos de um provider ativo.

---

## Custo, segurança e cancelamento

1. **Controle de custo:** execuções estimadas em pelo menos `$0.20` pedem confirmação. Ignore com `-y` ou `OMA_IMAGE_YES=1`. O padrão `pollinations` (flux/zimage) é gratuito, portanto o prompt é automaticamente ignorado nesse caso.
2. **Segurança de caminho:** caminhos de saída fora de `$PWD` exigem `--allow-external-output` para evitar gravações inesperadas.
3. **Cancelável:** `Ctrl+C` (SIGINT/SIGTERM) aborta toda chamada de provider em andamento e o orquestrador.
4. **Registro estável da execução:** `manifest.json` é sempre escrito ao lado das imagens.
5. **Máximo de `n` = 5:** é um limite de tempo de parede, não uma cota.
6. **Códigos de saída:** alinhados a `oma search fetch`: `0` ok, `1` geral, `2` segurança, `3` não encontrado, `4` entrada inválida, `5` autenticação necessária, `6` timeout.

---

## Protocolo de clarificação {#clarification-protocol}

Antes de invocar `oma image generate`, o agente que faz a chamada executa esta lista. Se algo estiver ausente e não puder ser inferido, ele pergunta primeiro ou amplia o prompt e mostra a expansão para aprovação.

**Obrigatório:**
- **Sujeito:** qual é a coisa principal na imagem? (objeto, pessoa ou cena)
- **Cenário / plano de fundo:** onde ela está?

**Fortemente recomendado (pergunte se estiver ausente e não puder ser inferido):**
- **Estilo:** fotorrealista, ilustração, renderização 3D, pintura a óleo, concept art ou vetor flat?
- **Humor / iluminação:** claro ou sombrio, quente ou frio, dramático ou minimalista
- **Contexto de uso:** hero image, ícone, thumbnail, foto de produto ou pôster?
- **Proporção:** quadrada, retrato ou paisagem

Para um prompt curto como *"a red apple"*, o agente **não** faz perguntas de acompanhamento. Em vez disso, ele o amplia inline e mostra ao usuário:

> Usuário: "a red apple"
> Agente: "Vou gerar isto como: *a single glossy red apple centered on a clean white background, soft studio lighting, photorealistic, shallow depth of field, 1024×1024*. Posso prosseguir ou você prefere outro estilo ou composição?"

Quando o usuário redigeu um briefing criativo completo (pelo menos 2 de: sujeito + estilo + iluminação + composição), o prompt é respeitado literalmente, sem clarificação nem ampliação.

**Idioma da saída.** Os prompts de geração são enviados ao provider em inglês (os modelos de imagem são treinados predominantemente com legendas em inglês). Se o usuário escreveu em outro idioma, o agente traduz e mostra a tradução durante a ampliação para que o usuário possa corrigir uma interpretação equivocada.

---

## Configuração

- **Configuração do projeto:** a seção `image:` de `.agents/oma-config.yaml`. O legado `config/image-config.yaml` não é mais lido.
- **Variáveis de ambiente:**
  - `OMA_IMAGE_DEFAULT_VENDOR`: substitui o vendor padrão (caso contrário, `pollinations`)
  - `OMA_IMAGE_DEFAULT_OUT`: substitui o diretório de saída padrão
  - `OMA_IMAGE_YES`: `1` para ignorar a confirmação de custo
  - `POLLINATIONS_API_KEY`: necessária para o vendor pollinations (cadastro gratuito)

---

## Solução de problemas

| Sintoma | Causa provável | Correção |
|---|---|---|
| Exit code `5` (auth-required) | O vendor selecionado não está autenticado | Execute `oma image doctor` para ver qual vendor precisa de login. Depois, `codex login`, conecte-se ao `agy` ou defina `POLLINATIONS_API_KEY`. |
| Exit code `4` em `--reference` | `pollinations` rejeita referências, ou o arquivo é grande demais ou tem formato inválido | Troque para `--vendor codex` ou `--vendor antigravity`. Cada referência deve ter no máximo 5 MB e estar em PNG/JPEG/GIF/WebP. |
| `--reference` não reconhecido | A CLI local está desatualizada | Execute `oma update` e tente novamente. Não recorra a uma descrição em prosa. |
| A confirmação de custo bloqueia a automação | A execução é estimada em pelo menos `$0.20` | Passe `-y` ou defina `OMA_IMAGE_YES=1`. Melhor: troque para `pollinations` gratuito. |
| `--vendor all` aborta imediatamente | Um dos vendors solicitados não está saudável (modo estrito) | Instale ou conecte-se ao vendor ausente, ou escolha um `--vendor` específico. |
| A saída foi gravada em um diretório inesperado | O padrão é `.agents/results/images/{timestamp}/` | Passe `--output-dir <dir>`. Caminhos fora de `$PWD` precisam de `--allow-external-output`. |
| O Antigravity falha depois de passar na verificação de saúde | `agy --version` prova a instalação, não o login | Conecte-se ao Gemini Code Assist e tente novamente com `oma image doctor` e `--vendor antigravity`. |

---

## Relacionados

- [Skills](/docs/core-concepts/skills): a arquitetura de skills em duas camadas que alimenta `oma-image`
- [Comandos da CLI](/docs/cli-interfaces/commands): referência completa do comando `oma image`
- [Opções da CLI](/docs/cli-interfaces/options): matriz global de opções
