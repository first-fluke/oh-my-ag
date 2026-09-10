---
title: "指南：Codex 钩子信任"
sidebar_label: Codex 钩子信任
description: "说明 Codex 钩子为什么要先由你审阅一次才会运行、更新时会发生什么，以及 oh-my-agent 会为生成的 Codex 子进程自动处理哪些事项。"
---

# 指南：Codex 钩子信任

oh-my-agent 安装到项目时，会写入供应商原生的钩子配置，其中包括 Codex CLI 使用的 `.codex/hooks.json`。与 Claude Code 不同，Codex 不会自动运行这些钩子。它会通过首次使用信任（TOFU）机制保护每个非托管命令钩子：钩子只有在你审阅并启用一次后才会运行。

这是 Codex 侧的安全机制，不是 oh-my-agent 的限制。本指南说明你需要完成的一次性步骤、oh-my-agent 更新时会发生什么，以及它会自动为你处理哪些事项。

---

## 一次性步骤：在 Codex 中审阅钩子

在 Codex 尚未见过的项目中，`oma`（安装）、`oma link` 或 `oma update` 写入 `.codex/hooks.json` 后，钩子**还不会**运行。你必须打开 Codex 并审阅一次：

1. 在 Codex CLI 中打开项目。
2. 运行 `/hooks`，打开钩子浏览器（TUI）。
3. 审阅列出的钩子并启用它们。

在完成这一步前，钩子会保持不受信任并被静默跳过。这就是 oh-my-agent 每次创建或修改 `.codex/hooks.json` 时打印提示的原因：

```
Codex hooks installed/updated — run codex and use /hooks to trust them (untrusted hooks do not run)
```

打开 Codex 前先验证生成的文件：

```bash
test -s .codex/hooks.json && echo "Codex hooks are installed"
oma link codex
```

预期结果是先出现安装/更新提示，然后在 Codex 的 `/hooks` 浏览器中看到这些钩子。`oma link codex` 会协调生成的文件，但不会替你做一次性信任决定。

**注意：**`--dangerously-bypass-hook-trust` 在这里没有帮助。它的警告（“已启用的钩子可能未经审阅就运行”）表示它只能绕过对已启用钩子的审阅；从未审阅过的钩子仍不会运行。首次启用钩子的唯一方式是使用 `/hooks` 浏览器。

在底层，Codex 会在 `~/.codex/config.toml` 的 `[hooks.state]` 条目中保存你的决定，该条目按钩子文件路径、事件、区块和 hook 标识；其中包含 `enabled` 标志和命令字符串的 `trusted_hash`。

---

## 更新时会发生什么

信任钩子后，不需要在每次更新时重复这一步：

- **重新运行 `oma link` 或 `oma update` 会保留信任**，前提是钩子命令字符串没有改变。Codex 会将保存的哈希与当前命令比较；匹配时钩子仍受信任。
- **如果未来版本的 oh-my-agent 修改了钩子命令字符串**，哈希将不再匹配，该钩子会静默恢复为不受信任。你会再次看到安装器提示，并需要通过 `/hooks` 重新信任。

因此，审阅步骤只在首次使用时需要，或者在实际改变钩子的版本发布后再次需要。

---

## oh-my-agent 会自动为你处理的事项

当 oh-my-agent 自行生成 Codex 子进程时，例如通过 `oma agent spawn` 调度跨供应商智能体，它会自动传递 `--dangerously-bypass-hook-trust`。这样，自己的已审查钩子可以在更新之间运行，不会要求你手动重新信任。

此标志**只**应用于由 oh-my-agent 生成的 Codex 进程。它绝不会写入你的 `~/.codex/config.toml` 或项目配置，因此不会影响你自行启动的 Codex 会话。

---

## 不需要 `[features] hooks` 标志

旧版设置要求在 Codex 配置中启用 `[features] hooks = true`。自 Codex CLI 约 0.14x 起，钩子已经稳定并默认启用，因此现在不再需要此项。oh-my-agent 不再写入它，并会在发现已弃用的 `child_agents_md` 标志时主动从 Codex 配置中移除它。

---

## 总结

| 情况 | 你要做什么 |
|:----------|:------------|
| 首次安装或项目中首次出现 `.codex/hooks.json` | 打开 Codex，运行 `/hooks`，启用这些钩子一次 |
| `oma update` 且钩子命令未改变 | 无需操作，信任会保留 |
| `oma update` 改变了钩子命令 | 再次运行 `/hooks` 重新信任（安装器会打印提示） |
| oh-my-agent 生成的 Codex 子进程 | 无需操作，会自动应用绕过标志 |
