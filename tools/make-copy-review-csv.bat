@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0make-copy-review-csv.ps1"
pause
