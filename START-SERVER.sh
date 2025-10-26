#!/bin/bash

# Budgie - Local Server Startup Script
# This script starts a local web server to run the Budgie application
# ES6 modules require HTTP/HTTPS protocol (not file://)

echo "=========================================="
echo "  Budgie - Personal Budget Manager"
echo "  Starting Local Web Server..."
echo "=========================================="
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to that directory
cd "$SCRIPT_DIR"

# Check for Python 3
if command -v python3 &> /dev/null; then
    echo "✓ Python 3 found"
    echo "Starting server on http://localhost:8000"
    echo ""
    echo "INSTRUCTIONS:"
    echo "1. Open your browser"
    echo "2. Go to: http://localhost:8000"
    echo "3. To stop the server, press Ctrl+C"
    echo ""
    echo "=========================================="
    echo ""
    python3 -m http.server 8000

# Check for Python 2
elif command -v python &> /dev/null; then
    echo "✓ Python 2 found"
    echo "Starting server on http://localhost:8000"
    echo ""
    echo "INSTRUCTIONS:"
    echo "1. Open your browser"
    echo "2. Go to: http://localhost:8000"
    echo "3. To stop the server, press Ctrl+C"
    echo ""
    echo "=========================================="
    echo ""
    python -m SimpleHTTPServer 8000

# Check for PHP
elif command -v php &> /dev/null; then
    echo "✓ PHP found"
    echo "Starting server on http://localhost:8000"
    echo ""
    echo "INSTRUCTIONS:"
    echo "1. Open your browser"
    echo "2. Go to: http://localhost:8000"
    echo "3. To stop the server, press Ctrl+C"
    echo ""
    echo "=========================================="
    echo ""
    php -S localhost:8000

# No suitable server found
else
    echo "❌ ERROR: No suitable server found!"
    echo ""
    echo "Please install one of the following:"
    echo "  - Python 3: https://www.python.org/downloads/"
    echo "  - Python 2: https://www.python.org/downloads/"
    echo "  - PHP: https://www.php.net/downloads"
    echo "  - Node.js with http-server: npm install -g http-server"
    echo ""
    echo "Or use VS Code with the 'Live Server' extension"
    echo ""
    exit 1
fi
