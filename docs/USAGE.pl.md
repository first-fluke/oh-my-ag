# Jak używać umiejętności Multi-Agent Antigravity

## Szybki start

1. **Otwórz w Antigravity IDE**
   ```bash
   antigravity open /path/to/oh-my-ag
   ```

2. **Umiejętności są wykrywane automatycznie.** Antigravity skanuje `.agent/skills/` i indeksuje wszystkie dostępne umiejętności.

3. **Rozmawiaj w IDE.** Opisz co chcesz zbudować.

---

## Przykłady użycia

### Przykład 1: Proste zadanie jednodomeno we

**Wpisujesz:**
```
"Utwórz komponent formularza logowania z polami email i hasło używając Tailwind CSS"
```

**Co się dzieje:**
- Antigravity wykrywa, że pasuje to do `frontend-agent`
- Umiejętność ładuje się automatycznie (Progresywne ujawnianie)
- Otrzymujesz komponent React z TypeScript, Tailwind, walidacją formularza

### Przykład 2: Złożony projekt wielodomenowy

**Wpisujesz:**
```
"Zbuduj aplikację TODO z uwierzytelnianiem użytkownika"
```

**Co się dzieje:**

1. **Workflow Guide aktywuje się** — wykrywa złożoność wielodomenową
2. **PM Agent planuje** — tworzy podział zadań z priorytetami
3. **Uruchamiasz agentów przez CLI**:
   ```bash
   oh-my-ag agent:spawn backend "API uwierzytelniania JWT" session-01 &
   oh-my-ag agent:spawn frontend "UI logowania i TODO" session-01 &
   wait
   ```
4. **Agenci pracują równolegle** — zapisują wyniki do bazy wiedzy
5. **Ty koordynujesz** — przeglądasz `.gemini/antigravity/brain/` pod kątem spójności
6. **QA Agent przegląda** — audyt bezpieczeństwa/wydajności
7. **Napraw i iteruj** — ponownie uruchom agentów z poprawkami

### Przykład 3: Naprawianie błędów

**Wpisujesz:**
```
"Jest błąd — kliknięcie logowania pokazuje 'Cannot read property map of undefined'"
```

**Co się dzieje:**

1. **debug-agent aktywuje się** — analizuje błąd
2. **Znaleziona przyczyna źródłowa** — komponent mapuje `todos` zanim dane się załadują
3. **Dostarczono poprawkę** — dodane stany ładowania i kontrole null
4. **Napisany test regresji** — zapewnia że błąd się nie powtórzy
5. **Znalezione podobne wzorce** — proaktywnie naprawia 3 inne komponenty

### Przykład 4: Równoległe wykonywanie oparte na CLI

```bash
# Pojedynczy agent (workspace wykrywany automatycznie)
oh-my-ag agent:spawn backend "Implementuj API uwierzytelniania JWT" session-01

# Równoległe agenty
oh-my-ag agent:spawn backend "Implementuj API uwierzytelniania" session-01 &
oh-my-ag agent:spawn frontend "Utwórz formularz logowania" session-01 &
oh-my-ag agent:spawn mobile "Zbuduj ekrany uwierzytelniania" session-01 &
wait
```

**Monitoruj w czasie rzeczywistym:**
```bash
# Terminal (oddzielne okno terminala)
bunx oh-my-ag dashboard

# Lub przeglądarka
bunx oh-my-ag dashboard:web
# → http://localhost:9847
```

---

## Dashboardy w czasie rzeczywistym

### Dashboard terminalowy

```bash
bunx oh-my-ag dashboard
```

Obserwuje `.serena/memories/` używając `fswatch` (macOS) lub `inotifywait` (Linux). Wyświetla tabelę na żywo ze statusem sesji, stanami agentów, turami i najnowszą aktywnością. Aktualizuje się automatycznie gdy zmieniają się pliki pamięci.

**Wymagania:**
- macOS: `brew install fswatch`
- Linux: `apt install inotify-tools`

### Dashboard webowy

```bash
npm install          # tylko za pierwszym razem
bunx oh-my-ag dashboard:web
```

Otwórz `http://localhost:9847` w przeglądarce. Funkcje:

- **Aktualizacje w czasie rzeczywistym** przez WebSocket (sterowane zdarzeniami, nie odpytywanie)
- **Auto-ponowne łączenie** jeśli połączenie zostanie przerwane
- **UI w stylu Serena** z fioletowymi kolorami akcentu
- **Status sesji** — ID i stan uruchomiony/ukończony/nieudany
- **Tabela agentów** — nazwa, status (z kolorowymi kropkami), liczba tur, opis zadania
- **Dziennik aktywności** — najnowsze zmiany z plików postępu i wyników

Serwer obserwuje `.serena/memories/` używając chokidar z debounce (100ms). Tylko zmienione pliki wyzwalają odczyty — bez pełnego ponownego skanowania.

---

## Kluczowe koncepcje

### Progresywne ujawnianie
Antigravity automatycznie dopasowuje żądania do umiejętności. Nigdy nie wybierasz umiejętności ręcznie. Tylko potrzebna umiejętność ładuje się do kontekstu.

### Projekt umiejętności zoptymalizowany tokenowo
Każda umiejętność wykorzystuje dwuwarstwową architekturę dla maksymalnej efektywności tokenowej:
- **SKILL.md** (~40 linii): Tożsamość, routing, podstawowe zasady — ładowane natychmiast
- **resources/**: Protokoły wykonania, przykłady, listy kontrolne, podręczniki błędów — ładowane na żądanie

Współdzielone zasoby znajdują się w `_shared/` (nie jest to umiejętność) i są odwoływane przez wszystkich agentów:
- Protokoły wykonania chain-of-thought z 4-etapowym przepływem pracy
- Przykłady few-shot wejście/wyjście dla wskazówek modeli średniego poziomu
- Podręczniki odzyskiwania po błędach z eskalacją "3 strikes"
- Szablony rozumowania dla ustrukturyzowanej analizy wieloetapowej
- Zarządzanie budżetem kontekstu dla poziomów modeli Flash/Pro
- Automatyczna weryfikacja przez `verify.sh`
- Akumulacja nauk z wielu sesji

### Uruchamianie agentów przez CLI
Użyj `oh-my-ag agent:spawn` aby uruchamiać agentów przez CLI. Respektuje `agent_cli_mapping` w `user-preferences.yaml` aby wybrać odpowiednie CLI (gemini, claude, codex, qwen) dla typu agenta. Workspace jest wykrywany automatycznie z typowych konwencji monorepo lub może być ustawiony jawnie z `-w`.

### Baza wiedzy
Wyniki agentów przechowywane w `.gemini/antigravity/brain/`. Zawiera plany, kod, raporty i notatki koordynacyjne.

### Pamięć Serena
Ustrukturyzowany stan runtime w `.serena/memories/`. Orchestrator zapisuje informacje o sesji, tablice zadań, postęp dla poszczególnych agentów i wyniki. Dashboardy obserwują te pliki do monitorowania.

### Przestrzenie robocze
Agenci mogą pracować w oddzielnych katalogach aby uniknąć konfliktów. Workspace jest wykrywany automatycznie z typowych konwencji monorepo:
```
./apps/api   or ./backend   → Workspace Backend Agent
./apps/web   or ./frontend  → Workspace Frontend Agent
./apps/mobile or ./mobile   → Workspace Mobile Agent
```

---

## Dostępne umiejętności

| Umiejętność | Auto-aktywuje się dla | Wynik |
|-------|-------------------|--------|
| workflow-guide | Złożonych projektów wielodomenowych | Koordynacja agentów krok po kroku |
| pm-agent | "zaplanuj to", "rozbij" | `.agent/plan.json` |
| frontend-agent | UI, komponenty, stylizacja | Komponenty React, testy |
| backend-agent | API, bazy danych, uwierzytelnianie | Endpointy API, modele, testy |
| mobile-agent | Aplikacje mobilne, iOS/Android | Ekrany Flutter, zarządzanie stanem |
| qa-agent | "sprawdź bezpieczeństwo", "audyt" | Raport QA z priorytetowymi poprawkami |
| debug-agent | Raporty błędów, komunikaty o błędach | Naprawiony kod, testy regresji |
| orchestrator | Wykonywanie pod-agentów przez CLI | Wyniki w `.agent/results/` |
| commit | "commit", "zapisz zmiany" | Commity Git (auto-podział według funkcji) |

---

## Polecenia przepływów pracy

Wpisz te w czacie Antigravity IDE aby wyzwolić przepływy pracy krok po kroku:

| Polecenie | Opis |
|---------|-------------|
| `/coordinate` | Orkiestracja multi-agentowa przez CLI z wskazówkami krok po kroku |
| `/orchestrate` | Automatyczne równoległe wykonywanie agentów przez CLI |
| `/plan` | Dekompozycja zadań PM z kontraktami API |
| `/review` | Pełny pipeline QA (bezpieczeństwo, wydajność, dostępność, jakość kodu) |
| `/debug` | Strukturalne naprawianie błędów (odtwórz → zdiagnozuj → napraw → test regresji) |

Są to oddzielne od **umiejętności** (które auto-aktywują się). Przepływy pracy dają Ci jawną kontrolę nad procesami wieloetapowymi.

---

## Typowe przepływy pracy

### Przepływ pracy A: Pojedyncza umiejętność

```
Ty: "Utwórz komponent przycisku"
  → Antigravity ładuje frontend-agent
  → Otrzymujesz komponent natychmiast
```

### Przepływ pracy B: Projekt multi-agentowy (Auto)

```
Ty: "Zbuduj aplikację TODO z uwierzytelnianiem"
  → workflow-guide aktywuje się automatycznie
  → PM Agent tworzy plan
  → Uruchamiasz agentów przez CLI (oh-my-ag agent:spawn)
  → Agenci pracują równolegle
  → QA Agent przegląda
  → Naprawiaj problemy, iteruj
```

### Przepływ pracy B-2: Projekt multi-agentowy (Jawny)

```
Ty: /coordinate
  → Przepływ pracy krok po kroku z przewodnikiem
  → Planowanie PM → przegląd planu → uruchamianie agentów → monitorowanie → przegląd QA
```

### Przepływ pracy C: Naprawianie błędów

```
Ty: "Przycisk logowania rzuca TypeError"
  → debug-agent aktywuje się
  → Analiza przyczyny źródłowej
  → Poprawka + test regresji
  → Sprawdzone podobne wzorce
```

### Przepływ pracy D: Orkiestracja CLI z dashboardem

```
Terminal 1: bunx oh-my-ag dashboard:web
Terminal 2: oh-my-ag agent:spawn backend "zadanie" session-01 &
            oh-my-ag agent:spawn frontend "zadanie" session-01 &
Przeglądarka: http://localhost:9847 → status w czasie rzeczywistym
```

---

## Wskazówki

1. **Bądź konkretny** — "Zbuduj aplikację TODO z uwierzytelnianiem JWT, frontendem React, backendem FastAPI" jest lepsze niż "zrób aplikację"
2. **Użyj uruchamiania przez CLI** dla projektów wielodomenowych — nie próbuj robić wszystkiego w jednym czacie
3. **Przeglądaj bazę wiedzy** — sprawdź `.gemini/antigravity/brain/` pod kątem spójności API
4. **Iteruj z ponownymi uruchomieniami** — udoskonalaj instrukcje, nie zaczynaj od nowa
5. **Używaj dashboardów** — `bunx oh-my-ag dashboard` lub `bunx oh-my-ag dashboard:web` do monitorowania sesji orchestratora
6. **Oddzielne przestrzenie robocze** — przypisz każdemu agentowi własny katalog

---

## Rozwiązywanie problemów

| Problem | Rozwiązanie |
|---------|----------|
| Umiejętności nie ładują się | `antigravity open .`, sprawdź `.agent/skills/`, zrestartuj IDE |
| CLI nie znalezione | Sprawdź `which gemini` / `which claude`, zainstaluj brakujące CLI |
| Niekompatybilne wyniki agentów | Przejrzyj oba w bazie wiedzy, uruchom ponownie z poprawkami |
| Dashboard: "No agents" | Pliki pamięci nie utworzone jeszcze, najpierw uruchom orchestrator |
| Dashboard webowy nie uruchamia się | Uruchom `npm install` aby zainstalować chokidar i ws |
| fswatch nie znaleziony | macOS: `brew install fswatch`, Linux: `apt install inotify-tools` |
| Raport QA ma 50+ problemów | Skup się najpierw na CRITICAL/HIGH, udokumentuj resztę na później |

---

## Polecenia CLI

```bash
bunx oh-my-ag                # Interaktywny instalator umiejętności
bunx oh-my-ag doctor         # Sprawdź konfigurację i napraw brakujące umiejętności
bunx oh-my-ag doctor --json  # Wyjście JSON dla CI/CD
bunx oh-my-ag update         # Zaktualizuj umiejętności do najnowszej wersji
bunx oh-my-ag stats          # Wyświetl metryki produktywności
bunx oh-my-ag stats --reset  # Resetuj metryki
bunx oh-my-ag retro          # Retrospektywa sesji (nauki i kolejne kroki)
bunx oh-my-ag dashboard      # Dashboard terminalowy w czasie rzeczywistym
bunx oh-my-ag dashboard:web  # Dashboard webowy (http://localhost:9847)
bunx oh-my-ag help           # Pokaż pomoc
```

---

## Dla deweloperów (Przewodnik integracji)

Jeśli chcesz zintegrować te umiejętności z istniejącym projektem Antigravity, zobacz [AGENT_GUIDE.md](../AGENT_GUIDE.md) dla:
- Szybka 3-etapowa integracja
- Pełna integracja dashboardu
- Dostosowywanie umiejętności do Twojego stosu technologicznego
- Rozwiązywanie problemów i najlepsze praktyki

---

**Po prostu rozmawiaj w Antigravity IDE.** Do monitorowania użyj dashboardów. Do wykonywania przez CLI użyj skryptów orchestratora. Aby zintegrować z istniejącym projektem, zobacz [AGENT_GUIDE.md](../AGENT_GUIDE.md).
