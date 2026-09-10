---
title: "Tối ưu hóa Skill"
sidebar_label: Tối ưu hóa Skill
description: Cách dùng oma skill optimize để phát triển skill bền vững dựa trên bằng chứng, với train, validation và runner-owned holdout gate xác định.
---

# Tối ưu hóa Skill {#skill-optimization}

`oma skill optimize` tiến hóa `SKILL.md` của một skill để tối đa hóa `utilityLift` đo được do `oma skill eval` tạo ra. Nó tách raw rollout evidence, persistent scoped knowledge và executable skill. Wiki Maintainer tổng hợp success/failure có thể quan sát; Proposer dùng knowledge đó để tạo các edit add/delete/replace có phạm vi. Candidate phải cải thiện validation utility đã hold out, còn `--apply` cần thêm cải thiện trên runner-owned holdout split. Khi deploy không có wiki lookup bổ sung ở thời điểm inference: output vẫn là một `SKILL.md`.

Cơ sở nghiên cứu: Tang, L., Rashtchian, C., Ferng, C.-S., Tomkins, A., Juan, D.-C. & Vu, T. (2026). *WikiSkill: Compiling agent experience into persistent knowledge for skill evolution* [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2608.27454

---

## Dependency cứng: eval task fixture {#hard-dependency-eval-task-fixtures}

`oma skill optimize` không thể chạy nếu thiếu eval task fixture. Nó cần ít nhất **5 task fixture** (`MIN_TASKS = 5`) trong `.agents/eval/<skill>/`. Nếu tìm thấy ít hơn, command báo lỗi ngay:

```
[oma skill opt] no eval coverage for skill "oma-scholar": found 2 task fixture(s), need at least 5. Author tasks first — see web/docs/guide/skill-eval.md
```

Xem [Hướng dẫn Skill Utility Eval](/docs/guide/skill-eval) về quy ước directory `.agents/eval/<skill>/`, fixture schema, checker type và cách seed rollout cho mock replay.

---

## Cách hoạt động {#how-it-works}

Fixture được sort theo task ID và tách xác định thành tập **train**, **held-out validation** và **runner-owned final-test**. Với ít nhất năm fixture, tỷ lệ mục tiêu là 60/20/20 và mỗi partition có ít nhất một task. Task final-test đến từ local fixture set này; chúng được giữ khỏi Maintainer và Proposer trong loop, không fetch từ hidden external suite.

Với mỗi epoch (tối đa `--max-epochs`, mặc định 8):

1. **Chấm `SKILL.md` tốt nhất hiện tại trên TRAIN split** — `oma skill eval` trả prompt, output và lift theo task có thể quan sát.
2. **Wiki Maintainer tổng hợp evidence** — tối đa năm failure và ba success trở thành pattern có liên kết evidence. Pattern có phạm vi và kết quả gate trước đó được recall từ hệ thống memory L1/L2/L3 của OMA.
3. **Proposer tạo K candidate edit** (tối đa `--edits-per-epoch`, mặc định 4). Exact edit đã có trong persistent rejection history bị bỏ qua.
4. **Với mỗi candidate edit:**
   - Áp edit lên bản copy `SKILL.md` trong memory.
   - Validate candidate (frontmatter `name`/`description` phải còn; body phải parse).
   - Ép textual learning-rate budget: bỏ edit có net character change vượt `--lr` (mặc định 600 ký tự).
   - Chấm lại candidate trên held-out validation split.
5. **Chấp nhận candidate validation tốt nhất chỉ khi** validation lift tăng nghiêm ngặt (`Δlift > 0`) **và** không có negative-transfer entry vượt regression floor (`NEG_TRANSFER_FAIL = -0.1`). Mọi proposal gate đều được lưu.
6. **Dừng sớm** sau 2 epoch liên tiếp không có edit được chấp nhận (`OPT_EARLY_STOP_PATIENCE = 2`).
7. **Chạy final test do runner sở hữu sau evolution.** Maintainer và Proposer không thấy task này trong loop. Final test thất bại sẽ ngăn `--apply` và ghi validation winner thành rejected knowledge.

Optimizer không sửa live `SKILL.md` trong loop — luôn làm việc trên candidate copy trong memory.

---

## Cách dùng {#usage}

```
oma skill optimize --skill <id>
               [--dry-run | --apply]
               [--mock | --live]
               [--max-epochs <n>] [--edits-per-epoch <k>] [--lr <chars>]
               [--yes]
               [--json] [--output <format>]
```

### Flags {#flags}

| Flag | Mặc định | Mô tả |
|:-----|:--------|:-----------|
| `--skill <id>` | `_all` | Skill ID cần tối ưu (tên đơn giản, không có path separator). |
| `--dry-run` | **yes (default)** | Đề xuất edit và in diff mà không đổi `SKILL.md`; evidence tạo ra và evolution event vẫn được lưu. |
| `--apply` | — | Áp edit được chấp nhận vào `SKILL.md` — backup original trước atomic write. Chỉ chạy khi validation và runner-owned final-test gate pass; skill do OMA sở hữu còn cần `--yes`. |
| `--mock` | **yes (default)** | Replay optimizer edit và eval verdict đã ghi từ `_rollouts/`. Xác định, offline, an toàn cho CI. |
| `--live` | — | Live LLM optimizer dispatch — phát sinh model call thật cho mỗi epoch. In cost preview và hỏi xác nhận trừ khi có `--yes`. |
| `--max-epochs <n>` | `8` | Số epoch tối ưu tối đa. |
| `--edits-per-epoch <k>` | `4` | Số candidate edit optimizer LLM đề xuất mỗi epoch. |
| `--lr <chars>` | `600` | Textual learning-rate budget: net character change tối đa cho mỗi edit được chấp nhận. |
| `--yes` | — | Bỏ qua cost-preview confirmation. Chỉ có ý nghĩa với `--live`. |
| `--json` | — | Xuất JSON cho CI/CD. |
| `--output <format>` | `text` | Output format (`text` hoặc `json`). |

---

## Ví dụ end-to-end tối thiểu {#minimal-end-to-end-example}

```bash
# Propose edits (dry-run, mock mode — does not change SKILL.md, fully offline)
oma skill optimize --skill oma-scholar --mock --dry-run
```

Output ví dụ:

```
[oma skill opt] skill: oma-scholar, tasks: 8 (train: 4, val: 4), dry-run: true

Skill opt  (skill: oma-scholar)
  applied: false
  baselineLift: 18.5%  finalLift: 32.0%
  epochs: 3  acceptedEdits: 2  rejected: 6

  diff:
--- a/SKILL.md
+++ b/SKILL.md
@@ -12,6 +12,9 @@
 ### When to use
 - User asks to look up an academic paper or technical claim.
+- User asks for a summary of arxiv abstracts or DOI-linked documents.
 - User wants citations or sources for a factual statement.
```

Diff cho biết optimizer sẽ ghi gì. `SKILL.md` không đổi, còn evolution evidence được tạo và scoped gate outcome được lưu cho các run sau.

---

## Áp dụng cải tiến đã validation {#applying-a-validated-improvement}

Khi hài lòng với proposed diff, chạy lại với `--apply`:

```bash
# Apply accepted edits (backs up the original first)
oma skill optimize --skill oma-scholar --mock --apply
```

`--apply` chỉ ghi khi optimization tìm thấy cải thiện validation dương nghiêm ngặt và candidate lift của runner-owned final test lớn hơn baseline lift. Backup của `SKILL.md` gốc được tạo trước atomic write. Diff luôn được in để bạn review thay đổi.

---

## Live mode {#live-mode}

Live mode gọi Maintainer và Proposer thật, đồng thời chạy lại live eval arm ở mỗi epoch. Nó tốn kém: mỗi task được chấm có baseline và treatment call, judge fixture thêm grading call, và final test chấm body gốc cùng candidate body. Preview báo upper bound của model call theo split thật. Mỗi call timeout 120 giây; eval arm Claude chạy restricted, tắt ambient tool, skill, MCP và AgentMemory.

```bash
# Cost preview + confirm
oma skill optimize --skill oma-scholar --live

# Skip confirmation
oma skill optimize --skill oma-scholar --live --yes

# Live opt, then apply if improved
oma skill optimize --skill oma-scholar --live --apply --yes
```

Cost preview liệt kê upper bound của model call nền trước khi có LLM call nào.

---

## JSON output {#json-output}

```bash
oma skill optimize --skill oma-scholar --json
```

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "baselineLift": 0.1850,
  "finalLift": 0.3200,
  "epochCount": 3,
  "acceptedEdits": [
    { "op": "add", "anchor": "### When to use", "after": "\n- User asks for a summary of arxiv abstracts or DOI-linked documents." }
  ],
  "rejectedCount": 6,
  "applied": false,
  "diff": "--- a/SKILL.md\n+++ b/SKILL.md\n...",
  "_dryRun": true,
  "finalTest": { "baselineLift": 0.10, "candidateLift": 0.25, "passed": true },
  "_split": { "trainCount": 4, "valCount": 1, "testCount": 3 }
}
```

`ok` là `true` chỉ khi candidate cải thiện validation và runner-owned final test không fail (hoặc candidate đã được apply). `_split` count cho biết partition fixture local thực tế của run.

---

## Lưu ý SSOT cho skill `oma-*` {#ssot-caveat-for-oma-skills}

Skill có ID bắt đầu bằng `oma-` do oh-my-agent sở hữu và bị `oma update` ghi đè. Với các skill này, không khuyến khích `--apply` — dùng `--dry-run` (mặc định), review diff đề xuất và upstream thay đổi vào registry nếu cải tiến có ý nghĩa. Với skill do người dùng viết, `--apply` an toàn.

Command in cảnh báo khi target skill do OMA sở hữu:

```
[oma skill opt] warning: "oma-scholar" is an oma-owned skill. --apply output will be overwritten by oma update. Consider using --dry-run and upstreaming the diff instead.
```

---

## Overfitting guard {#overfitting-guard}

Maintainer và Proposer chỉ thấy TRAIN rollout evidence. Candidate selection dùng held-out VALIDATION split, còn TEST split do runner sở hữu vẫn bị ẩn cho đến khi evolution kết thúc. Validation winner không cải thiện final test sẽ không được apply và được thêm vào persistent rejection history.

---

## Tích hợp CI {#ci-integration}

Trong `--mock` mode, `oma skill optimize` hoàn toàn xác định và offline — không gọi LLM. Dùng trong CI để xác minh proposed skill diff vẫn cho lift so với recorded rollout:

```bash
oma skill optimize --skill oma-scholar --mock --json
```

Exit code:
- `0` — optimization hoàn tất (có hoặc không có cải thiện)
- `1` — ít hơn `MIN_TASKS` fixture hoặc `--skill` argument không hợp lệ

---

## Xem thêm {#see-also}

- [Skill Utility Eval](/docs/guide/skill-eval) — soạn task fixture, checker type, mock/live mode và directory `_rollouts/`.
- [CLI Commands](/docs/cli-interfaces/commands) — tham chiếu flag cho mọi skill management command.
