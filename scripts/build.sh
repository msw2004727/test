#!/bin/bash
set -e

# ─────────────────────────────────────────────
# Build Script — 朝陽科技大學 休閒事業管理系
# ─────────────────────────────────────────────
# 用法：
#   ./scripts/build.sh patch   # 修正 1.0.0 → 1.0.1
#   ./scripts/build.sh minor   # 功能 1.0.0 → 1.1.0
#   ./scripts/build.sh major   # 大版 1.0.0 → 2.0.0
#   ./scripts/build.sh         # 不遞增，僅重新 build
# ─────────────────────────────────────────────

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 0. 環境變數（部署域名，預設為正式域名）
BASE_URL="${BASE_URL:-https://leisure.cyut.edu.tw}"
API_BASE_URL="${API_BASE_URL:-/api}"
echo "=== Base URL: $BASE_URL ==="
echo "=== API Base: $API_BASE_URL ==="

# 1. 版號遞增
echo "=== Step 1: Version bump ==="
node scripts/version.mjs "$1"
VERSION=$(node -p "require('./version.json').version")
HASH=$(node -p "require('./version.json').buildHash")
BUILD_DATE=$(node -p "require('./version.json').buildDate")
echo "  Version : $VERSION"
echo "  Hash    : $HASH"
echo "  Date    : $BUILD_DATE"

# 2. 清理 dist/
echo "=== Step 2: Clean dist/ ==="
rm -rf dist
mkdir -p dist/css dist/js dist/icons dist/images

# 3. CSS 合併（支援拆分式與單檔式兩種來源）
echo "=== Step 3: Merge CSS ==="
if [ -f css/base.css ]; then
  cat css/base.css css/layout.css css/components.css css/utilities.css > dist/css/style.css
  echo "  Merged 4 CSS files -> dist/css/style.css"
elif [ -f css/style.css ]; then
  cp css/style.css dist/css/style.css
  echo "  Copied css/style.css -> dist/css/style.css (monolithic)"
else
  echo "  [ERROR] No CSS source files found!" >&2
  exit 1
fi

# 4. PNG → WebP 轉換
echo "=== Step 4: Image optimization ==="
WEBP_COUNT=0
if command -v cwebp &> /dev/null; then
  for f in assets/images/original/*.png; do
    [ -f "$f" ] || continue
    OUT="dist/images/$(basename "${f%.png}").webp"
    cwebp -q 80 "$f" -o "$OUT" 2>/dev/null && WEBP_COUNT=$((WEBP_COUNT + 1)) || true
  done
  echo "  Converted $WEBP_COUNT PNG -> WebP"
else
  echo "  [SKIP] cwebp not installed (npm install -g cwebp-bin)"
fi
# 也複製原始 PNG 作為 fallback
cp assets/images/original/*.png dist/images/ 2>/dev/null || true

# 5. SVG 壓縮
echo "=== Step 5: SVG optimization ==="
if command -v npx &> /dev/null && [ -d assets/icons/svg ]; then
  npx svgo -f assets/icons/svg/ -o dist/icons/ --quiet 2>/dev/null && \
    echo "  SVGs optimized -> dist/icons/" || \
    echo "  [SKIP] svgo failed"
else
  cp assets/icons/svg/*.svg dist/icons/ 2>/dev/null || true
  echo "  Copied SVGs -> dist/icons/"
fi

# 6. 注入版號到 HTML（使用 | 分隔符避免路徑中 / 衝突）
echo "=== Step 6: Inject version into HTML ==="
if [ -f index.html ]; then
  sed -e "s|{{VERSION}}|${VERSION}|g" \
      -e "s|{{BUILD_HASH}}|${HASH}|g" \
      -e "s|{{BUILD_DATE}}|${BUILD_DATE}|g" \
      -e "s|{{BASE_URL}}|${BASE_URL}|g" \
      -e "s|{{API_BASE_URL}}|${API_BASE_URL}|g" \
      index.html > dist/index.html
  echo "  dist/index.html <- v${VERSION}"
fi

# 處理 admin/ 頁面
if [ -d admin ]; then
  mkdir -p dist/admin
  for f in admin/*.html; do
    [ -f "$f" ] || continue
    sed -e "s|{{VERSION}}|${VERSION}|g" \
        -e "s|{{BASE_URL}}|${BASE_URL}|g" \
        -e "s|{{API_BASE_URL}}|${API_BASE_URL}|g" \
        "$f" > "dist/$f"
  done
  cp admin/css/* dist/admin/css/ 2>/dev/null || true
  cp admin/js/* dist/admin/js/ 2>/dev/null || true
  echo "  admin/ processed"
fi

# 處理子頁面（保留 pages/ 子目錄結構）
if [ -d pages ]; then
  mkdir -p dist/pages
  for f in pages/*.html; do
    [ -f "$f" ] || continue
    sed -e "s|{{VERSION}}|${VERSION}|g" \
        -e "s|{{BUILD_HASH}}|${HASH}|g" \
        -e "s|{{BUILD_DATE}}|${BUILD_DATE}|g" \
        -e "s|{{BASE_URL}}|${BASE_URL}|g" \
        -e "s|{{API_BASE_URL}}|${API_BASE_URL}|g" \
        "$f" > "dist/$f"
  done
  echo "  Sub-pages injected -> dist/pages/"
fi

# 7. Service Worker 版號注入
echo "=== Step 7: Service Worker ==="
if [ -f sw.js ]; then
  sed -e "s|{{VERSION}}|${VERSION}|g" \
      -e "s|{{BASE_URL}}|${BASE_URL}|g" sw.js > dist/sw.js
  echo "  dist/sw.js <- v${VERSION}"
else
  echo "  [SKIP] sw.js not found"
fi

# 8. 複製其他靜態資源
echo "=== Step 8: Copy static assets ==="
cp -r i18n dist/i18n 2>/dev/null && echo "  i18n/ copied" || echo "  [SKIP] i18n/ not found"
cp -r js dist/js 2>/dev/null && echo "  js/ copied" || echo "  [SKIP] js/ not found"
cp version.json dist/version.json
# robots.txt / sitemap.xml 需注入 BASE_URL
if [ -f robots.txt ]; then
  sed -e "s|{{BASE_URL}}|${BASE_URL}|g" robots.txt > dist/robots.txt
fi
if [ -f sitemap.xml ]; then
  sed -e "s|{{BASE_URL}}|${BASE_URL}|g" sitemap.xml > dist/sitemap.xml
fi

# 9. 輸出構建摘要
echo ""
# 9.5 Post-build validation: ensure no unreplaced placeholders
echo "=== Step 9.5: Validate ==="
UNREPLACED=$(grep -rl '{{VERSION}}\|{{BUILD_HASH}}\|{{BASE_URL}}\|{{BUILD_DATE}}\|{{API_BASE_URL}}' dist/ 2>/dev/null || true)
if [ -n "$UNREPLACED" ]; then
  echo "  [ERROR] Unreplaced placeholders found in:" >&2
  echo "$UNREPLACED" >&2
  exit 1
else
  echo "  OK - no unreplaced placeholders"
fi

echo "======================================="
echo "  BUILD COMPLETE"
echo "  Version : v${VERSION}"
echo "  Hash    : ${HASH}"
echo "  Output  : dist/"
echo "======================================="
