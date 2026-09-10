---
title: "Đánh giá Harness"
sidebar_label: Đánh giá Harness
description: Đánh giá một OMA harness overlay hoàn chỉnh bằng các task repository ghép cặp, cô lập và các artifact check xác định.
---

# Đánh giá Harness {#harness-evaluation}

`oma harness eval` đo xem một OMA harness candidate có cải thiện target agent cố định mà không đổi model của agent đó hay không. Nó áp dụng mô hình đánh giá lúc test từ [AI4AI at Test-Time: Strong-to-Weak Capability Transfer via Harnesses](https://arxiv.org/abs/2608.12307): giữ target model cố định, thay harness và so sánh kết quả trên cùng task.

Command này đánh giá unit lớn hơn `oma skill eval`:

| Command | Treatment | Đối tượng chấm điểm |
|:--------|:----------|:-------------|
| `oma skill eval` | Một `SKILL.md` body | Agent output |
| `oma harness eval` | Một `.agents/` overlay có phạm vi | File và output tạo ra trong repository workspace |

Dùng skill eval để trả lời “skill này có giúp không?”. Dùng harness eval để trả lời “tổ hợp skill, workflow, rule và agent instruction này có giúp agent cố định hoàn tất task repository đáng tin cậy hơn không?”

## Mô hình đánh giá {#evaluation-model}

Mỗi task chạy như một paired experiment:

1. OMA copy task fixture vào baseline workspace mới.
2. OMA copy definition `agents`, `config`, `rules`, `skills` và `workflows` hiện tại vào workspace đó rồi project chúng sang vendor format đã chọn.
3. OMA lặp lại setup trong workspace mới thứ hai và áp candidate overlay tại đó.
4. Cùng primary agent, vendor route, prompt, write permission và timeout được dùng cho cả hai arm.
5. Deterministic check kiểm tra workspace kết quả và agent output tùy chọn.

Project thật không bao giờ được dùng làm working directory của arm. Workspace tạm của arm được xóa sau khi chấm; process sandbox riêng của vendor đã chọn vẫn là authority cho quyền truy cập bên ngoài working directory đó.

## Bố cục candidate {#candidate-layout}

Candidate path là một directory chứa partial `.agents/` tree:

```text
candidate/
└── .agents/
    ├── agents/
    │   └── docs-curator.md
    ├── rules/
    │   └── documentation.md
    ├── skills/
    │   └── project-docs/
    │       └── SKILL.md
    └── workflows/
        └── docs-check.md
```

Chỉ file dưới `.agents/agents`, `.agents/rules`, `.agents/skills` và `.agents/workflows` được chấp nhận. Hook, evaluator fixture, state, result, configuration file, symlink và vendor agent variant bị từ chối. Protected agent frontmatter field như `model`, `tools`, `effort` và execution limit phải khớp baseline. Arm cũng thất bại nếu agent đang chạy sửa protected `.agents/` definition trước khi chấm.

## Định dạng suite {#suite-format}

Suite là một YAML file cộng với một fixture directory cho mỗi task:

```text
harness-eval/
├── suite.yaml
└── fixtures/
    ├── stale-api-doc/
    │   ├── docs/api.md
    │   └── src/session.ts
    └── missing-guide/
        ├── docs/
        └── src/feature.ts
```

```yaml
schema_version: 1
id: docs-harness
agent: docs-curator
tasks:
  - id: stale-api-doc
    prompt: Update the API documentation to match the implementation.
    workspace: fixtures/stale-api-doc
    weight: 1
    checks:
      - type: file_contains
        path: docs/api.md
        value: openSession
      - type: file_not_contains
        path: docs/api.md
        value: createSession
```

Task ID phải duy nhất. Fixture path và check path phải nằm trong project và task workspace. Fixture không được chứa symlink hoặc harness control surface như `.agents`, `.codex`, `.claude`, vendor skill directory hoặc root agent-instruction file. Điều này ngăn task data che khuất harness được kiểm soát của cả hai arm.

Dependency directory được tạo như `node_modules` và `.venv` không được copy từ baseline harness. Commit deterministic helper source và dependency manifest trong skill; provision runtime dependency trong task fixture khi check cần.

### Loại check {#check-types}

| Type | Fields | Điều kiện pass |
|:-----|:-------|:---------------|
| `file_exists` | `path` | Path tồn tại sau khi arm hoàn tất. |
| `file_not_exists` | `path` | Path không tồn tại. |
| `file_contains` | `path`, `value` | File tồn tại và chứa value. |
| `file_not_contains` | `path`, `value` | File tồn tại và không chứa value. |
| `output_contains` | `value` | Agent output được capture chứa value. |
| `output_not_contains` | `value` | Agent output được capture không chứa value. |

Artifact check được thiết kế để xác định. Phiên bản đầu tiên không chạy mutable package script như judge, vì agent được đánh giá có thể sửa script hoặc test và làm evaluator mất hiệu lực.

## Chạy và ghi nhận {#run-and-record}

Live mode dispatch hai arm cho mỗi task, in cost preview và yêu cầu xác nhận:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --live --record
```

Sau run thành công, report chứa baseline/candidate score ghép cặp, lift, số regression và decision như `pass` hoặc `insufficient`. Nếu thay suite, baseline definition, candidate overlay, prompt, fixture hoặc check, hãy ghi một live run mới; `_runs` file cũ sẽ bị từ chối do hash.

Dùng `--yes` cho execution không tương tác và `--timeout-minutes` để đặt cùng wall-clock limit cho mỗi arm. Live execution chỉ có khi vendor đã chọn tìm harness file tương đối với project workspace. OMA từ chối discovery dựa trên HOME vì baseline có thể nhìn thấy candidate content cài toàn cục.

`--record` ghi hash-addressed JSON record dưới `_runs/` cạnh suite. Record ràng buộc kết quả với ba input:

- suite, prompt, check và nội dung fixture;
- baseline harness definition hiện tại;
- nội dung candidate overlay.

Mock mode là mặc định và không gọi model. Nó chỉ replay record khi cả ba hash vẫn khớp:

```bash
oma harness eval \
  --suite harness-eval/suite.yaml \
  --candidate candidate \
  --mock --require-coverage
```

## Metrics và decision gate {#metrics-and-decision-gate}

Task chỉ pass khi mọi check đều pass. Score là weighted mean của các paired task:

```text
lift = candidateScore - baselineScore
```

OMA cũng báo cáo:

- corrected task: baseline fail và candidate pass;
- regressed task: baseline pass và candidate fail;
- coverage: cần ít nhất năm paired, scoreable task.

Candidate pass khi lift ít nhất 5 percentage point và không có regression. Bất kỳ regression nào cũng làm candidate fail. Lift không âm dưới 5 point tạo cảnh báo, còn ít hơn năm task ghép cặp tạo decision `insufficient`. Thêm `--require-coverage` để coverage không đủ trả về non-zero trong CI. Score không phải bằng chứng khi một arm bị thiếu, record hash cũ hoặc deterministic check chưa hoàn tất.

## Ranh giới hiện tại {#current-boundary}

Đây là nền tảng đánh giá, chưa phải harness optimization tự động. Builder có thể tạo candidate overlay bên ngoài, sau đó dùng command này làm acceptance gate. Hidden final-test suite riêng, stochastic trial lặp lại, trusted external test runner, token accounting, ép model pin cho nested subagent call và loop `harness opt` tự động chưa thuộc command hiện tại. Cho đến khi có nested-call pinning, suite nhằm đo một model cố định nên tránh candidate workflow spawn các agent role đã cấu hình khác.
