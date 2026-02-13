---
title: "Caso de Uso: Skill Única"
description: Caminho rápido para trabalho focado em um único domínio com escopo claro e ciclos de feedback rápidos.
---

# Caso de Uso: Skill Única

## Quando usar este caminho

Use quando a saída tem escopo restrito e é principalmente de propriedade de um domínio:

- um componente de UI
- um endpoint de API
- um bug em uma camada
- uma refatoração em um módulo

Se a tarefa exigir coordenação entre domínios (contrato de API + UI + QA), use [`Projeto Multi-Agente`](./multi-agent-project.md).

## Checklist pré-execução

Antes de fazer o prompt, defina:

1. saída exata (arquivo ou comportamento)
2. stack alvo e versões
3. critérios de aceite
4. expectativas de testes

## Template de prompt

```text
Build <specific artifact> using <stack>.
Constraints: <style/perf/security constraints>.
Acceptance criteria:
1) ...
2) ...
Add tests for: <critical cases>.
```

## Exemplo de prompt

```text
Create a login form component in React + TypeScript + Tailwind CSS.
Constraints: accessible labels, client-side validation, no external form library.
Acceptance criteria:
1) email and password validation messages
2) disabled submit while invalid
3) keyboard and screen-reader friendly
Add unit tests for valid/invalid submit paths.
```

## Fluxo de execução esperado

1. A skill relevante é selecionada automaticamente.
2. O agente propõe implementação e premissas.
3. Você confirma ou ajusta as premissas.
4. O agente entrega código e testes.
5. Você executa a verificação local e solicita pequenos ajustes.

## Portão de qualidade antes do merge

- comportamento corresponde aos critérios de aceite
- testes cobrem o caminho feliz e os principais casos extremos
- nenhuma alteração em arquivos não relacionados
- nenhuma mudança oculta que quebre módulos compartilhados

## Sinais de escalação

Mude para o fluxo multi-agente quando:

- o trabalho de UI exigir novos contratos de API
- uma correção criar mudanças em cascata entre camadas
- o escopo crescer além de um domínio após a primeira iteração

## Critérios de conclusão

A execução de skill única está concluída quando:

- o artefato alvo está implementado
- os critérios de aceite são demonstravelmente satisfeitos
- os testes são adicionados ou atualizados para o comportamento alterado
