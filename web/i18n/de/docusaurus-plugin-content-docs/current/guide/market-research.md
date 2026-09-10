---
title: "Anleitung: Marktforschung (last30days-Engine)"
sidebar_label: Marktforschung
description: So führt der oma-market-Skill eine Recherche von Community-Signalen mit der Upstream-Engine mvanhorn/last30days aus, die automatisch auf dem neuesten Release gehalten wird — mit Markt-Konfiguration, oma market resolve / update / run, detect-trap-Sperre, Zuordnung von Intentionen zu Frameworks und Fehlerfällen.
---

# Marktforschung

`oma-market` beantwortet die Frage „Was sagen Menschen in den letzten N Tagen tatsächlich über X?“ — mit Schmerzpunkten, Trends, Wettbewerber-Sentiment und Discovery aus Community-Quellen mit echten Interaktionszahlen: Reddit (Upvotes und Top-Kommentare), X, YouTube-Transkripte, TikTok, Instagram, Hacker News, Polymarket, GitHub, arXiv, Techmeme, Digg, LinkedIn, StockTwits, Bluesky, das Web und weitere Quellen.

Die Recherche läuft auf der Upstream-[**last30days**](https://github.com/mvanhorn/last30days-skill)-Engine (MIT, Python 3.12+). oh-my-agent forkt sie nicht: Es hält eine **immer aktuelle verwaltete Kopie** vor, führt vor jedem Lauf Gates aus und ergänzt eine strategische Framework-Schicht. Release-Rhythmus, Star-Zahl und Provider-Abdeckung gehören zum Upstream-Projekt und können sich ändern.

---

## Immer die neueste Engine — nichts zu installieren

```bash
# Illustrative output; the release tag, cache path, and Python version vary.
oma market resolve
# engine:   last30days
# reason:   last30days 3.21.1 via managed:v3.21.1 (current)
# root:     ~/.cache/oma-market/last30days/v3.21.1
# skill:    ~/.cache/oma-market/last30days/v3.21.1/SKILL.md
# python:   python3.14 (3.14.7, PATH)
# save_dir: <workspace>/.agents/results/market/raw
```

- Cache: `~/.cache/oma-market/last30days/<tag>/` sowie `state.json`.
- Vor jeder Nutzung fragt `resolve` GitHub nach dem neuesten Release (höchstens einmal pro `check_interval_min`, standardmäßig 60 Minuten), lädt ein neueres Tag in ein eigenes Verzeichnis herunter (ältere Tags werden entfernt) und verwendet ansonsten den Cache weiter. Bei Netzwerkfehlern wird die gecachte Kopie verwendet und `stale` gemeldet.
- Python: `LAST30DAYS_PYTHON` → `market.python` → `python3.14 … python3` aus dem PATH (mindestens 3.12) → `uv python find '>=3.12'`. Wenn keine Version gefunden wird, ist `resolve` nicht erfolgreich und gibt einen Installationshinweis aus; der Skill beendet sich, statt auf reine Websuche zurückzufallen.
- Engine-Konfiguration und API-Schlüssel liegen in `~/.config/last30days/` (vom Upstream-Einrichtungsassistenten mit Ihrer Zustimmung geschrieben) und bleiben daher bei Engine-Upgrades erhalten.

Auflösungsreihenfolge (der erste Treffer gewinnt): `market.path` → `LAST30DAYS_HOME` → **verwaltete neueste Version** → benutzerinstallierte Kopien (`.agents|.claude|.codex|.cursor|.qwen|.kiro/skills/last30days` im Projekt und unter `~`, danach der Claude-Code-Plugin-Cache).

```bash
oma market update            # force a check / download now
oma market resolve --offline # never touch the network
oma market run --help        # the engine's own flags
```

---

## Konfiguration

```yaml
market:
  managed: true                   # false = never download; pins / skill dirs only
  channel: stable                 # stable (latest Release) | main (HEAD)
  check_interval_min: 60          # 0 = check on every call
  path: null                      # explicit engine dir (pin)
  python: null                    # interpreter override
  save_dir: .agents/results/market/raw
```

---

## So läuft ein Durchgang ab

1. `oma market detect-trap "<topic>"` — verweigert Keyword-Trap- und demografische Shopping-Themen (Exit 2) und schlägt eine neue Formulierung vor.
2. `oma market resolve --json` — Engine und Python; bei `ok: false` wird angehalten.
3. Der Agent liest die `SKILL.md` der aufgelösten Engine vollständig und folgt ihr: Einrichtungsassistent beim ersten Lauf, Auflösung von Handles/Subreddits/Hashtags vor der Recherche (wenn WebSearch verfügbar ist), Query-Planung und das Precondition-Gate.
4. `oma market run "<topic>" <flags> --emit=compact` — identische Argumente wie beim Upstream-Aufruf `python3 scripts/last30days.py`; `--save-dir` wird aus `market.save_dir` ergänzt.
5. Die Synthese folgt dem Upstream-OUTPUT-CONTRACT (Badge in der ersten Zeile, nach Rang geordnete Evidenzcluster, LAWs 1–8). Anschließend ergänzt oma Framework-Abschnitte, die ausschließlich auf Engine-Cluster verweisen:

| Intention | Aufbereitung durch die Engine | Frameworks |
|---|---|---|
| Schmerzpunkt | Beschwerdeorientiertes Thema, `--days 30`, bei dünner Datenlage `--deep` | SWOT |
| Trend | `--days 7/30/90/180`, `--discover "<domain>"` für „Was ist angesagt?“ | SWOT |
| Wettbewerber | `"A vs B"` → Upstream-Vergleichsablauf | SWOT + Porter's 5F |
| Discovery | `--discover`, danach Folgeabfragen mit `--drill` | SWOT + PESTEL |

6. Selbstprüfung; anschließend wird `.agents/results/market/{topic-slug}-{YYYYMMDD}.md` geschrieben.

---

## Fehlerfälle

| Situation | Ergebnis |
|---|---|
| Thema von detect-trap abgelehnt | Neue Formulierung wird angezeigt; die Engine läuft nicht. `--force` erst nach ausdrücklicher erneuter Bestätigung des Benutzers verwenden. |
| Keine Engine im Cache und offline | `ok: false` → einmal online `oma market update` ausführen. |
| Kein Python 3.12+ | `ok: false` mit Installationshinweis (brew / apt / `uv python install 3.12`); kein Ersatz durch reine Websuche. |
| Release-Prüfung schlägt fehl | Die gecachte Engine wird verwendet und als `stale` gemeldet. |
| Quellen ohne Schlüssel | Werden innerhalb der Engine übersprungen und im Footer aufgeführt; über den Upstream-Einrichtungsassistenten aktivieren. |

---

## Verwandte Seiten

- [Diagramm-Engine](/docs/guide/diagram-engine) — dasselbe Muster mit einer verwalteten aktuellen Version für archify
- [Semantik von oma-config.yaml](/docs/guide/oma-config-semantics)
- Upstream: [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)
