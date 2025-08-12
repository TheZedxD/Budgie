#!/usr/bin/env bash
set -e
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python - <<'PY'
import sys
try:
    import tkinter  # noqa: F401
except Exception:
    sys.exit('Tkinter not available. On Debian/Ubuntu, run: sudo apt install python3-tk')
PY
echo "Environment ready. Activate with: source .venv/bin/activate"
