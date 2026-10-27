# dsh-dev-history · DeepSeek Harness 演化史

展示 [DeepSeek Harness](../)（`dsh`）如何演化的独立小项目。核心是一条**markdown → 结构化数据 → 静态骨架**的工作流：仓库 `.agents/notes/` 里 architecture 类 Agent Notes（结构性设计决策，2026-06-11 建仓次日起）是元数据，`content/narrative.json` 与 `content/static.json`（骨架固定文本、导航标签）是站点的文本元数据（逐月叙事、架构区域、精选决策注释、站点文案），构建脚本把两者编译为结构化 JS；`site/index.html` 只是骨架，运行时填充。站点以 archify 生成的[整体架构图](site/dsh-architecture.html)为枢纽，按架构区域铺开每块能力的决策史。

```
dsh 笔记 (.agents/notes/**.md) ─┐
                                ├─ tools/extract.py ── data/arch-notes.json ─┐
content/narrative.json ───────────┴──────────────── tools/build.py ──────────┴─ site/js/*.js（结构化数据）
                                                                  │
                                              site/index.html（骨架）← 运行时按路由填充
```

## 站点（site/）

双击 [site/index.html](site/index.html) 即可使用（file:// 下脚本注入加载可用，无需服务器），或任意静态服务器。

| 页面 | 内容 |
|---|---|
| 总览 | 数据口径、每周提出/封存节奏图、逐月主题、开发的地基（被后续决策引用最多的笔记） |
| 架构 | 嵌入整体架构图；按图上四个区域（Cordis 插件框架 / Profile 与 Bundle / Session 日志 / Capability Seam）铺开各自演进，条目深链账簿 |
| 账簿 | 全部决策按月分组，可搜索（中英文），每条展开完整段落：动机 / 决策 / 备选与落选原因 / 代价与收益 / 承接的基础 |
| 阶段 | 逐月叙事与承重决策 |
| 体例 | Agent Notes 制度说明与数据口径 |

状态标记：● 现行（implemented）· ◦ 已封存（archived，永久冻结）· ◇ 仅存在于远端（本地未同步）。

## 数据口径

**收录范围（刻意收窄为"决策"）**：站点只收录 `implemented/` + `archived/` 两个生命周期的 architecture 类——即已经做出并落地（或已封存）的结构性决策。**不收录**另外两个生命周期：

- `proposed/`：正在评审中的提案，尚无结论，且数据形态不同（`## Proposal` / `## Acceptance criteria` / `## Risks` 章节而非 `## Decision`）；
- `rejected/`：被否决且仍值得留存的记录——它们是"差点走错的路"的警示，按制度只在警示价值存续期间保留，之后会被删除；

两者将来可作为独立维度加入站点（状态词表加"提案 / 已否决"两档，`tools/extract.py` 增加对应目录读取即可），当前版本明确不覆盖。

其余口径：

- 只计 `.agents/notes/{archived,implemented}/architecture/` 的**英文原件**；中文全文取自每篇笔记的 `.zh.md` 维护副本（双语对照契约）。
- 远端 `origin/master` 上存在而本地缺失的笔记（◇ 标记）经 `git show` 补齐。
- 动机/决策/备选/代价四个章节以**原始 Markdown 全文**提取，前端用内嵌的 [marked](https://github.com/markedjs/marked)（`site/js/vendor/`，35KB，无 CDN 依赖）渲染，保留标题层级、列表、表格与代码块。
- 笔记内部链接 `[..](2026-..-..md)` 自动转为账簿深链接；站外链接新窗口打开；指向本站无法解析的仓库文件的链接降级为代码文本。
- 交叉引用同时汇总为「承接的基础」与被引用计数。

## 更新数据

```sh
git fetch origin            # 可选：同步远端，补齐 ◇ 笔记
python3 tools/extract.py    # 仓库 -> data/arch-notes.json（可重复运行）
python3 tools/build.py      # data + content -> site/js/{data,data.zh,content,static}.js（刷新 ?v=）
```

依赖：**站点运行零依赖**（无框架、无 CDN、无字体请求，可离线打开）；构建与更新仅需 Python 3 标准库 + git。`tools/extract.py` 在远端不可达时自动退化为仅本地口径。

## 部署到 GitHub Pages

`site/` 即部署单元（纯静态、相对路径、子路径可用）。两种方式与注意事项见 [deploy/DEPLOY.md](deploy/DEPLOY.md)：Actions 工作流（`deploy/github-pages.yml`，复制进发布仓库）或 gh-pages 分支一键脚本（`deploy/gh-pages.sh`）。`tools/` 与 `data/` 是构建期工具，不需要上传。

## 目录

```
dsh-dev-history/
├─ README.md            本文件
├─ dsh-dev-history-workflow.html  构建发布工作流图（archify 生成，仅仓库留存，不在站点前端展示）
├─ tools/extract.py     提取：仓库笔记 -> data/arch-notes.json（含周桶与统计）
├─ tools/build.py       组装：data + content/narrative.json -> site/js/*.js
├─ content/{narrative,static}.json 文本元数据（编辑内容 + 骨架固定文本与导航）
├─ data/arch-notes.json 提取产物（中间数据，可重建）
├─ deploy/              GitHub Pages 部署：workflow + gh-pages 脚本 + 说明
└─ site/                静态站点（index.html + css + js + pages + 架构整图），即部署单元
```

## 嵌入的架构图

`site/dsh-architecture.html` 由 [archify](../../.archify/architecture-dsh-overview-20261027-050451/) 生成（源文件在仓库 `.archify/` 下），复制进站点以支持 file:// 内嵌；如需更新，重新导出后覆盖该文件。
