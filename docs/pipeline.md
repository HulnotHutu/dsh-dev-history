# 数据流水线与契约

本文描述从 dsh 仓库的 Agent Notes 到站点产物的完整数据流，以及每一层 JSON 的字段契约。命令与 CI 概览见 [README](../README.md)，部署细节见 [deployment.md](deployment.md)。

## 总览

```text
dsh 仓库 .agents/notes/{implemented,archived}/architecture/*.md
        │  tools/extract.py
        ▼
data/arch-notes.json                （唯一数据快照，提交入库）
        │  tools/build.py           ＋ content/narrative.json ＋ content/static.json
        ▼
site/js/{data,data.zh,content,static}.js   （四个 window 全局）
        │  site/index.html 骨架 ＋ site/pages/*.js ＋ site/js/app.js
        ▼
静态站点（gh-pages 分支发布）
```

设计约束：`index.html` 不含任何文案，页面渲染所需的一切文本都来自 JSON；数据不内嵌快照数字（篇数等统计一律由提取元数据在运行时填充）。

## extract.py：笔记 → arch-notes.json

从仓库根（自动向上层查找含 `.agents/notes/archived` 的目录）读取 architecture 类笔记的英文原件与 `.zh.md` 中文副本。只收 `implemented/` 与 `archived/` 两个生命周期；`proposed/` 与 `rejected/` 不在收录范围。

远端补齐：本地缺失而远端 `origin/master` 存在的笔记用 `git show` 读取（◇ 仅远端）；远端不可达时优雅降级，`remoteHead` 相关字段留空，其余照常。

每条笔记的字段：

| 字段 | 含义 |
| --- | --- |
| `d` | 决策提出日期（路径中的 yyyy-mm-dd） |
| `n` | slug（文件名去日期与扩展名） |
| `s` | 生命周期：`a` 已封存 / `i` 现行 / `r` 仅远端 |
| `path` | 仓库内原始路径 |
| `en` / `zh` | 英文原件与中文副本的章节镜像，`zh` 可为 null |

章节镜像内字段：`t` 标题、`p` 问题/动机、`dc` 决策、`cs` 代价与收益、`alt` 备选与落选原因、`ar` 封存日期、`out` 指向本类其他决策的引用 slug 列表（封存章节解析，上限 12 条）。章节解析容忍多种标题写法（问题/背景/动机、决策/方案、后果/影响等）；提取可重复运行，输出幂等。

`meta` 元数据：`first`/`last`（决策日期跨度）、`weekStart`（节奏图周起点）、`localImplLatest`（本地现行笔记最新日期）、`remoteHead`/`remoteHeadLog`（远端 master 最新提交日期与提交信息）、`archived`/`active`/`remoteOnly`/`total`/`zhCount`（计数）、`sweeps`（大扫除 `[{"date","count"}]`）、`allClasses`（全库各生命周期计数，供体例页口径）。

顶层 `weeks`：每周新提出 `p` 与封存 `s` 的计数数组，供总览节奏图。

## build.py：三份 JSON → 四个运行时全局

合并 `data/arch-notes.json`、`content/narrative.json`（编辑性叙事）、`content/static.json`（骨架固定文本），输出：

| 产物 | 全局变量 | 内容 |
| --- | --- | --- |
| `site/js/data.js` | `DSH_ARCH` | notes + weeks + meta |
| `site/js/data.zh.js` | `DSH_ARCH_ZH` | 中文镜像，按 slug 索引 |
| `site/js/content.js` | `DSH_ARCH_CONTENT` | narrative.json 透传 |
| `site/js/static.js` | `DSH_ARCH_STATIC` | static.json 透传 |

build 同时做三件事：

1. **版本戳**：刷新 `index.html` 中全部 `.css/.js` 的 `?v=` 参数（取构建时刻），保证 gh-pages 的 CDN 缓存失效。
2. **静态键校验**：`static.json` 必须包含 `站名`、`全称`、`眉标`、`描述模板`、`导航`、`无脚本提示` 六个必需键，缺失即失败（fail loud）。
3. **文案门禁（尽力而为）**：扫描 `site/pages/*.js` 与 `app.js` 引号内的中文字符串（剥除注释与下标访问后），提示应迁往 `static.json`（chrome）或 `narrative.json`（编辑句）的残留文案。只警告不阻断；`recent.js` 豁免。

## 前端运行时

`index.html` 是纯骨架：空的标题/副标题/页脚槽位、空导航、noscript 提示。`app.js` 负责骨架填充、哈希路由（`#/页面?q=&m=&v=`，锚点与过滤参数直达）与页面脚本按需注入（带版本戳防缓存）。每个页面脚本向 `window.DSH_ARCH.pages` 注册 render，通过 `api` 对象取数：

- `api.data` / `api.zh`：数据与中文镜像；
- `api.static` / `api.site`：chrome 文案与编辑叙事；
- `api.fill(str, vars)`：填充文案中的 `{占位符}`，页面现算值 `vars` 优先，提取元数据兜底，未知占位符替换为空串（支持中文键如 `{w14d短}`）；
- `api.esc` / `api.md`：HTML 转义与 Markdown 渲染（内嵌 marked，CJK 粗体需零宽空格修正）；
- `api.byMonth` / `api.phaseOf` / `api.refCounts` / `api.monthKey`：月度分组、月份→阶段、被引用计数、月份序数。

页面清单与各自的数据依赖见仓库 `site/pages/`；新增页面时在 `static.json` 的 `导航` 追加路由、`app.js` 的 `FILES` 注册脚本名即可，骨架无需改动。
