---
title: "日常技术笔记 (RSS/Excel)"
description: "碎片化的技术记录：RSS 工作流搭建、Excel 数值验证技巧，以及一些值得记下来的小工具和方法论。"
pubDate: 2025-02-10
tags: ["工具", "效率", "技术笔记"]
draft: false
---

## 关于这篇笔记

这是一篇持续更新的技术笔记合集，记录我在日常工作和探索中遇到的值得记录的内容。没有完整的叙事，只有实用的片段。

---

## RSS 工作流

### 为什么还在用 RSS？

在信息爆炸的时代，RSS 是少数几个让我保持**主动订阅**而非被动推送的工具。我不想让算法决定我看什么。

**当前的 RSS 工具链：**

```
信息源 → FreshRSS (自托管) → Reeder (阅读) → Obsidian (摘录)
```

### 值得订阅的技术 RSS 源

- Astro 官方博客：框架更新第一手
- Simon Willison's Weblog：AI 工具链实践
- Hacker News (Best)：技术社区热点

### 一个小技巧

FreshRSS 支持 API，可以用 n8n 或自写脚本把感兴趣的文章自动发到 Telegram 频道，实现二次筛选。

---

## Excel 数值策划技巧

### 数值平衡的核心模型

在游戏数值设计中，Excel 依然是最灵活的原型工具。几个高频用到的模式：

**1. 成长曲线公式**

```excel
=base * POWER(growth_rate, level - 1)
```

指数增长的基础公式。通过调整 `growth_rate`（通常 1.05~1.15 之间）控制曲线斜率。

**2. 数据验证 + 条件格式**

对数值范围做即时可视化验证：
- 超出预期范围 → 红色高亮
- 在合理区间 → 绿色
- 边界值 → 黄色警告

**3. 用 OFFSET 做动态引用**

在多职业/多难度的数值表里，`OFFSET` 比 `VLOOKUP` 更灵活，可以构建真正的二维查找。

### 数值测试的自动化想法

最近在考虑用 Python 脚本接管 Excel 的重复测试工作：

```python
import openpyxl
import pandas as pd

# 读取数值表
wb = openpyxl.load_workbook('balance_sheet.xlsx')
ws = wb.active

# 批量模拟战斗结果
# ... (待完善)
```

这个脚本可以模拟大量随机战斗，输出胜率热力图，比手动调试快得多。

---

## 其他零散笔记

### 关于 Obsidian 与 Astro 的协同

这个博客使用 Astro 的 Content Collections，本地 Markdown 文件直接对应博客文章。我的写作流程是：

1. 在 Obsidian 里起草（本地 .md 文件）
2. 整理后复制到 `src/content/blog/`
3. 运行 `npm run build` 发布

这个流程的优点是：不依赖任何 CMS，文章永久在本地。

### 一个让我省了很多时间的 VS Code 插件

`Astro` 官方插件（by Astro）：支持 `.astro` 文件的语法高亮和 TypeScript 类型检查，必装。

---

*最后更新：2025-02-10 | 下次计划补充：Playwright 自动化测试笔记*
