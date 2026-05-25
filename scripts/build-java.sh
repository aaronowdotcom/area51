#!/usr/bin/env bash
# Compiles the Java service and packages it as a self-contained JAR
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVICE_DIR="$REPO_ROOT/java-service"
TARGET_DIR="$SERVICE_DIR/target"
SRC_DIR="$SERVICE_DIR/src/main/java"

# Prefer bundled JDK
BUNDLED_JAVAC="$REPO_ROOT/resources/jdk/bin/javac"
BUNDLED_JAR_TOOL="$REPO_ROOT/resources/jdk/bin/jar"

if [ -x "$BUNDLED_JAVAC" ]; then
  JAVAC="$BUNDLED_JAVAC"
  JAR_TOOL="$BUNDLED_JAR_TOOL"
else
  JAVAC="javac"
  JAR_TOOL="jar"
fi

echo "Using: $($JAVAC -version 2>&1)"

mkdir -p "$TARGET_DIR/classes"

# Find all Java source files
SOURCES=$(find "$SRC_DIR" -name "*.java")

echo "Compiling Java service…"
$JAVAC -d "$TARGET_DIR/classes" --release 21 $SOURCES

# Create manifest
MANIFEST="$TARGET_DIR/MANIFEST.MF"
cat > "$MANIFEST" <<EOF
Manifest-Version: 1.0
Main-Class: saleskit.SalesKitServer
EOF

echo "Packaging JAR…"
$JAR_TOOL --create \
  --file="$TARGET_DIR/saleskit-service.jar" \
  --manifest="$MANIFEST" \
  -C "$TARGET_DIR/classes" .

echo "Java service built: $TARGET_DIR/saleskit-service.jar"
