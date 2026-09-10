---
title: "Hướng dẫn: Diagram Engine (archify)"
sidebar_label: Diagrams
description: Cách oh-my-agent chọn giữa Mermaid và agent skill tt-a1i/archify tùy chọn cho diagram architecture, sequence và data-flow — phần diagram config, oma diagram resolve / oma diagram archify, cách /architecture và /explain dùng nó, cùng loop validate-repair-deliver không giới hạn.
---

# Diagram Engine {#diagram-engine}

`/architecture` (ADR, recommendation, review) và `/explain` (code-change explainer) đều tạo diagram cấu trúc. Chúng luôn là **Mermaid** block trong Markdown artifact, và — bất cứ khi nào [archify](https://github.com/tt-a1i/archify) resolve được, vốn là trường hợp bình thường — thêm **interactive, validated HTML diagram** cạnh artifact: theme sáng/tối, pan-zoom, search, relationship tracing, PNG/SVG/WebM export, render từ typed JSON spec.

Mermaid không biến mất: đó là text SSOT sống trong Markdown và git diff. archify là derived artifact.

---

## archify luôn mới nhất — không cần cài đặt {#always-the-latest-archify-nothing-to-install}

archify là agent skill MIT-licensed (Node ≥ 18, không có runtime dependency). oh-my-agent không dựa vào bản bạn cài một lần; nó giữ **managed copy riêng** và theo dõi release mới nhất:

- Cache: `~/.cache/oma-diagram/archify/<tag>/` cùng pointer `state.json`.
- Trước mỗi lần dùng, `oma diagram resolve` hỏi GitHub release tag mới nhất (throttled một lần mỗi `check_interval_min`, mặc định 60 phút), tải source tarball khi có tag mới (atomic theo tag directory; tag cũ bị prune), nếu không thì dùng lại cache.
- Network failure không bao giờ fatal: dùng cached copy và báo `stale` kèm lý do. Chỉ lần chạy đầu tiên không network và không cache mới fallback sang skill copy do user cài, sau đó fallback sang Mermaid.

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

Thứ tự resolve (hit đầu tiên thắng, giống nhau ở mọi vendor runtime):

1. `diagram.archify.path` trong `oma-config.yaml` — pin rõ ràng, opt out auto-latest
2. Biến môi trường `ARCHIFY_HOME` — pin rõ ràng
3. **Managed latest** (`~/.cache/oma-diagram/archify`)
4. User-installed skill dir: project `.agents` / `.claude` / `.codex` / `.cursor` / `.qwen` / `.kiro` `/skills/archify`, sau đó cùng vị trí dưới `~`, rồi `~/.raven/workspace/skills/archify`

<!-- oma-docs:ignore-start -->
Một hit yêu cầu archify installation được managed hoặc pinned chứa `bin/archify.mjs`.
<!-- oma-docs:ignore-end -->

---

## Cấu hình {#configuration}

Sparse section trong `.agents/oma-config.yaml` (key bị bỏ qua dùng default bên dưới):

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

| `engine` | Hành vi |
|---|---|
| `auto` (mặc định) | Dùng archify khi resolve được (managed latest, pin hoặc skill dir), nếu không dùng Mermaid |
| `archify` | Bắt buộc archify. `oma diagram resolve` thoát 1 khi không resolve được gì (lần đầu offline); workflow dừng thay vì âm thầm downgrade |
| `mermaid` | Không bao giờ gọi archify |

Prompt có thể ghi đè config cho một run (`/explain 640 with archify`).

---

## CLI {#cli}

```bash
oma diagram resolve [--engine auto|archify|mermaid] [--refresh] [--offline] [--json]
oma diagram update  [--json]
oma diagram archify <archify args…>
```

`oma diagram archify` chạy resolved archify executable với `ARCHIFY_UPDATE_CHECK_DISABLED=1` (không network) và truyền exit code, nên `validate` / `deliver` / `visual-check` hoạt động đúng như archify documentation:

```bash
oma diagram archify guide "show the auth request lifecycle" --json
oma diagram archify validate architecture adr-auth.archify.json --quality showcase --json
oma diagram archify deliver  architecture adr-auth.archify.json adr-auth.archify.html --quality showcase --json
oma diagram archify visual-check adr-auth.archify.html --json   # exit 2 = no Chrome, reported as skipped
```

`--json` trên `resolve` trả `{ ok, requested, engine, quality, open, explainSidecar, archify?: { root, bin, version, source, status?, note? }, reason, probed }` — `source` là `managed:<tag>`, `config:…`, `env:…` hoặc skill-dir label; `status` (`fresh` / `current` / `stale`) và `note` được đặt cho managed copy.

---

## Workflow dùng nó thế nào {#how-the-workflows-use-it}

Protocol dùng chung nằm trong `.agents/skills/_shared/conditional/diagram-engine.md`. Cả hai workflow theo sequence:

1. `oma diagram resolve --json`
2. Author Mermaid block trước (luôn luôn).
3. Nếu `engine: archify`: dịch topology Mermaid sang archify JSON IR (`architecture` / `sequence` / `dataflow` / `lifecycle` / `workflow`), chỉ đọc schema tương ứng và một example từ installation.
4. `validate` → repair → `deliver`. **Không có iteration cap cố định.** Agent tiếp tục repair khi objective error count của archify còn cải thiện và chỉ dừng theo convergence rule của archify (hai round liên tiếp không cải thiện). Không xóa semantic label chỉ để pass.
5. Link HTML — không embed.

### `/architecture` {#architecture}

Chỉ dùng cho structural decision (boundary, dependency, data flow). Output cạnh Markdown artifact dưới `.agents/results/architecture/`:

```
adr-notification-service.md            # Mermaid block + "Interactive:" link
adr-notification-service.archify.json  # frozen spec (kept even on failure)
adr-notification-service.archify.html  # delivered viewer
```

### `/explain` {#explain}

Opt-in vì contract riêng của explainer (single self-contained file, CSS-variable theming) không cho embed HTML document đầy đủ thứ hai. Bật bằng `diagram.explain_sidecar: true` hoặc hỏi trong prompt. Sidecar `{date}-{slug}.archify.html` được derive từ System/Data-Flow diagram chính của explainer và link bằng plain `<a href>`; sidecar failure không chặn explainer.

---

## Failure mode {#failure-modes}

| Tình huống | Kết quả |
|---|---|
| Update check thất bại (offline, rate-limited) | Dùng cached copy và báo `stale` kèm lý do |
| Không cache, không network, không skill dir, `engine: auto` | Chỉ Mermaid; report nhắc chạy `oma diagram update` một lần khi online |
| Như trên nhưng `engine: archify` | Workflow dừng (`ok: false`) với hint `oma diagram update` |
| `validate` không hội tụ | Mermaid vẫn là diagram được giao; `.archify.json` cuối để lại cho người; diagnostics được báo nguyên văn |
| Thiếu Chrome cho `visual-check` | Báo `skipped`, không bao giờ coi là pass |

---

## Liên quan {#related}

- [Code Explainer](/docs/guide/code-explainer) — workflow `/explain`
- [Ngữ nghĩa oma-config.yaml](/docs/guide/oma-config-semantics)
- archify upstream: [tt-a1i/archify](https://github.com/tt-a1i/archify)
