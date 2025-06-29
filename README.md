# Budgie

Budgie is a personal budgeting application written in Python. The desktop edition uses **Tkinter** while a simplified Android build uses **Kivy**. Both versions share the same data model so updates should keep `app.py` and `android.py` in sync.

## Features

- **User Preferences** – persistent settings including theme, currency symbol and auto-save behaviour.
- **Theme Manager** – light and dark themes for the Tkinter interface.
- **Transactions** – track income and expenses with categories and frequencies.
- **Paychecks** – model pay schedules and deductions such as taxes and insurance.
- **Savings Accounts** – monitor balances and interest.
- **Crypto Portfolio** – record cryptocurrency holdings and their values.
- **Monthly Analyzer** – view summaries of income vs expenses and other statistics.

The desktop app provides a calendar-based interface for daily budgets and an assortment of dialogs for editing data. `android.py` implements a smaller interface for mobile devices but relies on the same classes for calculations.

## Installation

### Requirements

Budgie depends on `python-dateutil` and `kivy`. Install them using `pip`:

```bash
pip install -r requirements.txt
```

### Linux

1. Ensure Python 3 is available.
2. (Optional) Create a virtual environment:
   ```bash
   python3 -m venv env
   source env/bin/activate
   ```
3. Install the requirements as shown above.
4. Launch the desktop application:
   ```bash
   python app.py
   ```

### Windows

1. Install [Python 3](https://www.python.org/downloads/).
2. (Optional) Create a virtual environment:
   ```cmd
   python -m venv env
   env\Scripts\activate
   ```
3. Install dependencies with `pip install -r requirements.txt`.
4. Run the desktop application with `python app.py`.

The Android version (`android.py`) can be copied to an Android device and executed using apps such as **Pydroid 3** which provide a Python and Kivy runtime.

## Updating

Both `app.py` and `android.py` rely on the same models. When introducing new features or changes, update **both files** so the desktop and Android experiences remain equivalent.
