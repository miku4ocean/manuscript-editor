#!/usr/bin/env bash
# manuscript-editor → Cloudflare Pages（專案：manuscript-editor-miku）
# 用法：bash scripts/deploy.sh　　　DRY_RUN=1 bash scripts/deploy.sh（建置＋產出 .deploy 並守門，不部署）
# Next.js 靜態匯出（output: 'export'）→ out/ → .deploy/。前置：npm ci、npx wrangler login
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> 建置（DEPLOY_TARGET=cloudflare，不加 basePath）..."
DEPLOY_TARGET=cloudflare npx next build
[ -f out/index.html ] || { echo "!! 缺 out/index.html，確認 next.config 為 output: 'export'"; exit 1; }

echo "==> 同步到 .deploy/ ..."
rm -rf .deploy
mkdir -p .deploy
rsync -a --delete \
  --exclude='.git' --exclude='.claude' --exclude='node_modules' --exclude='tests' \
  --exclude='*.md' --exclude='wrangler.toml' --exclude='scripts' --exclude='.env*' \
  --exclude='.DS_Store' --exclude='.wrangler' --exclude='.dev.vars*' --exclude='wrangler.json*' \
  --exclude='.deploy' --exclude='.nojekyll' --exclude='*.map' --exclude='package.json' \
  out/ .deploy/

echo "==> 守門檢查 .deploy ..."
# 允許 Next 的 _next 目錄與 _headers（以底線開頭、非隱藏檔）
HIDDEN=$(find .deploy -name '.*' ! -name '.' ! -path '.deploy' -print)
BAD=$(find .deploy \( -name '*.sqlite' -o -name '*.env' -o -name 'package.json' -o -name '*.md' -o -name 'node_modules' -o -name 'tests' \) -print)
if [ -n "$HIDDEN$BAD" ]; then
  echo "!! .deploy 含不該公開的檔案，中止："
  printf '%s\n' "$HIDDEN" "$BAD" | sed '/^$/d'
  exit 1
fi
[ -f .deploy/_headers ] || { echo "!! 缺 _headers"; exit 1; }
if [ "${DRY_RUN:-}" = "1" ]; then echo "DRY_RUN=1：守門通過，不部署。"; exit 0; fi

npx wrangler pages deploy .deploy --project-name manuscript-editor-miku --branch main
