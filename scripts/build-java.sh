#!/usr/bin/env bash
# Build the Spring Boot Java service into a fat JAR
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVICE_DIR="$REPO_ROOT/java-service"

# Prefer bundled JDK
BUNDLED_JAVA="$REPO_ROOT/resources/jdk/bin/java"
if [ -x "$BUNDLED_JAVA" ]; then
  export JAVA_HOME="$(dirname "$(dirname "$BUNDLED_JAVA")")"
fi

echo "Using Java: $(java -version 2>&1 | head -1)"

# Use mvnw (downloads Maven automatically if not installed)
chmod +x "$SERVICE_DIR/mvnw"
cd "$SERVICE_DIR"
./mvnw clean package -DskipTests -q

echo "Java service built: $SERVICE_DIR/target/saleskit-service.jar"
