#!/usr/bin/env bash
# Assemble platform-specific distribution folders
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"

# -------------------------------------------------------
# Shared: build Next.js output into a staging area
# -------------------------------------------------------
STANDALONE="$REPO/renderer/.next/standalone"

if [ ! -f "$STANDALONE/server.js" ]; then
  echo "ERROR: Next.js standalone not found. Run: npm run build:renderer"
  exit 1
fi

JAR="$REPO/java-service/target/saleskit-service.jar"
if [ ! -f "$JAR" ]; then
  echo "ERROR: Java JAR not found. Run: npm run build:java"
  exit 1
fi

assemble_common() {
  local DIST="$1"
  mkdir -p "$DIST"

  # Next.js standalone server + minimal runtime deps
  cp    "$STANDALONE/server.js"     "$DIST/server.js"
  cp -r "$STANDALONE/node_modules"  "$DIST/node_modules"

  # Next.js build artifacts
  mkdir -p "$DIST/.next"
  cp -r "$STANDALONE/.next/."              "$DIST/.next/"
  cp -r "$REPO/renderer/.next/static"      "$DIST/.next/static"
  [ -d "$REPO/renderer/public" ] && cp -r "$REPO/renderer/public" "$DIST/public"

  # Editable content (never inside any binary)
  cp -r "$REPO/content" "$DIST/content"

  # Java service
  cp "$JAR" "$DIST/saleskit-service.jar"

  # JDK
  JDK="$REPO/resources/jdk"
  if [ -d "$JDK" ] && [ "$(ls -A "$JDK")" ]; then
    cp -r "$JDK" "$DIST/jdk"
  else
    echo "WARNING: JDK not found. Run: npm run download:jdk (or setup-win.ps1 on Windows)"
  fi
}

# -------------------------------------------------------
# Windows distribution  (start.bat + start.ps1)
# -------------------------------------------------------
WIN_DIST="$REPO/dist/nexaflow-sales-kit-win"
echo "==> Building Windows distribution: $WIN_DIST"
rm -rf "$WIN_DIST"
assemble_common "$WIN_DIST"

cp "$REPO/start.bat"  "$WIN_DIST/start.bat"
cp "$REPO/start.ps1"  "$WIN_DIST/start.ps1"
cp "$REPO/scripts/setup-win.ps1" "$WIN_DIST/setup.ps1"

# Copy portable node.exe if already downloaded
[ -f "$REPO/node.exe" ] && cp "$REPO/node.exe" "$WIN_DIST/node.exe"

echo "Windows distribution ready."
echo "Salesperson: double-click start.bat"
echo ""

# -------------------------------------------------------
# Linux / macOS distribution  (pkg binary)
# -------------------------------------------------------
UNIX_DIST="$REPO/dist/nexaflow-sales-kit-unix"
echo "==> Building Unix distribution: $UNIX_DIST"
rm -rf "$UNIX_DIST"
assemble_common "$UNIX_DIST"

cd "$REPO"
npx @yao-pkg/pkg launcher.js \
  --targets node21-linux-x64,node21-macos-x64,node21-macos-arm64 \
  --output "$UNIX_DIST/sales-kit"

echo "Unix distribution ready."
echo "Salesperson: ./sales-kit"
echo ""

# -------------------------------------------------------
# Summary
# -------------------------------------------------------
echo "==> Done!"
du -sh "$REPO/dist/nexaflow-sales-kit-win"
du -sh "$REPO/dist/nexaflow-sales-kit-unix"
