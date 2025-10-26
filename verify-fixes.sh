#!/bin/bash

# Budgie - Verification Script
# Quickly verify all fixes are in place

echo "=========================================="
echo "  Budgie - Verification Script"
echo "=========================================="
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

ERRORS=0
WARNINGS=0

# Check 1: Verify favicon exists
echo "✓ Checking favicon..."
if [ -f "favicon.svg" ]; then
    echo "  ✅ favicon.svg found"
else
    echo "  ❌ favicon.svg missing"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Verify JavaScript syntax
echo ""
echo "✓ Checking JavaScript syntax..."
if command -v node &> /dev/null; then
    JS_ERRORS=0
    for file in Scripts/*.js; do
        if [[ "$file" != *"smoke-test.js"* ]]; then
            if node --check "$file" 2>/dev/null; then
                echo "  ✅ $(basename "$file")"
            else
                echo "  ❌ $(basename "$file") has syntax errors"
                JS_ERRORS=$((JS_ERRORS + 1))
            fi
        fi
    done
    ERRORS=$((ERRORS + JS_ERRORS))
else
    echo "  ⚠️  Node.js not found - skipping syntax check"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 3: Verify critical fixes in modals.js
echo ""
echo "✓ Checking critical fixes in modals.js..."
if grep -q "document.body.contains(elementToFocus)" Scripts/modals.js; then
    echo "  ✅ Focus restoration fix present"
else
    echo "  ❌ Focus restoration fix missing"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "modalAccessibility.previouslyFocusedElement = null" Scripts/modals.js; then
    echo "  ✅ Modal accessibility reset present"
else
    echo "  ❌ Modal accessibility reset missing"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: Verify overlay fixes in app.js
echo ""
echo "✓ Checking overlay fixes in app.js..."
if grep -q "setOverlayVisibility();" Scripts/app.js; then
    COUNT=$(grep -c "setOverlayVisibility();" Scripts/app.js)
    if [ "$COUNT" -ge 6 ]; then
        echo "  ✅ setOverlayVisibility() called $COUNT times"
    else
        echo "  ⚠️  setOverlayVisibility() called only $COUNT times (expected 6+)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "  ❌ setOverlayVisibility() calls missing"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: Verify documentation
echo ""
echo "✓ Checking documentation..."
if [ -f "TESTING-CHECKLIST.md" ]; then
    echo "  ✅ TESTING-CHECKLIST.md found"
else
    echo "  ⚠️  TESTING-CHECKLIST.md missing"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "FIXES-SUMMARY.md" ]; then
    echo "  ✅ FIXES-SUMMARY.md found"
else
    echo "  ⚠️  FIXES-SUMMARY.md missing"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 6: Verify HTML structure
echo ""
echo "✓ Checking HTML structure..."
if [ -f "index.html" ]; then
    if grep -q 'id="overlay"' index.html; then
        echo "  ✅ overlay element found"
    else
        echo "  ❌ overlay element missing"
        ERRORS=$((ERRORS + 1))
    fi

    if grep -q 'favicon.svg' index.html; then
        echo "  ✅ favicon link found"
    else
        echo "  ❌ favicon link missing"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "  ❌ index.html missing"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "=========================================="
echo "  Verification Summary"
echo "=========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED!"
    echo ""
    echo "Your Budgie application is ready to run."
    echo "Start the server with: ./START-SERVER.sh"
    echo "Then open: http://localhost:8000"
    echo ""
    echo "See TESTING-CHECKLIST.md for complete testing guide."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found (non-critical)"
    echo ""
    echo "Application should still work correctly."
    echo "Start the server with: ./START-SERVER.sh"
    exit 0
else
    echo "❌ $ERRORS error(s) found"
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  $WARNINGS warning(s) found"
    fi
    echo ""
    echo "Please review the errors above and fix them."
    echo "See FIXES-SUMMARY.md for details on the fixes."
    exit 1
fi
