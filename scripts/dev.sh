#!/usr/bin/env bash
# Start development environment: Next.js dev server + Java service
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Build Java service if JAR is missing
JAR="$REPO_ROOT/java-service/target/saleskit-service.jar"
if [ ! -f "$JAR" ]; then
  echo "Building Java service..."
  bash "$REPO_ROOT/scripts/build-java.sh"
fi

JAVA="$REPO_ROOT/resources/jdk/bin/java"
[ -x "$JAVA" ] || JAVA="java"

echo "Starting Java service on port 7878..."
export CONTENT_DIR="$REPO_ROOT/content"
"$JAVA" -jar "$JAR" --spring.profiles.active=sit --server.port=7878 &
JAVA_PID=$!

cleanup() { echo "Shutting down..."; kill $JAVA_PID 2>/dev/null || true; }
trap cleanup EXIT INT TERM

echo "Starting Next.js dev server (http://localhost:3000)..."
echo "CONTENT_DIR=$CONTENT_DIR"
cd "$REPO_ROOT/renderer" && CONTENT_DIR="$REPO_ROOT/content" npm run dev
