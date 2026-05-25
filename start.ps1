#Requires -Version 5.1
$ErrorActionPreference = "Stop"
$host.UI.RawUI.WindowTitle = "NexaFlow Sales Kit"

$baseDir  = $PSScriptRoot
$nextPort = 3000
$javaPort = 7878
$profile  = "prod"

# -------------------------------------------------------
# Helpers
# -------------------------------------------------------
function Write-Step($msg, $color = "Cyan") {
    Write-Host $msg -ForegroundColor $color
}

function Kill-Tree($procId) {
    # Kill entire process tree (children first) — works on PS 5.1 + PS 7
    try { taskkill /F /T /PID $procId 2>$null | Out-Null } catch {}
}

function Stop-AllServices {
    Write-Host ""
    Write-Step "Shutting down NexaFlow Sales Kit..." "Yellow"
    foreach ($pid in $script:pids) {
        Kill-Tree $pid
        Write-Host "  Stopped PID $pid" -ForegroundColor DarkGray
    }
    Write-Step "Goodbye." "DarkGray"
}

# Fire cleanup when PowerShell exits (covers X button + Ctrl+C)
Register-EngineEvent PowerShell.Exiting -Action { Stop-AllServices } | Out-Null

$script:pids = [System.Collections.Generic.List[int]]::new()

# -------------------------------------------------------
# Find executables
# -------------------------------------------------------
$javaExe = if (Test-Path "$baseDir\jdk\bin\java.exe") {
    "$baseDir\jdk\bin\java.exe"
} else {
    Write-Step "[Warn]  Bundled JDK not found, trying system java" "Yellow"
    "java"
}

$nodeExe = if (Test-Path "$baseDir\node.exe") {
    "$baseDir\node.exe"
} elseif (Test-Path "$baseDir\node\node.exe") {
    "$baseDir\node\node.exe"
} else {
    Write-Step "[Warn]  Bundled node.exe not found, trying system node" "Yellow"
    "node"
}

# -------------------------------------------------------
# Start Java service
# -------------------------------------------------------
if (Test-Path "$baseDir\saleskit-service.jar") {
    Write-Step "[Java]  Starting service (profile: $profile)..." "Cyan"
    $javaProc = Start-Process -FilePath $javaExe `
        -ArgumentList "-jar", "`"$baseDir\saleskit-service.jar`"",
                      "--spring.profiles.active=$profile",
                      "--server.port=$javaPort" `
        -PassThru -WindowStyle Hidden
    $script:pids.Add($javaProc.Id)
    Write-Host "[Java]  PID $($javaProc.Id)" -ForegroundColor DarkGray
} else {
    Write-Step "[Java]  saleskit-service.jar not found — skipping." "Yellow"
}

# -------------------------------------------------------
# Start Next.js server
# -------------------------------------------------------
$env:PORT        = "$nextPort"
$env:HOSTNAME    = "localhost"
$env:NODE_ENV    = "production"
$env:CONTENT_DIR = "$baseDir\content"

Write-Step "[Next]  Starting server..." "Cyan"
$nextProc = Start-Process -FilePath $nodeExe `
    -ArgumentList "`"$baseDir\server.js`"" `
    -PassThru -WindowStyle Hidden
$script:pids.Add($nextProc.Id)
Write-Host "[Next]  PID $($nextProc.Id)" -ForegroundColor DarkGray

# -------------------------------------------------------
# Wait for Next.js to be ready
# -------------------------------------------------------
Write-Host "[Next]  Waiting for server on :$nextPort..." -ForegroundColor Gray
$ready = $false
for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Milliseconds 500
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:$nextPort/" `
            -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
        if ($r.StatusCode -lt 500) { $ready = $true; break }
    } catch {}
}

if ($ready) {
    Write-Step "[Next]  Ready!" "Green"
    Start-Process "http://localhost:$nextPort"
} else {
    Write-Step "[Next]  Server did not respond in time — check for errors above." "Red"
}

# -------------------------------------------------------
# Status banner
# -------------------------------------------------------
Write-Host ""
Write-Host "  ============================================" -ForegroundColor DarkCyan
Write-Host "   NexaFlow Sales Kit is running" -ForegroundColor Cyan
Write-Host "   http://localhost:$nextPort" -ForegroundColor White
Write-Host "   Close this window to stop all services." -ForegroundColor DarkGray
Write-Host "  ============================================" -ForegroundColor DarkCyan
Write-Host ""

# -------------------------------------------------------
# Keep-alive loop — also detects unexpected server crash
# -------------------------------------------------------
try {
    while ($true) {
        Start-Sleep -Seconds 2
        if ($nextProc.HasExited) {
            Write-Step "[Next]  Server exited unexpectedly (code: $($nextProc.ExitCode))." "Red"
            break
        }
    }
} finally {
    Stop-AllServices
}
