@echo off
REM Budgie - Verification Script (Windows)
REM Quickly verify all fixes are in place

echo ==========================================
echo   Budgie - Verification Script
echo ==========================================
echo.

REM Get the directory where the script is located
cd /d "%~dp0"

set ERRORS=0
set WARNINGS=0

REM Check 1: Verify favicon exists
echo [✓] Checking favicon...
if exist "favicon.svg" (
    echo   [✓] favicon.svg found
) else (
    echo   [✗] favicon.svg missing
    set /a ERRORS=%ERRORS%+1
)

REM Check 2: Verify JavaScript syntax
echo.
echo [✓] Checking JavaScript syntax...
where node >nul 2>&1
if %errorlevel% equ 0 (
    set JS_ERRORS=0
    for %%f in (Scripts\*.js) do (
        echo %%f | findstr /C:"smoke-test.js" >nul 2>&1
        if errorlevel 1 (
            node --check "%%f" >nul 2>&1
            if errorlevel 0 (
                echo   [✓] %%~nxf
            ) else (
                echo   [✗] %%~nxf has syntax errors
                set /a JS_ERRORS=%JS_ERRORS%+1
            )
        )
    )
    set /a ERRORS=%ERRORS%+%JS_ERRORS%
) else (
    echo   [!] Node.js not found - skipping syntax check
    set /a WARNINGS=%WARNINGS%+1
)

REM Check 3: Verify critical fixes in modals.js
echo.
echo [✓] Checking critical fixes in modals.js...
findstr /C:"document.body.contains(elementToFocus)" Scripts\modals.js >nul 2>&1
if %errorlevel% equ 0 (
    echo   [✓] Focus restoration fix present
) else (
    echo   [✗] Focus restoration fix missing
    set /a ERRORS=%ERRORS%+1
)

findstr /C:"modalAccessibility.previouslyFocusedElement = null" Scripts\modals.js >nul 2>&1
if %errorlevel% equ 0 (
    echo   [✓] Modal accessibility reset present
) else (
    echo   [✗] Modal accessibility reset missing
    set /a ERRORS=%ERRORS%+1
)

REM Check 4: Verify overlay fixes in app.js
echo.
echo [✓] Checking overlay fixes in app.js...
findstr /C:"setOverlayVisibility();" Scripts\app.js >nul 2>&1
if %errorlevel% equ 0 (
    REM Count occurrences (approximate - batch is limited here)
    for /f %%a in ('findstr /C:"setOverlayVisibility();" Scripts\app.js ^| find /c /v ""') do set COUNT=%%a
    if %COUNT% geq 6 (
        echo   [✓] setOverlayVisibility^(^) called %COUNT% times
    ) else (
        echo   [!] setOverlayVisibility^(^) called only %COUNT% times ^(expected 6+^)
        set /a WARNINGS=%WARNINGS%+1
    )
) else (
    echo   [✗] setOverlayVisibility^(^) calls missing
    set /a ERRORS=%ERRORS%+1
)

REM Check 5: Verify documentation
echo.
echo [✓] Checking documentation...
if exist "TESTING-CHECKLIST.md" (
    echo   [✓] TESTING-CHECKLIST.md found
) else (
    echo   [!] TESTING-CHECKLIST.md missing
    set /a WARNINGS=%WARNINGS%+1
)

if exist "FIXES-SUMMARY.md" (
    echo   [✓] FIXES-SUMMARY.md found
) else (
    echo   [!] FIXES-SUMMARY.md missing
    set /a WARNINGS=%WARNINGS%+1
)

REM Check 6: Verify HTML structure
echo.
echo [✓] Checking HTML structure...
if exist "index.html" (
    findstr /C:"id=\"overlay\"" index.html >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [✓] overlay element found
    ) else (
        echo   [✗] overlay element missing
        set /a ERRORS=%ERRORS%+1
    )

    findstr /C:"favicon.svg" index.html >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [✓] favicon link found
    ) else (
        echo   [✗] favicon link missing
        set /a ERRORS=%ERRORS%+1
    )
) else (
    echo   [✗] index.html missing
    set /a ERRORS=%ERRORS%+1
)

REM Summary
echo.
echo ==========================================
echo   Verification Summary
echo ==========================================

if %ERRORS% equ 0 if %WARNINGS% equ 0 (
    echo [✓] ALL CHECKS PASSED!
    echo.
    echo Your Budgie application is ready to run.
    echo Start the server with: START-SERVER.bat
    echo Then open: http://localhost:8000
    echo.
    echo See TESTING-CHECKLIST.md for complete testing guide.
    exit /b 0
)

if %ERRORS% equ 0 (
    echo [!] %WARNINGS% warning^(s^) found ^(non-critical^)
    echo.
    echo Application should still work correctly.
    echo Start the server with: START-SERVER.bat
    exit /b 0
) else (
    echo [✗] %ERRORS% error^(s^) found
    if %WARNINGS% gtr 0 (
        echo [!] %WARNINGS% warning^(s^) found
    )
    echo.
    echo Please review the errors above and fix them.
    echo See FIXES-SUMMARY.md for details on the fixes.
    exit /b 1
)
