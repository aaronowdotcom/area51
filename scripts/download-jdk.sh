#!/usr/bin/env bash
# Downloads the latest Eclipse Temurin JDK LTS and extracts it to resources/jdk/
# Supports macOS (arm64/x64), Linux (x64/arm64), Windows (x64)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JDK_DIR="$REPO_ROOT/resources/jdk"
JDK_VERSION="21"   # LTS; bump to 25 when 25 reaches LTS
TEMURIN_API="https://api.adoptium.net/v3/assets/latest/${JDK_VERSION}/hotspot"

detect_platform() {
  local os arch
  case "$(uname -s)" in
    Darwin) os="mac" ;;
    Linux)  os="linux" ;;
    MINGW*|MSYS*|CYGWIN*) os="windows" ;;
    *) echo "Unsupported OS: $(uname -s)" >&2; exit 1 ;;
  esac
  case "$(uname -m)" in
    x86_64|amd64) arch="x64" ;;
    arm64|aarch64) arch="aarch64" ;;
    *) echo "Unsupported arch: $(uname -m)" >&2; exit 1 ;;
  esac
  echo "${os}/${arch}"
}

PLATFORM=$(detect_platform)
OS="${PLATFORM%%/*}"
ARCH="${PLATFORM##*/}"

echo "Fetching JDK ${JDK_VERSION} for ${OS}/${ARCH}…"

# Query Adoptium API for the download URL
API_URL="${TEMURIN_API}?architecture=${ARCH}&image_type=jdk&os=${OS}&vendor=eclipse"
DOWNLOAD_URL=$(curl -fsSL "$API_URL" | grep -o '"link":"[^"]*"' | head -1 | sed 's/"link":"//;s/"//')

if [ -z "$DOWNLOAD_URL" ]; then
  echo "Could not resolve download URL from Adoptium API." >&2
  echo "Manual download: https://adoptium.net/temurin/releases/?version=${JDK_VERSION}" >&2
  exit 1
fi

FILENAME=$(basename "$DOWNLOAD_URL")
TMP_FILE="/tmp/${FILENAME}"

echo "Downloading: $DOWNLOAD_URL"
curl -fL --progress-bar -o "$TMP_FILE" "$DOWNLOAD_URL"

echo "Extracting to $JDK_DIR …"
rm -rf "$JDK_DIR"
mkdir -p "$JDK_DIR"

case "$FILENAME" in
  *.tar.gz)
    tar -xzf "$TMP_FILE" -C "$JDK_DIR" --strip-components=1
    ;;
  *.zip)
    unzip -q "$TMP_FILE" -d "$JDK_DIR"
    # zip has a top-level dir; flatten it
    TOP=$(ls "$JDK_DIR" | head -1)
    if [ -d "$JDK_DIR/$TOP" ]; then
      mv "$JDK_DIR/$TOP"/* "$JDK_DIR/"
      rmdir "$JDK_DIR/$TOP"
    fi
    ;;
esac

rm -f "$TMP_FILE"

# Verify
JAVA_BIN="$JDK_DIR/bin/java"
[ "$OS" = "windows" ] && JAVA_BIN="${JAVA_BIN}.exe"
if [ -x "$JAVA_BIN" ]; then
  VERSION=$("$JAVA_BIN" -version 2>&1 | head -1)
  echo "JDK ready: $VERSION"
  echo "Location:  $JDK_DIR"
else
  echo "Warning: java binary not found at expected path: $JAVA_BIN" >&2
fi
