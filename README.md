# Budgie

Budgie is a personal budgeting application for the desktop (Tkinter) with a shared Android module. Kivy is used only on Android.

![Screenshot](docs/screenshot.png)

## Quick start

### Linux/macOS
```bash
./install.sh
python -m app
```

### Windows
```powershell
./install.ps1
python -m app
```

## Build
```bash
pyinstaller --onefile app.py
```

## Notes
- Calendar weeks start on Saturday by default. Toggle via **View → Week starts on Saturday**.
- Desktop dependencies are in `requirements.txt`; Android extras live in `requirements-android.txt` and `pyproject.toml`.

## Migration
Reinstall dependencies using the new install scripts and note the Saturday-first-weekday preference is stored in user settings.
