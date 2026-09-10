---
title: Bắt đầu nhanh
description: Con đường ngắn nhất từ một dự án trống đến prompt oh-my-agent đã được xác minh, kèm kết quả mong đợi và các bước khôi phục.
---

# Bắt đầu nhanh

Dùng trang này để xác nhận harness hoạt động trước khi đọc tài liệu tham khảo đầy đủ. Bạn cần một thư mục dự án và ít nhất một AI CLI hoặc IDE được hỗ trợ. Trình cài đặt có thể thiết lập `bun`, `uv`, Serena và CUE trên macOS, Linux hoặc Windows; tích hợp host đã chọn là bắt buộc cho prompt đầu tiên, còn tích hợp provider và trình duyệt là tùy chọn.

## 1. Cài đặt project harness

Từ thư mục dự án, chạy bootstrap installer:

```bash
curl -fsSL https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.sh | bash
```

Trong Windows PowerShell, chạy:

```powershell
irm https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.ps1 | iex
```

Thiết lập tương tác sẽ hỏi ngôn ngữ phản hồi, các CLI vendor, capability provider, model preset, project skill preset và stack variant. Ở lần chạy đầu tiên, hãy giữ giá trị mặc định, chọn vendor bạn đang dùng và chọn project preset gần với repository nhất.

Nếu đã có `bun`, dùng trực tiếp installer:

```bash
bunx oh-my-agent@latest
```

Bootstrap script cài đặt vào dự án hiện tại. Dùng `oma install --global` khi muốn cài ở cấp HOME; đọc [Cài đặt](./installation.md) trước khi kết hợp cài đặt theo dự án và cài đặt toàn cục.

## 2. Kiểm tra kết quả

Chạy health check từ cùng thư mục dự án:

```bash
oma doctor
```

Thành công nghĩa là tích hợp vendor đã chọn và các file `.agents/` đã sẵn sàng. Các tích hợp MCP, trình duyệt, bộ nhớ hoặc code intelligence tùy chọn có thể được báo dưới dạng cảnh báo; chúng chỉ cần cho các task sử dụng chúng. Dùng `oma doctor --profile` để xem model và CLI đã resolve cho từng vai trò agent chuẩn.

Nếu không tìm thấy lệnh, CLI đã được cài bên ngoài `PATH` hiện tại; mở shell mới hoặc thêm thư mục bin của package manager. Nếu `oma doctor` báo cấu hình không hợp lệ, sửa trường được nêu rồi chạy lại. Không xóa `.agents/oma-config.yaml` để khôi phục: đây là cấu hình do người dùng sở hữu và giữ lại thiết lập qua các lần cập nhật.

## 3. Chạy một task nhỏ

Mở repository trong AI tool đã cấu hình và mô tả một thay đổi độc lập:

```text
Add a validation message to the existing email field. Follow the project's current form and test conventions. Done when the invalid-email case is covered by a focused test.
```

Khi keyword hook được bật cho host đã chọn, nó có thể kích hoạt workflow phù hợp. Host hoặc workflow đã chọn thực hiện skill routing, vì vậy prompt tùy ý của host không đảm bảo có hook, skill cụ thể hoặc `CHARTER_CHECK`. Execution contract vẫn phải kiểm tra quy ước của repository, chỉ thực hiện thay đổi trong phạm vi và báo cáo kết quả xác minh. File và lệnh chính xác phụ thuộc vào dự án; prompt trên chỉ là ví dụ.

Với task đi qua ranh giới API và UI, hãy chọn rõ `/work` hoặc `/orchestrate`. Với một domain duy nhất, tiếp tục với [Thực thi một skill](../guide/single-skill.md). [Hướng dẫn sử dụng](../guide/usage.md) có các ví dụ dài hơn.

## 4. Biết các mặc định trước khi mở rộng

OMA khởi động với `model_preset: auto`, Serena cho code intelligence, Agent Memory cho semantic memory, native web search và telemetry bị tắt. Serena dùng transport dùng chung `bridge` và tự động cập nhật nếu không được cấu hình khác. Browser DevTools MCP là tùy chọn bật; thiết lập tương tác mới sẽ đề xuất Aside trước. Xem [Các mặc định quan trọng](./important-defaults.md) để biết hệ quả và các khóa ghi đè.

Nếu managed task bị dừng, bắt đầu bằng `oma agent status <session-id> [agent-id]`, sau đó kiểm tra receipt trong `.agents/state/agent-runs/` và injected structured claim path. Các bản ghi đó cho biết run, task, workspace, exit code và trạng thái xác minh. File `result-*.md` và `progress-*.md` dễ đọc trong `.agents/state/memories/` bổ sung ngữ cảnh nếu có. Chỉ chạy lại command thất bại nhỏ nhất sau khi xác nhận run không còn hoạt động. Persistent workflow vẫn hoạt động cho đến khi hoàn tất hoặc bạn nói `workflow done`; xem [Workflows](../core-concepts/workflows.md#persistent-mode-mechanics) để biết cách khôi phục state file.

## Bước tiếp theo

- [Các mặc định quan trọng](./important-defaults.md) về precedence, provider và lựa chọn khôi phục
- [Cài đặt](./installation.md) về preset, thiết lập vendor, cài đặt toàn cục và cập nhật
- [Agents](../core-concepts/agents.md) về 33 skill package và vai trò dispatch
- [Workflows](../core-concepts/workflows.md) về lập kế hoạch, thực thi song song, QA và chế độ persistent
