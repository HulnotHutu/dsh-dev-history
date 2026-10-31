# 部署与同步

站点托管在 GitHub Pages，数据来自上游 dsh 仓库的每日同步。流水线与字段契约见 [pipeline.md](pipeline.md)，AI 层见 [ai-layer.md](ai-layer.md)。

## 发布通道：gh-pages 分支

Pages 源设为 `gh-pages` 分支（仓库 Settings → Pages）。发布用 `deploy/gh-pages.sh`：把 `site/` 生成一个孤儿提交强推到 `gh-pages`。历史策略： Pages 源是分支而非 Actions 产物，`deploy.yml` 只保留手动触发（workflow_dispatch）；push 触发会因 Pages 的部署归属产生红叉部署记录，故已移除。

发布是强推覆盖，仓库侧无需维护 `gh-pages` 本地分支；`?v=` 版本戳（构建时刻）负责让 CDN 缓存失效，浏览器强刷即可看到最新版。

## 每日同步：sync.yml

`.github/workflows/sync.yml` 每日北京时间 05:00 运行（cron `0 21 * * *` UTC，可手动触发）：

1. 浅克隆 + sparse checkout 拉取上游 dsh 仓库的 `.agents/notes/`；
2. 增量提取 → 检测 `data/arch-notes.json` 是否变化；上游无更新时静默结束；
3. 构建（刷新版本戳）→ 重发 `gh-pages`；
4. 若配置了 AI Secrets，附带跑 `--merge-new` 只合入新月份叙事（见下）。

AI 步骤需要仓库 Secrets：`DASHSCOPE_API_KEY` 与 `DASHSCOPE_WORKSPACE`。未配置时仅更新数据与站点，新月份叙事留空待补；已有月份的改写无论是否配置都不会自动套用（人工闸门见 [ai-layer.md](ai-layer.md#模式与闸门)）。

## 手动发布

```sh
python3 tools/extract.py                    # 仓库 -> data/arch-notes.json
python3 tools/build.py                      # 三份 JSON -> site/js/*.js（刷新 ?v=）
sh deploy/gh-pages.sh git@github.com:<user>/dsh-dev-history.git   # 重发 gh-pages
```

本地预览用任意静态服务器指向 `site/`（例如 `python3 -m http.server 8738 --directory site`）；注意修改页面脚本后需重跑 `build.py` 以刷新版本戳，且浏览器需整页刷新——哈希路由切换不会重新加载文档。

## 上游仓库布局

本仓库（dsh-dev-history）是嵌在 dsh 工作区内的独立 git 仓库；dsh 侧只以 `.agents/notes/` 为只读数据源，上游更新通过 `git pull`（本地）或 sync.yml（CI）进入。上游笔记被归档/修订后重新提取即可，产物幂等；站点只呈现提取结果，不回写上游。
