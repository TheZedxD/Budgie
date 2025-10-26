@echo off
REM Budgie - Local Server Startup Script (Windows)
REM This script starts a local web server to run the Budgie application
REM ES6 modules require HTTP/HTTPS protocol (not file://)

echo ==========================================
echo   Budgie - Personal Budget Manager
echo   Starting Local Web Server...
echo ==========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Check for Python 3
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python found
    echo Starting server on http://localhost:8000
    echo.
    echo INSTRUCTIONS:
    echo 1. Open your browser
    echo 2. Go to: http://localhost:8000
    echo 3. To stop the server, press Ctrl+C
    echo.
    echo ==========================================
    echo.
    python -m http.server 8000
    goto :end
)

REM Check for PHP
php --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PHP found
    echo Starting server on http://localhost:8000
    echo.
    echo INSTRUCTIONS:
    echo 1. Open your browser
    echo 2. Go to: http://localhost:8000
    echo 3. To stop the server, press Ctrl+C
    echo.
    echo ==========================================
    echo.
    php -S localhost:8000
    goto :end
)

REM No suitable server found
echo [ERROR] No suitable server found!
echo.
echo Please install one of the following:
echo   - Python 3: https://www.python.org/downloads/
echo   - PHP: https://www.php.net/downloads
echo   - Node.js with http-server: npm install -g http-server
echo.
echo Or use VS Code with the 'Live Server' extension
echo.
pause
exit /b 1

:end
