#Requires -Version 5.1
$ErrorActionPreference = "Stop"
$host.UI.RawUI.WindowTitle = "NexaFlow Sales Kit"

$baseDir  = $PSScriptRoot
$nextPort = 3000
$javaPort = 7878
$profile  = "prod"

# Use a plain array - avoids PS 5.1 generic type parsing issues
$script:trackedPids = @()

# -------------------------------------------------------
# Helpers
# -------------------------------------------------------
function Write-Step {
    param([string]$msg, [string]$color = "Cyan")
    Write-Host $msg -ForegroundColor $color
}

function Kill-Tree {
    param([int]$procId)
    try { taskkill /F /T /PID $procId 2>$null | Out-Null } catch {}
}

function Stop-AllServices {
    Write-Host ""
    Write-Step "Shutting down NexaFlow Sales Kit..." "Yellow"
    foreach ($p in $script:trackedPids) {
        Kill-Tree $p
        Write-Host ("  Stopped PID " + $p) -ForegroundColor DarkGray
    }
    Write-Step "Goodbye." "DarkGray"
}

# Fires on X button close AND Ctrl+C
Register-EngineEvent PowerShell.Exiting -Action { Stop-AllServices } | Out-Null

# -------------------------------------------------------
# Find executables
# -------------------------------------------------------
if (Test-Path "$baseDir\jdk\bin\java.exe") {
    $javaExe = "$baseDir\jdk\bin\java.exe"
} else {
    Write-Step "WARN: Bundled JDK not found, trying system java" "Yellow"
    $javaExe = "java"
}

if (Test-Path "$baseDir\node.exe") {
    $nodeExe = "$baseDir\node.exe"
} elseif (Test-Path "$baseDir\node\node.exe") {
    $nodeExe = "$baseDir\node\node.exe"
} else {
    Write-Step "WARN: Bundled node.exe not found, trying system node" "Yellow"
    $nodeExe = "node"
}

# -------------------------------------------------------
# Start Java service
# -------------------------------------------------------
if (Test-Path "$baseDir\saleskit-service.jar") {
    Write-Step "[Java] Starting service (profile: $profile)..." "Cyan"

    # Build args array separately - avoids backtick/comma continuation mix
    $javaArgs = @(
        "-jar",
        "$baseDir\saleskit-service.jar",
        "--spring.profiles.active=$profile",
        "--server.port=$javaPort"
    )

    $javaProc = Start-Process -FilePath $javaExe `
        -ArgumentList $javaArgs `
        -PassThru -WindowStyle Hidden

    $script:trackedPids += $javaProc.Id
    Write-Host ("[Java] PID " + $javaProc.Id) -ForegroundColor DarkGray
} else {
    Write-Step "[Java] saleskit-service.jar not found, skipping." "Yellow"
}

# -------------------------------------------------------
# Start Next.js server
# -------------------------------------------------------
$env:PORT        = $nextPort.ToString()
$env:HOSTNAME    = "localhost"
$env:NODE_ENV    = "production"
$env:CONTENT_DIR = "$baseDir\content"

Write-Step "[Next] Starting server..." "Cyan"

$nextArgs = @("$baseDir\server.js")

$nextProc = Start-Process -FilePath $nodeExe `
    -ArgumentList $nextArgs `
    -PassThru -WindowStyle Hidden

$script:trackedPids += $nextProc.Id
Write-Host ("[Next] PID " + $nextProc.Id) -ForegroundColor DarkGray

# -------------------------------------------------------
# Wait for Next.js to be ready
# -------------------------------------------------------
Write-Host ("[Next] Waiting for server on port " + $nextPort + "...") -ForegroundColor Gray

$ready = $false
for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Milliseconds 500
    try {
        $r = Invoke-WebRequest -Uri ("http://localhost:" + $nextPort + "/") `
            -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
        if ($r.StatusCode -lt 500) {
            $ready = $true
            break
        }
    } catch {
        # not ready yet
    }
}

if ($ready) {
    Write-Step "[Next] Ready!" "Green"
    Start-Process ("http://localhost:" + $nextPort)
} else {
    Write-Step "[Next] Server did not respond in time. Check for errors above." "Red"
}

# -------------------------------------------------------
# Status banner
# -------------------------------------------------------
Write-Host ""
Write-Host "  ==========================================" -ForegroundColor DarkCyan
Write-Host "   NexaFlow Sales Kit is running" -ForegroundColor Cyan
Write-Host ("   http://localhost:" + $nextPort) -ForegroundColor White
Write-Host "   Close this window to stop all services." -ForegroundColor DarkGray
Write-Host "  ==========================================" -ForegroundColor DarkCyan
Write-Host ""

# -------------------------------------------------------
# Keep-alive - also detects unexpected server crash
# -------------------------------------------------------
try {
    while ($true) {
        Start-Sleep -Seconds 2
        if ($nextProc.HasExited) {
            Write-Step ("[Next] Server exited unexpectedly (code: " + $nextProc.ExitCode + ").") "Red"
            break
        }
    }
} finally {
    Stop-AllServices
}
