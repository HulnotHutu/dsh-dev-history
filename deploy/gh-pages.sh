#!/usr/bin/env sh
# 分支式发布：把 site/ 推到发布仓库的 gh-pages 分支（仓库 Settings -> Pages 选 gh-pages 分支）。
# 用法: deploy/gh-pages.sh <发布仓库的 git 地址> [site 目录，默认 ../site]
# 依赖: git、coreutils（无其他依赖）
set -eu
REPO="${1:?用法: gh-pages.sh <发布仓库地址> [site目录]}"
SRC="${2:-$(cd "$(dirname "$0")/../site" && pwd)}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git -C "$TMP" init -q -b gh-pages
cp -r "$SRC"/. "$TMP"/
touch "$TMP/.nojekyll"
git -C "$TMP" add -A
git -C "$TMP" -c user.name=dsh-dev-history -c user.email=dsh-dev-history@local commit -qm "publish site $(date +%F)"
git -C "$TMP" remote add origin "$REPO"
git -C "$TMP" push -qf origin gh-pages
echo "已发布 $(cd "$SRC" && pwd) -> $REPO (gh-pages 分支)"
