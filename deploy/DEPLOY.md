# 部署到 GitHub Pages

站点是**纯静态、零依赖**的：无框架、无 CDN、无字体请求，构建产物只有 `site/` 目录（首屏资源约 5.4MB，Pages 自动 gzip 后传输约 1.4MB；`tools/` 与 `data/` 是构建期工具，不需要上传）。所有资源都是相对路径，部署在 `user.github.io/<仓库名>/` 子路径下同样可用。

发布仓库二选一：

## 方式 A：GitHub Actions（推荐）

1. 把 `deploy/github-pages.yml` 复制到发布仓库的 `.github/workflows/deploy.yml`。
2. 发布仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。
3. 推送即自动发布；也可在 Actions 页手动触发（workflow_dispatch）。

注意：发布仓库若保留本项目的目录结构（`site/` 在根下），workflow 的 `path: site` 不用改；若把 `site/` 内容平铺到仓库根，把它改成 `path: '.'`。

## 方式 B：gh-pages 分支

```sh
deploy/gh-pages.sh <发布仓库的 git 地址>
# 例：deploy/gh-pages.sh git@github.com:you/dsh-dev-history.git
```

脚本把 `site/` 内容推成发布仓库的 `gh-pages` 分支（依赖仅 git + coreutils）。然后在 **Settings → Pages → Source** 选 **Deploy from a branch**，分支选 `gh-pages`，目录选 `/ (root)`。

## 更新流程

数据更新后重新发布：

```sh
git fetch origin && python3 tools/extract.py && python3 tools/build.py
# 方式 A：直接 push 发布仓库；方式 B：重跑 deploy/gh-pages.sh <地址>
```

`tools/build.py` 会自动刷新 `index.html` 里的 `?v=` 版本参数，访客浏览器不会拿到旧数据。

## 注意事项

- 首次部署后若页面空白，确认 Pages 的 Source 设置与所用方式匹配（A 对应 GitHub Actions，B 对应 gh-pages 分支）。
- `site/.nojekyll` 已就位，防止 Pages 的 Jekyll 处理干扰下划线/点文件。
- 架构整图 `dsh-architecture.html`（约 850KB）是懒加载 iframe，只有进入「架构」页才下载。
