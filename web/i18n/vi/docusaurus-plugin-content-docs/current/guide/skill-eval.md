---
title: "Đánh giá Utility của Skill"
sidebar_label: Đánh giá Skill
description: Cách viết eval task fixture cho oma skill eval, quy ước thư mục .agents/eval/, các checker type và chế độ chạy mock/live.
---

# Đánh giá Utility của Skill {#skill-utility-eval}

`oma skill eval` đo xem việc load một skill có thực sự cải thiện kết quả task của agent hay không. Nó trả lời câu hỏi khác với `oma skill audit` (hỏi “hai skill có trùng nhau không?”): nó hỏi “skill này có giúp không?”.

Thiết kế dựa trên hai phát hiện nghiên cứu: WikiSkill (arXiv:2608.27454) tách raw experience, persistent knowledge và executable skill nhưng vẫn giữ held-out gate cho evolution; SkillLens (arXiv:2605.23899) cho thấy utility của skill độc lập với sự khác biệt của description — skill khác biệt vẫn có thể vô dụng, và skill chồng lấn vẫn có thể hữu ích.

---

## Cách hoạt động {#how-it-works}

Với mỗi task fixture, command chạy hai arm:

1. **Baseline arm** — task prompt được dispatch đến agent nhưng skill bị giữ lại.
2. **Treatment arm** — `SKILL.md` được thêm vào đầu prompt, sau đó cùng task được dispatch.

Mỗi arm được checker của task chấm điểm (0 = fail, 1 = pass). Metric chính là:

```
utilityLift = weighted_mean(treatment scores) − weighted_mean(baseline scores)
```

Skill pass khi `utilityLift ≥ 5%`. Dưới ngưỡng đó sẽ cảnh báo (lift biên) hoặc fail (không có lift). Cần ít nhất 5 task có thể chấm để đưa ra verdict.

---

## Quy ước `.agents/eval/<skill>/` {#the-agents-eval-skill-convention}

Đặt task fixture dưới `.agents/eval/<skill>/`. Path này nằm trong `.agents/` nhưng bên ngoài chính skill directory, nên tồn tại qua `oma update` mà không ghi đè eval do người dùng viết.

```
.agents/eval/
└── oma-scholar/
    ├── claims-only.yaml        ← task fixture
    ├── entity-lookup.yaml
    ├── partial-fetch.yaml
    ├── structured-output.yaml
    ├── edge-empty-response.yaml
    └── _rollouts/
        └── a3f1b2c4d5e6f7a8.json   ← recorded arm outputs + judge verdicts
```

File bắt đầu bằng `_` bị bỏ qua khi load task fixture. Thư mục `_rollouts/` chứa output đã ghi từ các lần chạy `--live --record` trước.

---

## Schema của task fixture {#task-fixture-schema}

Mỗi fixture là YAML file với các trường sau:

```yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
checker:
  type: judge
  rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

| Trường | Bắt buộc | Mô tả |
|:------|:---------|:-----------|
| `id` | Có | ID duy nhất của task (dùng trong tên rollout file và report) |
| `skill` | Có | Skill được đánh giá (khớp tên parent directory) |
| `domain` | Có | Domain label (dùng để nhóm và phát hiện negative transfer về sau) |
| `prompt` | Có | Task prompt được dispatch cho cả hai arm |
| `checker` | Không | Cách chấm agent output. Mặc định là `{ type: judge }` nếu bỏ qua. |
| `weight` | Có | Trọng số tương đối cho weighted mean (dùng `1` nếu task không quan trọng hơn) |

### Các checker type {#checker-types}

#### judge (mặc định) {#judge-default}

LLM đánh giá agent output theo rubric và trả về PASS hoặc FAIL. Đây là mặc định khi bỏ qua `checker` hoặc không có `checker.type`.

```yaml
checker:
  type: judge
  rubric: "Does the answer correctly cite the source and avoid hallucination?"
```

Trường `rubric` là tùy chọn; nếu bỏ qua, rubric mặc định là: "Does the answer correctly and completely satisfy the task prompt?"

Cũng có thể viết rubric ở top level cho ngắn:

```yaml
id: minimal-fixture
skill: oma-scholar
domain: research
prompt: "What are the main claims in paper X?"
rubric: "Does the answer enumerate the main claims without adding fabricated ones?"
weight: 1
```

**Quan trọng:** Trong `--mock` mode, judge task cần verdict đã ghi trước trong `_rollouts/`. Nếu task không có verdict đã ghi, task bị loại khỏi report kèm cảnh báo. Chạy `--live --record` để tạo rollout trước.

Điều tương tự áp dụng cho mọi checker type khi thiếu hoàn toàn một arm: task bị loại thay vì chấm 0. Dữ liệu thiếu không phải câu trả lời thất bại — chấm như 0 sẽ làm cả hai arm thành 0 và zero lift đọc như `decision: "fail"`. Nếu loại task làm số task đã chấm thấp hơn `MIN_TASKS`, report hiển thị `coverage: "insufficient"`.

#### assert (opt-in) {#assert-opt-in}

Substring check xác định. Dùng cho contract, format hoặc tool-call cần output chính xác.

```yaml
checker:
  type: assert
  expect_contains:
    - "section=statements"
    - "partial_fetch=true"
```

Pass khi mọi string trong `expect_contains` đều có trong agent output.

#### regex (opt-in) {#regex-opt-in}

Regex match opt-in.

```yaml
checker:
  type: regex
  pattern: "section=\\w+"
```

Pattern dài hơn 200 ký tự được chấm 0 (biện pháp ngăn ReDoS). Output bị cắt còn 10.000 ký tự trước khi match.

---

## Các chế độ thực thi {#execution-modes}

### `--mock` (mặc định) {#mock-default}

Replay rollout đã ghi từ `_rollouts/`. Hoàn toàn xác định và offline — không gọi LLM.

- Với checker `assert`/`regex`: score được tính từ output string đã ghi.
- Với checker `judge`: replay trường `score` được ghi bởi `--live --record`.

Nếu judge task không có score đã ghi trong `_rollouts/`, task bị loại khỏi report (kèm cảnh báo). Điều này giữ mock mode hoàn toàn offline.

Recording cũng được kiểm tra độ cũ trước khi dùng. Treatment entry ghi dưới body `SKILL.md` khác, entry có fixture `prompt` đã đổi và entry thiếu provenance tracking đều bị loại kèm cảnh báo nêu file và số lượng. Khi còn ít hơn `MIN_TASKS` task có thể chấm, run báo `coverage: "insufficient"` thay vì verdict — nhờ đó skill đã sửa không kế thừa score cũ.

:::note `oma skill optimize --mock`
Optimizer chấm body `SKILL.md` candidate. Vì recording chỉ hợp lệ với body đã tạo ra nó, candidate body không có rollout khớp và được báo là uncovered. Dùng `--live` để chấm candidate.
:::

An toàn cho CI. Đặt `OMA_SKILLEVAL_MOCK=1` để ép chế độ này.

```bash
oma skill eval --skill oma-scholar
```

### `--live` {#live}

Spawn agent arm thật qua `oma agent spawn --read-only`. Cả hai arm chạy trong workspace tạm để ngăn sửa file của project.

Trước khi dispatch, command in cost preview gồm số task, số arm dispatch, số judge dispatch và vendor đã resolve. Xác nhận bằng `y` hoặc bỏ qua bằng `--yes`.

Các control khác hữu ích trong CI và điều tra coverage:

| Option | Tác dụng |
| --- | --- |
| `--task-dir <path>` | Đánh giá fixture từ directory khác `.agents/eval/<skill>`. |
| `--max-tasks <n>` | Giới hạn số fixture cho live run có phạm vi. |
| `--neg-transfer` | Lấy mẫu neighbor cùng domain để tìm negative transfer; mặc định tắt. |
| `--require-coverage` | Thoát non-zero khi còn dưới năm paired task có thể chấm. |

```bash
# Preview and confirm
oma skill eval --skill oma-scholar --live

# Skip confirmation
oma skill eval --skill oma-scholar --live --yes
```

#### Skill isolation (giữ baseline trung thực) {#skill-isolation-keeping-the-baseline-honest}

`utilityLift` chỉ có ý nghĩa nếu **baseline arm chạy không có target skill**. Vấn đề là agent được dispatch tự động load mọi skill đã cài trong runtime, nên baseline ngây thơ vẫn lấy skill mà nó đáng ra phải không có — làm nhiễm so sánh (baseline ≈ treatment, lift ≈ 0).

Để ngăn điều này, `--live` chạy **cả hai arm trong workspace tạm cô lập**, nơi skill directory chứa mọi skill đã cài **trừ target**. Treatment arm chỉ thêm lại target qua `SKILL.md` được inject (thêm vào đầu prompt). Vì vậy injection là biến được kiểm soát duy nhất: baseline = không có skill, treatment = `SKILL.md` candidate.

Cách này hoạt động vì phần lớn vendor tìm skill **tương đối với working directory** (ví dụ `<cwd>/.claude/skills`, `<cwd>/.codex/skills`) — working directory sạch thực sự che được skill. Report cho biết isolation được giữ tốt đến đâu qua trường `isolation`:

| Status | Ý nghĩa |
|---|---|
| `enforced` | Vendor tương đối với cwd, target skill không có trong HOME path — cô lập hoàn toàn. |
| `best-effort` | Vendor tương đối với cwd nhưng HOME cũng có bản skill (hoặc vendor không xác định); bản project bị che nhưng bản HOME có thể rò rỉ. Được gắn cờ độ tin cậy thấp. |
| `unavailable` | Vendor dựa trên HOME (ví dụ **antigravity**, đọc từ `~/.gemini/antigravity-cli/skills`); cwd sạch không thể che nó. In cảnh báo và đánh dấu kết quả độ tin cậy thấp. |
| n/a | Mock mode — không dispatch live. |

Khi isolation không phải `enforced`, một cảnh báo một dòng được in và kết quả nên được coi là tín hiệu độ tin cậy thấp. Để có tín hiệu sạch, chạy eval với vendor tương đối cwd có thể cô lập (claude / codex / qwen) thay vì vendor dựa trên HOME — eval vendor theo `model_preset` trong `.agents/oma-config.yaml`, nên chọn preset có vendor mặc định tương đối cwd.

### `--live --record` {#live-record}

Chạy live arm và ghi output đã capture (kể cả judge verdict cho judge-checker task) vào `_rollouts/<hash>.json`. Tên file là SHA-256 hash xác định của tập task ID — không dựa trên ngày hoặc random.

Dùng cách này để seed `--mock` run trên máy của bạn để các lần chạy lặp lại vẫn offline.

Mỗi entry có provenance để replay sau này biết nó còn áp dụng không:

| Trường | Ghi trên | So sánh với |
|---|---|---|
| `skillBodyHash` | chỉ `treatment` | body `SKILL.md` đang được đánh giá |
| `promptHash` | cả hai arm | `prompt` hiện tại của fixture |

Baseline arm giữ skill lại, nên sửa `SKILL.md` không làm baseline invalid — chỉ treatment arm cần ghi lại.

:::caution `_rollouts/` chỉ local — không commit
Recording chỉ replay được với đúng body `SKILL.md` đã tạo ra nó. Sửa skill sẽ loại treatment recording trong lần `--mock` tiếp theo, nên recording đã commit sẽ cũ sau thay đổi `SKILL.md` và phát cảnh báo cho mọi người pull về. Directory này được gitignore; chỉ record local.
:::

```bash
oma skill eval --skill oma-scholar --live --record --yes
```

Sau live run thành công, report gồm baseline và treatment count, `utilityLift`, `coverage: "ok"`, isolation status và decision pass/warn/fail. Mock run về sau chỉ dùng recording có task prompt và treatment skill body còn khớp.

---

## Một bộ fixture hoạt động tối thiểu {#a-minimal-working-fixture-set}

Cần năm fixture để có verdict (`MIN_TASKS = 5`). Đây là bộ tối thiểu cho skill `oma-scholar` giả định:

```yaml
# .agents/eval/oma-scholar/claims-only.yaml
id: claims-only
skill: oma-scholar
domain: research
prompt: "Fetch claims-only for knows:generated/reconvla/1.0.0"
rubric: "Does the answer fetch ONLY the claims via the section=statements partial fetch?"
weight: 1
```

```yaml
# .agents/eval/oma-scholar/entity-lookup.yaml
id: entity-lookup
skill: oma-scholar
domain: research
prompt: "Look up the entity knows:concept/attention-mechanism"
rubric: "Does the answer return the entity name, description, and at least one related concept?"
weight: 1
```

Lặp lại cho ít nhất ba task nữa. Sau đó chạy:

```bash
# Seed rollouts (local only — re-run after any SKILL.md edit)
oma skill eval --skill oma-scholar --live --record --yes

# Offline replay
oma skill eval --skill oma-scholar --json
```

---

## Đọc report {#reading-the-report}

**Text output:**

```
Skill utility eval  (skill: oma-scholar)
  tasks: 7
  isolation: enforced [codex]

  baseline: 42.9%  treatment: 71.4%
  utilityLift: 28.6%  (stddev: 14.3%)
  [PASS]
  Skill shows positive utility lift >= 5%.

  Per-task findings:
    claims-only: baseline=0 treatment=1 lift=+1.000
    entity-lookup: baseline=1 treatment=1 lift=+0.000
    ...

  Thresholds: fail <= 0%, warn < 5%
```

**JSON output** (qua `--json`):

```json
{
  "ok": true,
  "skill": "oma-scholar",
  "taskCount": 7,
  "coverage": "ok",
  "decision": "pass",
  "baselineScore": 0.4286,
  "treatmentScore": 0.7143,
  "utilityLift": 0.2857,
  "utilityStdDev": 0.1429,
  "findings": [
    { "taskId": "claims-only", "baseline": 0, "treatment": 1, "lift": 1.0 }
  ],
  "negativeTransfer": [],
  "isolation": "enforced",
  "isolationVendor": "codex"
}
```

`ok` là `true` chỉ khi `coverage === "ok"` và `decision === "pass"`. Trường `isolation` báo baseline arm có thực sự chạy không có target skill hay không (xem [Skill isolation](#skill-isolation-keeping-the-baseline-honest)); `isolation` là `"n/a"` trong `--mock` mode.

---

## Tích hợp CI {#ci-integration}

```bash
# Fail the build if the skill regresses or has insufficient coverage
oma skill eval --skill oma-scholar --json --require-coverage
```

Exit code:
- `0` — pass hoặc warn
- `1` — fail, hoặc coverage không đủ với `--require-coverage`

---

## Chọn live hay mock {#choosing-live-or-mock}

Dùng `--live` với judge checker để đo utility thực tế trên task mở. Dùng `--mock` để replay judge verdict đã record trước đó offline hoặc chạy deterministic `assert`/`regex` contract check.

Mock determinism được giữ bằng cách ghi binary verdict (PASS/FAIL) của judge vào rollout entry trong `--live --record`, rồi replay score đã ghi trong các lần `--mock` sau — không gọi LLM lại.

**Data egress:** Trong `--live`, judge dispatch output của candidate arm đến vendor đã cấu hình để chấm. Cảnh báo một lần được in khi bắt đầu mỗi live run.

Nếu mock run báo coverage không đủ, kiểm tra cảnh báo về `_rollouts` entry bị loại hoặc thiếu, sau đó chạy live recording pass sau khi sửa fixture hoặc skill. Nếu isolation là `best-effort` hoặc `unavailable`, chọn vendor tương đối cwd như Claude, Codex hoặc Qwen trước khi coi lift là tín hiệu mạnh.

---

## Phân phối eval task cùng skill {#shipping-eval-tasks-with-a-skill}

Skill có thể kèm task set bằng cách đặt fixture tại `.agents/eval/<skill>/`. Đây là file do người dùng sở hữu bên ngoài skill directory, nên tồn tại qua `oma update`. Khi tạo skill mới bằng `oma-skill-creation`, thêm bộ fixture `eval/` tương ứng để tác giả sau này có cách xác minh tác động của skill. Xem `.agents/skills/oma-skill-creation/SKILL.md` để biết workflow soạn skill.
