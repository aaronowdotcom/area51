@echo off
setlocal

set MAVEN_VERSION=3.9.6
set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%
set MAVEN_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo [mvnw] Maven %MAVEN_VERSION% not found, downloading...
    mkdir "%MAVEN_HOME%" 2>nul
    powershell -Command "Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%TEMP%\maven.zip'"
    powershell -Command "Expand-Archive -Path '%TEMP%\maven.zip' -DestinationPath '%TEMP%\maven-extract' -Force"
    powershell -Command "Move-Item '%TEMP%\maven-extract\apache-maven-%MAVEN_VERSION%\*' '%MAVEN_HOME%'"
    del "%TEMP%\maven.zip"
    echo [mvnw] Maven ready.
)

"%MAVEN_HOME%\bin\mvn.cmd" %*
