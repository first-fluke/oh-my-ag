---
title: "Hướng dẫn: Sinh ảnh"
sidebar_label: Sinh ảnh
description: Hướng dẫn đầy đủ về sinh ảnh trong oh-my-agent, gồm điều phối nhiều vendor qua Codex, Pollinations và Antigravity qua Gemini Code Assist, ảnh tham chiếu, guardrail chi phí, layout đầu ra, troubleshooting và pattern gọi dùng chung.
---

# Sinh ảnh

`oma-image` là router ảnh nhiều vendor của oh-my-agent. Nó sinh ảnh từ prompt ngôn ngữ tự nhiên, dispatch tới CLI vendor mà bạn đã xác thực và ghi manifest cạnh output với input cùng quyết định provider cần để audit hoặc lặp lại run. Output provider live vẫn có thể thay đổi.

Skill tự kích hoạt với từ khóa như *image*, *illustration*, *visual asset*, *concept art*, hoặc khi skill khác cần ảnh như một side-effect, chẳng hạn hero shot, thumbnail hay product photo.

---

## Khi nào dùng

- Sinh image, illustration, product photo, concept art hoặc visual hero/landing.
- So sánh cùng một prompt qua nhiều model song song (`--vendor all`).
- Tạo asset bên trong editor workflow, như Claude Code, Codex hoặc Gemini CLI.
- Cho skill khác, như design, marketing hoặc docs, gọi image pipeline như shared infrastructure.

## Khi nào KHÔNG dùng

- Chỉnh sửa hoặc retouch ảnh có sẵn, vì ngoài phạm vi; dùng tool chuyên dụng.
- Sinh video hoặc audio, vì ngoài phạm vi.
- Tạo inline SVG hoặc vector composition từ structured data; dùng skill templating.
- Resize hoặc đổi format đơn giản; dùng image library thay cho generation pipeline.

---

## Tổng quan vendor

Skill ưu tiên CLI: khi CLI native của vendor có thể trả raw image bytes, đường subprocess được ưu tiên hơn API key trực tiếp.

| Vendor | Strategy | Models | Trigger | Chi phí |
|---|---|---|---|---|
| `pollinations` | Direct HTTP | Free: `flux`, `zimage`. Credit-gated: `qwen-image`, `wan-image`, `gpt-image-2`, `klein`, `kontext`, `gptimage`, `gptimage-large` | Đã đặt `POLLINATIONS_API_KEY` (đăng ký miễn phí tại https://enter.pollinations.ai) | Miễn phí với `flux` / `zimage` |
| `codex` | CLI-first qua `codex exec` (ChatGPT OAuth) | `gpt-image-2` | `codex login`, không cần API key | Tính vào gói ChatGPT |
| `antigravity` | CLI `agy` qua thuê bao Gemini Code Assist | Model do `agy` chọn nội bộ | Đã cài và đăng nhập `agy` | Không tính phí từng ảnh qua Code Assist |

Mode vendor tích hợp sẵn là `auto`: nó chạy provider vượt health check. Model `flux` và `zimage` của Pollinations miễn phí theo ảnh nhưng vẫn cần `POLLINATIONS_API_KEY`; Codex và Antigravity cần đăng nhập riêng. Ước tính có phí vẫn dùng guardrail xác nhận chi phí.

---

## Bắt đầu nhanh

Trước lần sinh đầu tiên, kiểm tra provider sẵn sàng và xác thực một path được hỗ trợ:

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


`oma img` là alias của `oma image`.

---

## Dùng như một skill

`oma-image` là skill tự kích hoạt từ ngôn ngữ tự nhiên và cũng có thể gọi tường minh. Có ba entry point.

### 1. Ngôn ngữ tự nhiên (tự kích hoạt)

Trong Claude Code, Codex CLI hoặc Gemini CLI, chỉ cần mô tả ảnh. Skill khớp các từ khóa như *image*, *illustration*, *visual asset*, *concept art*, *hero shot*, *thumbnail* và *product photo*.

Không cần nhớ CLI flag. Nói bằng ngôn ngữ tự nhiên, skill sẽ ánh xạ sang option phù hợp:

| Bạn nói | Skill suy luận |
|---|---|
| “use codex” / “with gpt-image-2” / “free flux” | `--vendor codex` / `--vendor pollinations` |
| “compare across vendors” / “side by side” | `--vendor all` |
| “portrait” / “landscape” / “1024×1536” | `--size 1024x1536` / `--size 1536x1024` |
| “high quality” / “draft” | `--quality high` / `--quality low` |
| “three variations” / “give me 3” | `-n 3` |
| “save to ./hero” / “output to docs/assets” | `--output-dir <dir>` |
| Ảnh đính kèm + “make it nighttime” | `-r <attached path>` |
| “just estimate the cost” / “dry run” | `--dry-run` |

Ví dụ:

> “Generate a minimalist sunrise over mountains for the landing hero, landscape, high quality.”
> “Compare a ceramic mug product photo across all vendors, three variations each.”
> “Use codex to make this otter photo dramatic and nighttime.” (kèm ảnh tham chiếu)

Agent chạy [Quy trình Clarification](#clarification-protocol), khuếch đại prompt nếu cần rồi gọi `oma image generate` với flag suy luận. Dùng slash command khi muốn kiểm soát trực tiếp giá trị flag.

### 2. Slash command tường minh

```text
/oma-image a red apple on white background
/oma-image --vendor all --size 1536x1024 jeju coastline at sunset
/oma-image -n 3 --quality high --output-dir ./hero "minimalist dashboard hero illustration"
```


Mọi CLI flag (`--vendor`, `-n`, `--size`, `-r`, `--dry-run`, …) đều hoạt động trong slash command và được forward vào cùng pipeline `oma image generate`.

### 3. Từ skill khác (shared infrastructure)

Skill khác, như design, marketing hoặc docs, gọi pipeline như shared infrastructure với JSON output:

```bash
oma image generate "<prompt>" --output json
```


Manifest ghi ra stdout gồm output path, vendor, model và cost, nên dễ parse và chain.

---

## Tham chiếu CLI

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


### Flag chính

| Flag | Mục đích |
|---|---|
| `--vendor <name>` | `auto`, `pollinations`, `codex`, `antigravity` hoặc `all`. Với `all`, mọi vendor được yêu cầu phải healthy, tức strict. |
| `-n, --count <n>` | Số ảnh mỗi vendor, 1 đến 5, bị giới hạn theo wall-time. |
| `--size <size>` | Aspect: `1024x1024` (square), `1024x1536` (portrait), `1536x1024` (landscape) hoặc `auto`. |
| `--quality <level>` | `low`, `medium`, `high` hoặc `auto`, theo mặc định vendor. |
| `--output-dir <dir>` | Thư mục output, mặc định `.agents/results/images/{timestamp}/`. Path ngoài `$PWD` cần `--allow-external-output`. |
| `--allow-external-output` | Cho phép output directory nằm ngoài `$PWD`. |
| `--model <name>` | Ghi đè model vendor cho run này. Antigravity bỏ qua vì `agy` chọn model. |
| `-r, --reference <path>` | Tối đa 10 ảnh tham chiếu (PNG/JPEG/GIF/WebP, ≤ 5 MB mỗi ảnh). Có thể lặp hoặc phân tách bằng comma. Hỗ trợ Codex và Antigravity; Pollinations từ chối. |
| `-y, --yes` | Bỏ qua prompt xác nhận cho run ước tính ≥ `$0.20`. Cũng có thể dùng `OMA_IMAGE_YES=1`. |
| `--no-prompt-in-manifest` | Lưu SHA-256 của prompt thay vì raw text trong `manifest.json`. |
| `--dry-run` | In plan và cost estimate mà không tiêu tiền. |
| `--output text\|json` | Định dạng output CLI. JSON là bề mặt tích hợp cho skill khác. |
| `--timeout <duration>` | Timeout cho từng ảnh. |

---

## Ảnh tham chiếu

Đính kèm tối đa 10 ảnh tham chiếu để định hướng style, identity của subject hoặc composition.

```bash
oma image generate -r ~/Downloads/otter.jpeg "same otter in dramatic lighting" --vendor codex
oma image generate -r a.png -r b.png "blend these styles" --vendor antigravity
oma image generate -r a.png,b.png "blend these styles" --vendor antigravity
```


| Vendor | Hỗ trợ tham chiếu | Cách thực hiện |
|---|---|---|
| `codex` (`gpt-image-2`) | Có | Truyền `-i <path>` vào `codex exec` |
| `antigravity` | Có | Copy reference vào thư mục theo run và cấp quyền cho `agy` |
| `pollinations` | Không | Từ chối với exit code 4, cần URL hosting |

### Ảnh đính kèm nằm ở đâu

- **Claude Code:** `~/.claude/image-cache/<session>/N.png`, hiện trong system message dạng `[Image: source: <path>]`. Phạm vi session; muốn dùng lại sau thì copy đến vị trí bền vững.
- **Antigravity:** thư mục upload của workspace, IDE hiển thị path chính xác.
- **Codex CLI làm host:** phải truyền tường minh; attachment trong hội thoại không được forward.

Khi user đính kèm ảnh và yêu cầu sinh hoặc edit dựa trên ảnh đó, agent gọi phải forward qua `--reference <path>` thay vì mô tả bằng prose. Nếu local CLI quá cũ và không hỗ trợ `--reference`, chạy `oma update` rồi retry.

---

## Layout output

Mỗi run ghi vào `.agents/results/images/` với thư mục có timestamp và hash suffix:

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


`manifest.json` ghi vendor, model, prompt hoặc SHA-256, size, quality và cost để request có thể audit và lặp lại. Nó không đảm bảo pixel giống hệt provider live.

---

## Chi phí, an toàn và hủy

1. **Guardrail chi phí:** run ước tính ≥ `$0.20` sẽ hỏi xác nhận. Bypass bằng `-y` hoặc `OMA_IMAGE_YES=1`. Provider mặc định Pollinations (`flux`/`zimage`) miễn phí nên tự bỏ qua prompt.
2. **An toàn path:** output path ngoài `$PWD` cần `--allow-external-output` để tránh ghi ngoài ý muốn.
3. **Có thể hủy:** `Ctrl+C` (SIGINT/SIGTERM) hủy mọi provider call đang chạy và orchestrator.
4. **Run record ổn định:** `manifest.json` luôn được ghi cạnh ảnh.
5. **Tối đa `n` = 5:** giới hạn wall-time, không phải quota.
6. **Exit code:** phù hợp với `oma search fetch`: `0` ok, `1` general, `2` safety, `3` not-found, `4` invalid-input, `5` auth-required, `6` timeout.

---

## Quy trình clarification {#clarification-protocol}

Trước khi gọi `oma image generate`, agent chạy checklist này. Nếu thiếu thông tin và không thể suy luận, agent hỏi trước hoặc khuếch đại prompt rồi hiển thị bản mở rộng để user duyệt.

**Bắt buộc:**
- **Subject:** đối tượng chính trong ảnh là gì, như object, person hoặc scene?
- **Setting / backdrop:** nó ở đâu?

**Rất nên có, hỏi nếu thiếu và không suy luận được:**
- **Style:** photorealistic, illustration, 3D render, oil painting, concept art hay flat vector?
- **Mood / lighting:** sáng hay trầm, ấm hay lạnh, dramatic hay minimal?
- **Usage context:** hero image, icon, thumbnail, product shot hay poster?
- **Aspect ratio:** square, portrait hay landscape?

Với prompt ngắn như *“a red apple”*, agent **không** hỏi tiếp. Thay vào đó agent khuếch đại inline và hiển thị:

> User: “a red apple”
> Agent: “I'll generate this as: *a single glossy red apple centered on a clean white background, soft studio lighting, photorealistic, shallow depth of field, 1024×1024*. Shall I proceed, or would you like a different style/composition?”

Khi user tự viết creative brief đầy đủ (ít nhất 2 trong subject, style, lighting và composition), prompt được tôn trọng nguyên văn, không clarification và không amplification.

**Ngôn ngữ output:** Prompt sinh ảnh được gửi provider bằng tiếng Anh, vì image model chủ yếu được train trên caption tiếng Anh. Nếu user viết bằng ngôn ngữ khác, agent dịch và hiển thị bản dịch trong lúc amplification để user sửa nếu có hiểu sai.

---

## Cấu hình

- **Project config:** section `image:` của `.agents/oma-config.yaml`. Legacy `config/image-config.yaml` không còn được đọc.
- **Biến môi trường:**
  - `OMA_IMAGE_DEFAULT_VENDOR`: ghi đè vendor mặc định, nếu không thì `pollinations`.
  - `OMA_IMAGE_DEFAULT_OUT`: ghi đè output directory mặc định.
  - `OMA_IMAGE_YES`: `1` để bypass xác nhận chi phí.
  - `POLLINATIONS_API_KEY`: bắt buộc cho vendor Pollinations, đăng ký miễn phí.

---

## Troubleshooting

| Triệu chứng | Nguyên nhân khả năng | Cách khắc phục |
|---|---|---|
| Exit code `5` (auth-required) | Vendor đã chọn chưa được xác thực | Chạy `oma image doctor` để xem vendor cần đăng nhập, rồi `codex login`, đăng nhập `agy` hoặc đặt `POLLINATIONS_API_KEY`. |
| Exit code `4` ở `--reference` | Pollinations từ chối reference, hoặc file quá lớn/sai format | Chuyển sang `--vendor codex` hoặc `--vendor antigravity`. Mỗi reference tối đa 5 MB và phải là PNG/JPEG/GIF/WebP. |
| Không nhận diện `--reference` | Local CLI đã cũ | Chạy `oma update` rồi retry, không fallback về mô tả prose. |
| Xác nhận chi phí chặn automation | Run ước tính ≥ `$0.20` | Truyền `-y` hoặc đặt `OMA_IMAGE_YES=1`; có thể chuyển sang Pollinations miễn phí. |
| `--vendor all` abort ngay | Một vendor yêu cầu chưa healthy, do strict mode | Cài/đăng nhập vendor thiếu hoặc chọn `--vendor` cụ thể. |
| Output ghi nhầm thư mục | Mặc định là `.agents/results/images/{timestamp}/` | Truyền `--output-dir <dir>`. Path ngoài `$PWD` cần `--allow-external-output`. |
| Antigravity fail dù health pass | `agy --version` chỉ chứng minh đã cài, không chứng minh đã đăng nhập | Đăng nhập Gemini Code Assist, rồi thử lại với `oma image doctor` và `--vendor antigravity`. |

---

## Liên quan

- [Skills](/docs/core-concepts/skills): kiến trúc skill hai tầng cấp năng lượng cho `oma-image`
- [CLI Commands](/docs/cli-interfaces/commands): tham chiếu lệnh `oma image` đầy đủ
- [CLI Options](/docs/cli-interfaces/options): ma trận option toàn cục
