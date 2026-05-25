#!/usr/bin/env bash
# Start development environment: Next.js dev server + Java service + Electron
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Build Java service if JAR is missing
JAR="$REPO_ROOT/java-service/target/saleskit-service.jar"
if [ ! -f "$JAR" ]; then
  echo "Building Java service…"
  bash "$REPO_ROOT/scripts/build-java.sh"
fi

# Detect java
JAVA="$REPO_ROOT/resources/jdk/bin/java"
[ -x "$JAVA" ] || JAVA="java"

# Start Java service in background
echo "Starting Java service on port 7878…"
"$JAVA" -jar "$JAR" --port 7878 &
JAVA_PID=$!

# Start Next.js dev server in background
echo "Starting Next.js dev server…"
cd "$REPO_ROOT/renderer" && npm run dev &
NEXT_PID=$!

cleanup() {
  echo "Shutting down…"
  kill $JAVA_PID $NEXT_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Wait for Next.js
echo "Waiting for Next.js…"
until curl -sf http://localhost:3000 > /dev/null 2>&1; do sleep 1; done

# Start Electron
echo "Starting Electron…"
cd "$REPO_ROOT" && NODE_ENV=development npx electron .

wait
