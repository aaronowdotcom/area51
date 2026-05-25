#Requires -Version 5.1
# Run once to download portable Node.js and JDK 21 into the distribution folder.
# Right-click → "Run with PowerShell", or: powershell -ExecutionPolicy Bypass -File setup-win.ps1
$ErrorActionPreference = "Stop"

$baseDir     = Split-Path $PSScriptRoot -Parent   # project root
$nodeVersion = "21.7.3"
$jdkVersion  = "21"

Write-Host "NexaFlow Sales Kit — Windows Setup" -ForegroundColor Cyan
Write-Host "Base directory: $baseDir" -ForegroundColor DarkGray
Write-Host ""

# -------------------------------------------------------
# 1. Portable Node.js
# -------------------------------------------------------
$nodeExe = "$baseDir\node.exe"
if (Test-Path $nodeExe) {
    Write-Host "[Node]  Already present. Skipping download." -ForegroundColor DarkGray
} else {
    Write-Host "[Node]  Downloading Node.js $nodeVersion (portable)..." -ForegroundColor Cyan
    $nodeZip  = "$env:TEMP\node-win-x64.zip"
    $nodeTemp = "$env:TEMP\node-win-extract"

    Invoke-WebRequest `
        -Uri "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-win-x64.zip" `
        -OutFile $nodeZip -UseBasicParsing

    Write-Host "[Node]  Extracting..." -ForegroundColor Gray
    if (Test-Path $nodeTemp) { Remove-Item $nodeTemp -Recurse -Force }
    Expand-Archive -Path $nodeZip -DestinationPath $nodeTemp -Force

    # Copy only node.exe (we don't need npm/npx at runtime)
    $found = Get-ChildItem -Path $nodeTemp -Filter "node.exe" -Recurse | Select-Object -First 1
    Copy-Item -Path $found.FullName -Destination $nodeExe -Force

    Remove-Item $nodeZip   -Force
    Remove-Item $nodeTemp  -Recurse -Force

    Write-Host "[Node]  node.exe ready." -ForegroundColor Green
}

# -------------------------------------------------------
# 2. JDK 21 (Eclipse Temurin via Adoptium API)
# -------------------------------------------------------
$jdkDir = "$baseDir\resources\jdk"
$javaExe = "$jdkDir\bin\java.exe"

if (Test-Path $javaExe) {
    Write-Host "[JDK]   Already present. Skipping download." -ForegroundColor DarkGray
} else {
    Write-Host "[JDK]   Downloading JDK $jdkVersion (Temurin)..." -ForegroundColor Cyan

    $apiUrl = "https://api.adoptium.net/v3/assets/latest/$jdkVersion/hotspot" +
              "?architecture=x64&image_type=jdk&os=windows&vendor=eclipse"

    $meta     = Invoke-RestMethod -Uri $apiUrl -UseBasicParsing
    $download = $meta[0].binary.package.link
    $jdkZip   = "$env:TEMP\jdk-win.zip"
    $jdkTemp  = "$env:TEMP\jdk-win-extract"

    Write-Host "[JDK]   URL: $download" -ForegroundColor DarkGray
    Invoke-WebRequest -Uri $download -OutFile $jdkZip -UseBasicParsing

    Write-Host "[JDK]   Extracting..." -ForegroundColor Gray
    if (Test-Path $jdkTemp) { Remove-Item $jdkTemp -Recurse -Force }
    Expand-Archive -Path $jdkZip -DestinationPath $jdkTemp -Force

    # Flatten: the zip contains a top-level jdk-21.x.x-xxx\ folder
    if (Test-Path $jdkDir) { Remove-Item $jdkDir -Recurse -Force }
    New-Item -ItemType Directory -Path $jdkDir -Force | Out-Null
    $topDir = Get-ChildItem -Path $jdkTemp | Select-Object -First 1
    Copy-Item -Path "$($topDir.FullName)\*" -Destination $jdkDir -Recurse -Force

    Remove-Item $jdkZip  -Force
    Remove-Item $jdkTemp -Recurse -Force

    $ver = & "$javaExe" -version 2>&1 | Select-Object -First 1
    Write-Host "[JDK]   $ver" -ForegroundColor Green
    Write-Host "[JDK]   Ready at $jdkDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup complete. Run start.bat to launch the app." -ForegroundColor Cyan
Write-Host ""
pause
