# dsh-dev-history · AGENTS.md

站点 = 静态骨架 + JSON 数据。改任何文件前遵守以下约束。

## 架构

- `site/index.html` 只是骨架，不含文案。
- 页面脚本（`site/pages/*.js`、`site/js/app.js`）引号内不得出现中文文案。全部静态文字来自 JSON：
  - chrome（标签、导航、状态词、句式模板、主题规则）→ `content/static.json`；
  - 编辑句（说明、导语、尾注）→ `content/narrative.json`。
- 可变值用 `{占位符}`（支持中文键），运行时由 `fill()` 从提取元数据填充。路径文本中的花括号（含逗号）不会被误替换。
- 数据不内嵌快照：近期列表、窗口统计一律运行时从 `window.DSH_ARCH` 派生。
- 名称（阶段/区域/导航）是信息架构，生成流程不得改名。

## 门禁

- `python3 tools/build.py` 内置硬编码文案检查：尽力而为，报告但不阻断；`pages/recent.js` 豁免。

## 数据与流程

- 只收录 `implemented/` + `archived/` 的 architecture 类；`proposed/`、`rejected/` 不覆盖（完整口径见 README）。
- 改叙事 → `content/narrative.json`；改 chrome → `content/static.json`；上游有新笔记 → `extract.py` + `build.py`。
- 上线 = push main + 重发 gh-pages（`deploy/gh-pages.sh`）。`deploy.yml` 仅手动触发。
- AI 叙事分级：新月份自动合入；已有月份的改写须人工 `--apply`。
- 原型不进 main；定稿折叠进正式页后弃置。
- 站点文案不得包含会话上下文（同步状态、落后提交数等操作信息）。
