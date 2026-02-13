---
title: Przepływy pracy
description: Jawne przepływy pracy oparte na komendach slash i kiedy ich używać.
---

# Przepływy pracy

## Komendy przepływów pracy

- `/coordinate`
- `/orchestrate`
- `/plan`
- `/review`
- `/debug`

## Umiejętności a przepływy pracy

- Umiejętności: aktywowane automatycznie na podstawie intencji żądania
- Przepływy pracy: jawne wieloetapowe potoki uruchamiane przez użytkownika

## Typowa sekwencja wieloagentowa

1. `/plan` do dekompozycji
2. `/coordinate` do etapowego wykonania
3. `agent:spawn` do równoległych podagentów
4. `/review` do bramki QA
