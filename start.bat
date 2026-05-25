@echo off
title NexaFlow Sales Kit
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"

if %ERRORLEVEL% neq 0 (
    echo.
    echo An error occurred. Press any key to close.
    pause > nul
)
