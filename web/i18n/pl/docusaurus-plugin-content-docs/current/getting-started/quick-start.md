---
title: Szybki start
description: Najkrótsza droga od pustego projektu do sprawdzonego promptu oh-my-agent, wraz z oczekiwanymi wynikami i krokami odzyskiwania.
---

# Szybki start

Użyj tej strony, gdy chcesz sprawdzić działanie harnessu przed przeczytaniem pełnej dokumentacji. Potrzebujesz katalogu projektu oraz co najmniej jednego obsługiwanego CLI AI lub IDE. Instalator może skonfigurować `bun`, `uv`, Serenę i CUE na macOS, Linuxie lub Windowsie; wybrana integracja hosta jest wymagana przy pierwszym prompcie, natomiast integracje dostawców i przeglądarki są opcjonalne.

## 1. Zainstaluj harness projektu

W katalogu projektu uruchom instalator początkowy:

```bash
curl -fsSL https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.sh | bash
```

W Windows PowerShell uruchom:

```powershell
irm https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.ps1 | iex
```

Interaktywna konfiguracja pyta o język odpowiedzi, dostawców CLI, dostawców możliwości, preset modelu, preset umiejętności projektu oraz ewentualny wariant stosu. Przy pierwszym uruchomieniu zachowaj wartości domyślne, wybierz używanego dostawcę i preset projektu najbardziej zbliżony do repozytorium.

Jeśli masz już `bun`, uruchom instalator bezpośrednio:

```bash
bunx oh-my-agent@latest
```

Skrypty początkowe instalują się w bieżącym projekcie. Użyj `oma install --global`, gdy potrzebujesz instalacji na poziomie HOME; przed łączeniem instalacji projektowej i globalnej przeczytaj [Instalację](./installation.md).

## 2. Sprawdź wynik

Uruchom kontrolę stanu z tego samego katalogu projektu:

```bash
oma doctor
```

Sukces oznacza, że wybrana integracja dostawcy i pliki `.agents/` są gotowe. Opcjonalne integracje MCP, przeglądarki, pamięci lub inteligencji kodu mogą pojawić się jako ostrzeżenia; są potrzebne tylko przy zadaniach, które z nich korzystają. Użyj `oma doctor --profile`, aby sprawdzić rozstrzygnięty model i CLI dla każdej kanonicznej roli agenta.

Jeśli brakuje polecenia, CLI zostało zainstalowane poza bieżącym `PATH`; otwórz nową powłokę albo dodaj katalog binarny menedżera pakietów. Jeśli `oma doctor` zgłosi nieprawidłową konfigurację, popraw wskazane pole i uruchom polecenie ponownie. Nie usuwaj `.agents/oma-config.yaml` w ramach odzyskiwania: to konfiguracja należąca do użytkownika, która zachowuje ustawienia podczas aktualizacji.

## 3. Uruchom jedno małe zadanie

Otwórz repozytorium w skonfigurowanym narzędziu AI i opisz jedną samodzielną zmianę:

```text
Add a validation message to the existing email field. Follow the project's current form and test conventions. Done when the invalid-email case is covered by a focused test.
```

Gdy hook słów kluczowych jest włączony dla wybranego hosta, może uruchomić pasujący workflow. Routing umiejętności wykonuje host albo wybrany workflow, więc dowolny prompt hosta nie gwarantuje hooka, konkretnej umiejętności ani `CHARTER_CHECK`. Kontrakt wykonania powinien mimo to sprawdzić konwencje repozytorium, wprowadzić wyłącznie zmianę w wyznaczonym zakresie i zgłosić jej weryfikację. Dokładne pliki i polecenie zależą od projektu; powyższy prompt jest przykładowy.

Dla zadania przekraczającego granice API i UI wybierz jawnie `/work` albo `/orchestrate`. Dla jednej domeny przejdź do [Wykonania pojedynczej umiejętności](../guide/single-skill.md). [Przewodnik użycia](../guide/usage.md) zawiera dłuższe przykłady.

## 4. Poznaj wartości domyślne przed skalowaniem

OMA rozpoczyna z `model_preset: auto`, Sereną do inteligencji kodu, Agent Memory do pamięci semantycznej, natywnym wyszukiwaniem w sieci i wyłączoną telemetrią. Serena używa współdzielonego transportu `bridge` i automatycznie się aktualizuje, chyba że skonfigurujesz inaczej. Browser DevTools MCP jest opcjonalny; nowa konfiguracja interaktywna najpierw oferuje Aside. Skutki tych ustawień i klucze nadpisywania opisano w [Ważnych wartościach domyślnych](./important-defaults.md).

Jeśli zarządzane zadanie utknie, zacznij od `oma agent status <session-id> [agent-id]`, a następnie sprawdź jego pokwitowanie w `.agents/state/agent-runs/` oraz wstrzykniętą ścieżkę ustrukturyzowanego zgłoszenia. Rekordy te pokazują uruchomienie, zadanie, workspace, kod wyjścia i status weryfikacji. Czytelne dla człowieka pliki `result-*.md` i `progress-*.md` w `.agents/state/memories/` dodają kontekst, gdy są dostępne. Ponów tylko najmniejsze nieudane polecenie po potwierdzeniu, że uruchomienie nie jest już aktywne. Trwały workflow pozostaje aktywny do ukończenia albo do chwili wypowiedzenia `workflow done`; odzyskiwanie z pliku stanu opisano w [Workflowach](../core-concepts/workflows.md#persistent-mode-mechanics).

## Następne kroki

- [Ważne wartości domyślne](./important-defaults.md) — priorytety, dostawcy i sposoby odzyskiwania
- [Instalacja](./installation.md) — presety, konfiguracja dostawców, instalacje globalne i aktualizacje
- [Agenci](../core-concepts/agents.md) — 33 pakiety umiejętności i role dispatchu
- [Workflowy](../core-concepts/workflows.md) — planowanie, wykonanie równoległe, QA i tryby trwałe
