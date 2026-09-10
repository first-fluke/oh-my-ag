---
title: Skill
description: Hướng dẫn đầy đủ về kiến trúc hai tầng của 33 skill OMA, gồm định tuyến SKILL.md, tài nguyên tải theo nhu cầu, protocol dùng chung và có điều kiện, thực thi theo vendor, đo lường token và cơ chế định tuyến.
---

# Skill

Skill là các gói kiến thức có cấu trúc, cung cấp hướng dẫn theo lĩnh vực cho một vai trò dispatch. Mỗi gói chứa protocol thực thi, tham chiếu tech stack, mẫu mã, playbook lỗi, checklist chất lượng và ví dụ khi cần, được tổ chức theo kiến trúc hai tầng để tiết kiệm token.

---

## Thiết kế hai tầng

### Tầng 1: SKILL.md (trung vị khoảng 2.631 token, tải khi skill được định tuyến)

Mỗi skill có tệp `SKILL.md` ở thư mục gốc. Tệp này đi vào cửa sổ ngữ cảnh khi skill được định tuyến, tức hook injector truyền một **tham chiếu đường dẫn** chứ không truyền nội dung, nên skill chưa được định tuyến hầu như không tốn gì ngoài trường `description`. Tệp chứa:

- **Frontmatter YAML** với `name` và `description` (dùng để định tuyến và hiển thị)
- **When to use / When NOT to use**: điều kiện kích hoạt rõ ràng
- **Quy tắc cốt lõi**: 5-15 ràng buộc quan trọng nhất của lĩnh vực
- **Tổng quan kiến trúc**: cách cấu trúc mã
- **Danh sách thư viện**: dependency được phê duyệt và mục đích của chúng
- **Tham chiếu**: con trỏ tới tài nguyên tầng 2, không tự động tải

Ví dụ frontmatter:

```yaml
---
name: oma-frontend
description: Frontend specialist for React, Next.js, TypeScript with FSD-lite architecture, shadcn/ui, and design system alignment. Use for UI, component, page, layout, CSS, Tailwind, and shadcn work.
---
```

Trường description rất quan trọng vì chứa các từ khóa định tuyến mà hệ thống định tuyến skill dùng để ghép task với agent.

### Tầng 2: resources/ (tải theo nhu cầu)

Thư mục `resources/` chứa kiến thức thực thi chuyên sâu. Các tệp này chỉ được tải khi:
1. Host hoặc workflow đã chọn skill, ví dụ qua native skill match hoặc lệnh tường minh
2. Loại task và độ khó hiện tại cần tài nguyên cụ thể

Việc tải theo nhu cầu được hướng dẫn bởi tài liệu context-loading (`.agents/skills/_shared/core/context-loading.md`), tài liệu này ánh xạ loại task với tài nguyên bắt buộc cho từng agent.

---

## Ví dụ cấu trúc file

```
.agents/skills/oma-frontend/
├── SKILL.md                          ← Layer 1: loaded when routed
└── resources/
    ├── execution-protocol.md         ← Layer 2: step-by-step workflow
    ├── tech-stack.md                 ← Layer 2: detailed technology specs
    ├── angular-rules.md              ← Layer 2: Angular-specific conventions
    ├── snippets.md                   ← Layer 2: copy-paste code patterns
    ├── error-playbook.md             ← Layer 2: error recovery procedures
    └── checklist.md                  ← Layer 2: quality verification checklist

.agents/skills/oma-backend/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── orm-reference.md              ← Domain-specific (ORM queries, N+1, transactions)
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Shipped language seeds / generated references
    ├── node/
    ├── python/
    └── rust/

.agents/skills/oma-mobile/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── tech-stack.md
│   ├── screen-template.dart
│   ├── screen-template.swift         ← Swift native iOS screen template
│   ├── screen-template.tsx            ← React Native screen template
│   ├── checklist.md
│   └── error-playbook.md
└── variants/                          ← Stack schema and generated platform references
    ├── README.md
    └── stack.schema.json

.agents/skills/oma-design/
├── SKILL.md
├── resources/
│   ├── execution-protocol.md
│   ├── anti-patterns.md
│   ├── checklist.md
│   ├── design-md-spec.md
│   ├── design-tokens.md
│   ├── prompt-enhancement.md
│   ├── stitch-integration.md
│   └── error-playbook.md
└── reference/                         ← Deep reference material
    ├── typography.md
    ├── color-and-contrast.md
    ├── spatial-design.md
    ├── motion-design.md
    ├── responsive-design.md
    ├── component-patterns.md
    ├── accessibility.md
    └── shader-and-3d.md
```

---

## Loại tài nguyên theo skill

| Loại tài nguyên | Mẫu tên file | Mục đích | Khi tải |
|--------------|-----------------|---------|-------------|
| **Execution Protocol** | `execution-protocol.md` | Workflow từng bước: Analyze → Plan → Implement → Verify | Luôn tải cùng SKILL.md |
| **Tech Stack** | `tech-stack.md` | Thông số công nghệ, phiên bản và cấu hình chi tiết | Task Complex |
| **Error Playbook** | `error-playbook.md` | Quy trình phục hồi với cơ chế leo thang “3 lần thử” | Chỉ khi có lỗi |
| **Checklist** | `checklist.md` | Xác minh chất lượng theo lĩnh vực | Ở bước Verify |
| **Snippets** | `snippets.md` | Mẫu mã sẵn sàng copy-paste | Task Medium/Complex |
| **Examples** | `examples.md` hoặc `examples/` | Ví dụ input/output few-shot cho LLM | Task Medium/Complex |
| **Variants** | `variants/` | Tham chiếu theo ngôn ngữ/framework. Backend cung cấp seed `node`, `python`, `rust`; mobile cung cấp schema và có thể nhận tham chiếu nền tảng được tạo. | Khi có stack phù hợp |
| **Templates** | `component-template.tsx`, `screen-template.dart` | Template boilerplate cho file component | Khi tạo component |
| **Domain Reference** | `orm-reference.md`, `anti-patterns.md`, v.v. | Kiến thức lĩnh vực chuyên sâu cho subtask cụ thể | Theo loại task |

---

## Tài nguyên dùng chung (_shared/)

Mọi agent dùng chung nền tảng từ `.agents/skills/_shared/`. Các tài nguyên được chia thành ba nhóm:

### Tài nguyên cốt lõi (`.agents/skills/_shared/core/`)

| Tài nguyên | Mục đích | Khi tải |
|---------|---------|---------|
| **`skill-routing.md`** | Ánh xạ từ khóa task tới agent phù hợp. Chứa bảng Skill-Agent Mapping, mẫu Complex Request Routing, Inter-Agent Dependency Rules, Escalation Rules và Turn Limit Guide. | Orchestrator và skill coordination tham chiếu |
| **`context-loading.md`** | Xác định tài nguyên cần tải cho từng loại task và độ khó. Chứa bảng ánh xạ loại task với tài nguyên theo agent và trigger tải protocol có điều kiện. | Khi workflow bắt đầu (Step 0 / Phase 0) |
| **`prompt-structure.md`** | Định nghĩa bốn thành phần mọi prompt task phải có: Goal, Context, Constraints, Done When. Có template cho agent PM, implementation và QA; liệt kê anti-pattern (bắt đầu chỉ với Goal). | Agent PM và mọi workflow tham chiếu |
| **`clarification-protocol.md`** | Định nghĩa mức độ bất định LOW/MEDIUM/HIGH và hành động tương ứng. Chứa trigger bất định, mẫu escalation, mục xác minh bắt buộc theo loại agent và hành vi subagent mode. | Khi yêu cầu chưa rõ |
| **`context-budget.md`** | Quản lý ngân sách token. Định nghĩa chiến lược đọc file (dùng `find_symbol` thay vì `read_file`), chi phí đo được của từng file tài nguyên và tải Simple (~4.000 token) so với Complex (~9.000 token), giới hạn `SKILL.md` bắt buộc (25.000 ký tự, `oma skill audit` kiểm tra), xử lý file lớn và dấu hiệu tràn ngữ cảnh. | Khi workflow bắt đầu |
| **`difficulty-guide.md`** | Tiêu chí phân loại task Simple/Medium/Complex. Định nghĩa số lượt dự kiến, nhánh protocol (Fast Track / Standard / Extended) và cách phục hồi khi đánh giá sai độ khó. | Khi bắt đầu task (Step 0) |
| **`quality-principles.md`** | 4 nguyên tắc chất lượng chung áp dụng cho mọi agent. | Khi workflow tập trung chất lượng (ultrawork) bắt đầu |
| **`vendor-detection.md`** | Protocol phát hiện môi trường runtime hiện tại (Claude Code, Codex CLI, Antigravity, Cursor, Kiro, Qwen và CLI fallback). Dùng marker host và trạng thái vendor đã cấu hình. | Khi workflow bắt đầu |
| **`session-metrics.md`** | Chấm Clarification Debt (CD) và theo dõi số liệu phiên. Định nghĩa loại sự kiện (clarify +10, correct +25, redo +40), ngưỡng (CD >= 50 = RCA, CD >= 80 = pause) và các điểm tích hợp. | Trong phiên điều phối |
| **`common-checklist.md`** | Checklist chất lượng chung áp dụng ở lần xác minh cuối của task Complex, bên cạnh checklist riêng của agent. | Bước Verify của task Complex |
| **`lessons-learned.md`** | Kho bài học phiên trước, tự tạo từ các lần vượt Clarification Debt và thử nghiệm bị loại. Tổ chức theo phần lĩnh vực, có QA Evaluation Lessons để theo dõi điểm mù của evaluator. | Tham chiếu sau lỗi và khi kết thúc phiên |
| **`api-contracts/`** | Thư mục chứa template API contract và contract đã tạo. `template.md` định nghĩa định dạng theo endpoint (method, path, schema request/response, auth, errors). | Khi lập kế hoạch công việc qua ranh giới |

### Tài nguyên runtime (`.agents/skills/_shared/runtime/`)

| Tài nguyên | Mục đích |
|---------|---------|
| **`memory-protocol.md`** | Định dạng và thao tác file memory cho CLI subagent. Định nghĩa protocol On Start, During Execution và On Completion dùng các memory tool có thể cấu hình (read/write/edit), gồm extension theo dõi thử nghiệm. |
| **`execution-protocols/claude.md`** | Mẫu thực thi dành riêng cho Claude Code, được `oma agent spawn` inject khi vendor là claude. |
| **`execution-protocols/antigravity.md`** | Mẫu thực thi Antigravity CLI (`agy`). |
| **`execution-protocols/codex.md`** | Mẫu thực thi dành riêng cho Codex CLI. |
| **`execution-protocols/commandcode.md`** | Mẫu thực thi CommandCode. |
| **`execution-protocols/grok.md`** | Mẫu thực thi Grok. |
| **`execution-protocols/kimi.md`** | Mẫu thực thi Kimi Code. |
| **`execution-protocols/kiro.md`** | Mẫu thực thi Kiro. |
| **`execution-protocols/opencode.md`** | Mẫu thực thi OpenCode extension. |
| **`execution-protocols/pi.md`** | Mẫu thực thi pi extension. |
| **`execution-protocols/qwen.md`** | Mẫu thực thi dành riêng cho Qwen CLI. |

Các protocol thực thi theo vendor được tự động inject cho agent được spawn qua CLI bằng `oma agent spawn`. Subagent native sử dụng quy tắc tích hợp của vendor đã chọn.

### Tài nguyên có điều kiện (`.agents/skills/_shared/conditional/`)

Chỉ tải khi trong quá trình thực thi có điều kiện tương ứng:

| Tài nguyên | Điều kiện trigger | Agent tải | Xấp xỉ token |
|-----------|-----------------|-----------|----------------|
| **`quality-score.md`** | Bắt đầu phase VERIFY hoặc SHIP trong workflow hỗ trợ đo chất lượng | Orchestrator (truyền vào prompt agent QA) | ~250 |
| **`experiment-ledger.md`** | Ghi thử nghiệm đầu tiên sau khi lập baseline IMPL | Orchestrator (inline, sau phép đo baseline) | ~250 |
| **`exploration-loop.md`** | Cùng một gate thất bại hai lần vì cùng vấn đề | Orchestrator (inline, trước khi spawn agent giả thuyết) | ~250 |

Tác động ngân sách: tổng khoảng 750 token nếu tải cả 3. Do tải có điều kiện, phiên thông thường tải 1-2 file, không đáng kể so với khoảng 4.000 token mà task Simple đã dùng cho `SKILL.md` và `execution-protocol.md`.

---

## Cách skill định tuyến qua skill-routing.md

Bản đồ định tuyến skill quy định cách ghép task với agent:

### Định tuyến đơn giản (một lĩnh vực)

Prompt chứa “Build a login form with Tailwind CSS” khớp các từ khóa `UI`, `component`, `form`, `Tailwind` và được định tuyến tới **oma-frontend**.

### Định tuyến yêu cầu phức tạp

Yêu cầu đa lĩnh vực tuân theo thứ tự thực thi đã định nghĩa:

| Mẫu yêu cầu | Thứ tự thực thi |
|--------------|----------------|
| “Create a fullstack app” | oma-pm -> (oma-backend + oma-frontend) song song -> oma-qa |
| “Create a mobile app” | oma-pm -> (oma-backend + oma-mobile) song song -> oma-qa |
| “Fix bug and review” | oma-debug -> oma-qa |
| “Design and build a landing page” | oma-design -> oma-frontend |
| “I have an idea for a feature” | oma-brainstorm -> oma-pm -> agent phù hợp -> oma-qa |
| “Do everything automatically” | oma-orchestration (nội bộ: oma-pm -> agent -> oma-qa) |

### Quy tắc phụ thuộc giữa agent

**Có thể chạy song song (không phụ thuộc):**
- oma-backend + oma-frontend (khi API contract đã định nghĩa)
- oma-backend + oma-mobile (khi API contract đã định nghĩa)
- oma-frontend + oma-mobile (độc lập với nhau)

**Phải chạy tuần tự:**
- oma-brainstorm -> oma-pm (thiết kế trước lập kế hoạch)
- oma-pm -> mọi agent khác (lập kế hoạch trước)
- agent triển khai -> oma-qa (review sau triển khai)
- oma-backend -> oma-frontend/oma-mobile (khi chưa có API contract)

**QA luôn cuối cùng**, trừ khi người dùng yêu cầu review riêng các file.

---

## Toán tiết kiệm token {#token-savings-math}

Các số liệu này được đo từ cây skill, không ước lượng thủ công. Có thể dẫn xuất lại bất cứ lúc nào:

```bash
bun scripts/measure-skill-context.ts --skills oma-pm,oma-backend,oma-frontend,oma-mobile,oma-qa
```

Số token là **xấp xỉ** (byte ÷ 4, tỷ lệ gần đúng cho Markdown tiếng Anh). Bảng và fenced code thường tokenize kém hơn, nên các con số này hơi thấp; nếu cần con số chính xác, hãy dùng tokenizer thực cho model đích.

### Các tầng tải

Mỗi tầng là trạng thái agent thực sự đạt được, theo [`context-loading.md`](https://github.com/first-fluke/oh-my-agent/blob/main/.agents/skills/_shared/core/context-loading.md):

| Tầng | Nội dung trong ngữ cảnh |
|------|--------------------|
| `routed` | Chỉ SKILL.md |
| `simple` | + `execution-protocol.md` |
| `medium` | + tài nguyên được ánh xạ cho task, khi file đó tồn tại |
| `complex` | + tài nguyên được ánh xạ và tham chiếu stack khi project cung cấp |
| `all` | `SKILL.md` + mọi file tài nguyên, là **giới hạn trên**, không phải mode chọn được |

Với skill backend và mobile, `/stack-set` có thể tạo tham chiếu theo project dưới `stack/`. Checkout mới không có thư mục stack đã tạo, nên dòng `complex` trong bảng dưới được đo dựa trên seed `variants/` đã ship mà quá trình tạo sẽ điều chỉnh, đây là proxy kích thước chứ chưa phải file agent tải.

### Một phiên 5 agent (pm, backend, frontend, mobile, qa)

| Tầng | Token | Tỷ lệ của giới hạn | Tiết kiệm |
|------|-------:|-----------------:|--------:|
| `routed` | 11,497 | 15.7% | 84.3% |
| `simple` | 17,923 | 24.4% | 75.6% |
| `medium` | 19,125 | 26.1% | 73.9% |
| `complex` | 39,156 | 53.4% | 46.6% |
| `all` | 73,355 | 100% | — |

Vì vậy task Simple hoặc Medium trên năm agent giữ khoảng **17-19K token** ngữ cảnh skill thay vì giới hạn 73K, còn task Complex giữ khoảng **38K**, mức tiết kiệm khoảng 74-76% ở công việc thường và giảm còn khoảng 47% khi kéo theo tham chiếu stack. Với model có ngữ cảnh 128K, còn khoảng 110K trống cho công việc Simple/Medium và 90K cho Complex.

:::note Hãy xem `all` là giới hạn, không phải lựa chọn thay thế
Không runtime nào tải mọi tài nguyên ngay từ đầu: skill được hiển thị qua `description`, thân skill được đọc khi định tuyến và tài nguyên được đọc khi task cần. `all` là giới hạn trên về chi phí tiềm tàng của skill, vì vậy phần trăm được nêu là “tiết kiệm” chứ không phải so sánh với một cấu hình thực tế.
:::

Tầng 1 là mức sàn và không hề nhỏ: trong 33 skill đã cài, `SKILL.md` có khoảng 1.275-5.489 token (trung vị ~2.631). Mức sàn này giới hạn khoản tiết kiệm của progressive disclosure, vì khi cả năm agent đều được định tuyến, riêng tầng `routed` đã chiếm 15% giới hạn.

---

## Tải tài nguyên theo độ khó task

Tài liệu hướng dẫn độ khó phân loại task thành ba mức, quyết định lượng tài nguyên tầng 2 được tải:

### Simple (dự kiến 3-5 lượt)

Thay đổi một file, yêu cầu rõ ràng, lặp lại mẫu có sẵn.

Tải: chỉ `execution-protocol.md`. Bỏ qua phân tích, tiến thẳng tới triển khai với checklist tối thiểu.

### Medium (dự kiến 8-15 lượt)

Thay đổi 2-3 file, cần một số quyết định thiết kế, áp dụng mẫu cho domain mới.

Tải: `execution-protocol.md` cùng tài nguyên Medium được ánh xạ nếu file đó tồn tại. Dùng protocol Standard với phân tích ngắn và xác minh đầy đủ.

### Complex (dự kiến 15-25 lượt)

Thay đổi từ 4 file, cần quyết định kiến trúc, giới thiệu mẫu mới hoặc phụ thuộc agent khác.

Tải: `execution-protocol.md` cùng tài nguyên được ánh xạ và tham chiếu `tech-stack.md` / `snippets.md` khả dụng. Dùng protocol Extended với checkpoint, ghi tiến độ giữa chừng và xác minh đầy đủ kèm `common-checklist.md`.

---

## Bản đồ task context-loading (theo agent)

Tài liệu context-loading cung cấp ánh xạ chi tiết giữa loại task và tài nguyên. Dưới đây là các ánh xạ chính:

### Backend agent

| Loại task | Tài nguyên bắt buộc |
|-----------|-------------------|
| Tạo CRUD API | `variants/{node,python,rust}/snippets.md` tương ứng khi có |
| Xác thực | `snippets.md` của variant tương ứng + `tech-stack.md` khi có |
| Database migration | `snippets.md` của variant tương ứng khi có |
| Tối ưu hiệu suất | `orm-reference.md` và mọi example tương ứng skill cung cấp |
| Sửa mã hiện có | Provider code-intelligence của project và resource thực thi liên quan |

### Frontend agent

| Loại task | Tài nguyên bắt buộc |
|-----------|-------------------|
| Tạo component | snippets.md + mẫu component hiện có của project |
| Triển khai form | snippets.md (form + Zod) |
| Tích hợp API | snippets.md (TanStack Query) |
| Styling | tailwind-rules.md |
| Bố cục page | snippets.md (grid) |

### Design agent

| Loại task | Tài nguyên bắt buộc |
|-----------|-------------------|
| Tạo design system | reference/typography.md + reference/color-and-contrast.md + reference/spatial-design.md + design-md-spec.md |
| Thiết kế landing page | reference/component-patterns.md + reference/motion-design.md + prompt-enhancement.md |
| Audit design | checklist.md + anti-patterns.md |
| Xuất design token | design-tokens.md |
| Hiệu ứng 3D / shader | reference/shader-and-3d.md + reference/motion-design.md |
| Review accessibility | reference/accessibility.md + checklist.md |

### QA agent

| Loại task | Tài nguyên bắt buộc |
|-----------|-------------------|
| Review bảo mật | checklist.md (phần Security) |
| Review hiệu suất | checklist.md (phần Performance) |
| Review accessibility | checklist.md (phần Accessibility) |
| Audit đầy đủ | checklist.md (full) + self-check.md |
| Chấm điểm chất lượng | quality-score.md (có điều kiện) |

---

## Thành phần prompt của Orchestrator

Khi orchestrator soạn prompt cho subagent, nó chỉ đưa vào các tài nguyên liên quan task:

1. Phần Core Rules của `SKILL.md` agent
2. `execution-protocol.md`
3. Tài nguyên phù hợp loại task (theo mapping)
4. `error-playbook.md` (luôn đưa vào vì recovery cần thiết)
5. Memory Protocol (chế độ CLI)

Cách soạn mục tiêu này tránh tải tài nguyên không cần thiết, dành tối đa ngữ cảnh cho công việc thực tế.

---

## Clarification debt và số liệu phiên (đào sâu)

Clarification Debt (CD) đo chi phí của yêu cầu chưa rõ trong một phiên. Orchestrator theo dõi mỗi lần người dùng sửa hướng và chấm điểm:

| Loại sự kiện | Điểm | Mô tả |
|------------|--------|-------------|
| `clarify` | +10 | Câu hỏi làm rõ đơn giản (dự kiến với bất định MEDIUM) |
| `correct` | +25 | Hiểu sai ý định khiến hướng phải thay đổi |
| `redo` | +40 | Vi phạm phạm vi/charter cần rollback và bắt đầu lại |
| `blocked` | +0 | Agent dừng đúng lúc và hỏi (hành vi tốt, không bị phạt) |

**Hệ số:** Không đọc charter (+15), vi phạm allowlist (+20), lặp lại cùng lỗi (x1.5).

**Ngưỡng và cưỡng chế:**
- **CD >= 50** → Bắt buộc thêm RCA vào `lessons-learned.md`
- **CD >= 80** → Dừng phiên, người dùng phải đặc tả lại yêu cầu
- **`redo` >= 2** → Orchestrator tạm dừng và yêu cầu xác nhận phạm vi rõ ràng
- **CD >= 30 trong 3 phiên liên tiếp của cùng agent** → Review template prompt của agent

Log phiên được duy trì tại `.agents/state/memories/session-metrics.md` với các dòng theo sự kiện (turn, agent, event type, points, detail) và phần tóm tắt.

---

## Độ chính xác evaluator và tinh chỉnh QA

Agent QA cải thiện qua các lỗi đánh giá được theo dõi. Khác với CD (thời gian thực), Evaluator Accuracy (EA) được đánh giá hồi cứu. Phần lớn lỗi được phát hiện sau khi phiên kết thúc.

**Loại sự kiện EA:**

| Sự kiện | Điểm | Khi phát hiện |
|---------|------|---------------|
| `false_negative` | +30 | Phiên sau hoặc production (lỗi QA bỏ sót) |
| `false_positive` | +15 | Trong phiên (agent triển khai tranh luận thành công phát hiện QA) |
| `severity_mismatch` | +10 | Trong phiên hoặc review phiên sau (gán severity sai) |
| `missed_stub` | +20 | Xác minh runtime phát hiện tính năng chỉ hiển thị |
| `good_catch` | -10 | QA phát hiện lỗi khó thấy (tín hiệu thưởng tích cực) |

**EA tính theo cửa sổ 3 phiên cuốn chiếu.** Ngưỡng:
- **EA >= 30** → Gợi ý tinh chỉnh: review các event EA đã tích lũy để tìm lỗi đánh giá lặp lại
- **EA >= 50** → Bắt buộc tinh chỉnh: cập nhật execution-protocol.md của QA
- **`false_negative` >= 3** trong cửa sổ → Thêm pattern phát hiện vào checklist.md của QA
- **`good_catch` >= 5** trong cửa sổ → Khái quát pattern thành công vào `common-checklist.md`

Khi vượt ngưỡng, review các event EA tích lũy, phân loại lỗi, cập nhật checklist/execution protocol của QA và xác minh trong 3 phiên tiếp theo.

---

## Phân rã sprint cho task Complex

Task Complex (từ 4 file, có quyết định kiến trúc) dùng thực thi theo sprint thay vì một lượt dài:

1. **Phân rã** thành 2-4 sprint tập trung chức năng, mỗi sprint độc lập và có thể test
2. **Mục tiêu** 5-8 lượt mỗi sprint
3. **Cổng sprint** sau mỗi sprint:
   - Sản phẩm sprint hoàn tất?
   - Lint/test pass?
   - Nếu sprint tốn gấp 2 lượt dự kiến → ghi checkpoint, báo người dùng
4. Chuyển sprint tiếp theo khi cổng pass

**Ví dụ:** Task “JWT auth + CRUD API + tests” tách thành:
- Sprint 1: Model User + endpoint auth (register/login)
- Sprint 2: endpoint CRUD + xác thực
- Sprint 3: Test + xử lý lỗi

**Phục hồi khi đánh giá sai độ khó:** Nếu task bắt đầu là Simple nhưng hóa ra phức tạp hơn, agent nâng protocol lên Medium hoặc Complex giữa chừng và ghi lại thay đổi vào tiến độ.
---

## Giao thức reset ngữ cảnh

Agent chạy lâu sẽ giảm chất lượng khi ngữ cảnh đầy dần. Orchestrator (không phải chính agent) theo dõi việc này và kích hoạt reset.

**Điều kiện trigger (Orchestrator kiểm tra khi giám sát):**

| Điều kiện | Phát hiện | Hành động |
|-----------|-----------|-----------|
| Hết ngân sách lượt | Agent đã dùng >= 80% số lượt dự kiến VÀ tiêu chí chấp nhận hoàn thành < 50% | Reset ngữ cảnh |
| Đứng tiến độ | Không cập nhật file progress trong >= 3 chu kỳ giám sát liên tiếp | Reset ngữ cảnh |
| Đầu ra hời hợt | File kết quả chứa marker stub hoặc placeholder TODO | Spawn lại với chỉ dẫn tường minh |

**Quy trình reset:**
1. **Checkpoint:** Lưu trạng thái hiện tại của agent (mục đã hoàn thành, phần còn lại, quyết định chính)
2. **Kết thúc:** Dừng lượt agent hiện tại
3. **Spawn lại:** Bắt đầu lượt agent mới với checkpoint làm ngữ cảnh
4. **Tiếp tục:** Lượt mới đọc checkpoint và chỉ tiếp tục phần còn lại

Với agent độc lập (không có Orchestrator), Sprint Gate trong `difficulty-guide.md` là cơ chế an toàn tương ứng. Nếu một sprint tốn gấp 2 số lượt dự kiến, agent ghi checkpoint và báo người dùng.
