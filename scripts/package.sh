#!/usr/bin/env bash
# Assemble the distributable folder and create pkg binaries
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$REPO/dist/nexaflow-sales-kit"

echo "==> Assembling distribution in $DIST"
rm -rf "$DIST"
mkdir -p "$DIST"

# --- Next.js standalone output ---
STANDALONE="$REPO/renderer/.next/standalone"

if [ ! -f "$STANDALONE/server.js" ]; then
  echo "ERROR: Next.js standalone not found. Run: npm run build:renderer"
  exit 1
fi

# Copy standalone server + its minimal node_modules
cp    "$STANDALONE/server.js"        "$DIST/server.js"
cp -r "$STANDALONE/node_modules"     "$DIST/node_modules"

# Copy .next/ build artifacts (server chunks + static assets)
mkdir -p "$DIST/.next"
cp -r "$STANDALONE/.next/." "$DIST/.next/"

# Next.js standalone does NOT copy static/ — must be done manually
cp -r "$REPO/renderer/.next/static"  "$DIST/.next/static"
[ -d "$REPO/renderer/public" ] && cp -r "$REPO/renderer/public" "$DIST/public"

# --- Content (editable by salesperson, never baked into binary) ---
cp -r "$REPO/content" "$DIST/content"

# --- Java service ---
JAR="$REPO/java-service/target/saleskit-service.jar"
if [ -f "$JAR" ]; then
  cp "$JAR" "$DIST/saleskit-service.jar"
else
  echo "WARNING: Java service JAR not found. Run: npm run build:java"
fi

# --- JDK (if downloaded) ---
JDK="$REPO/resources/jdk"
if [ -d "$JDK" ] && [ "$(ls -A $JDK)" ]; then
  cp -r "$JDK" "$DIST/jdk"
  echo "JDK bundled."
else
  echo "WARNING: JDK not found in resources/jdk/. Run: npm run download:jdk"
fi

# --- pkg binary ---
echo ""
echo "==> Building pkg binaries..."
cd "$REPO"
npx @yao-pkg/pkg launcher.js \
  --targets node21-linux-x64,node21-macos-x64,node21-macos-arm64,node21-win-x64 \
  --output "$DIST/sales-kit"

echo ""
echo "==> Done! Distribution:"
du -sh "$DIST"
ls -lh "$DIST"
echo ""
echo "Salesperson runs: ./sales-kit  (Linux/macOS)  or  sales-kit-win.exe  (Windows)"
