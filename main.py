import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import os
import logging
from datetime import datetime

# Simple preferences handling
class UserPreferences:
    def __init__(self, path="budgie_prefs.json"):
        self.path = path
        self.data = {
            "theme": "light",
            "last_file": "budget.json"
        }
        self.load()

    def load(self):
        if os.path.exists(self.path):
            try:
                with open(self.path, "r") as f:
                    self.data.update(json.load(f))
            except Exception:
                pass

    def save(self):
        try:
            with open(self.path, "w") as f:
                json.dump(self.data, f, indent=2)
        except Exception:
            pass

# Basic transaction model
class Transaction:
    def __init__(self, name, amount, ttype="expense"):
        self.name = name
        self.amount = float(amount)
        self.ttype = ttype
        self.date = datetime.now().date()

    def to_dict(self):
        return {
            "name": self.name,
            "amount": self.amount,
            "ttype": self.ttype,
            "date": self.date.isoformat()
        }

    @classmethod
    def from_dict(cls, data):
        t = cls(data["name"], data["amount"], data.get("ttype", "expense"))
        t.date = datetime.fromisoformat(data["date"]).date()
        return t

# Holds all transactions and saves/loads
class BudgetCalculator:
    def __init__(self):
        self.transactions = []

    def add_transaction(self, t):
        self.transactions.append(t)

    def to_dict(self):
        return {"transactions": [t.to_dict() for t in self.transactions]}

    def from_dict(self, data):
        self.transactions = [Transaction.from_dict(d) for d in data.get("transactions", [])]

# Logging setup
logger = logging.getLogger("Budgie")
logger.setLevel(logging.INFO)
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
file_handler = logging.FileHandler("budgie.log")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

class TextHandler(logging.Handler):
    def __init__(self, widget):
        super().__init__()
        self.widget = widget

    def emit(self, record):
        msg = self.format(record)
        self.widget.configure(state="normal")
        self.widget.insert(tk.END, msg + "\n")
        self.widget.configure(state="disabled")
        self.widget.see(tk.END)

# Main application
class BudgieApp:
    def __init__(self, root):
        self.root = root
        self.preferences = UserPreferences()
        self.calculator = BudgetCalculator()
        self.data_file = self.preferences.data.get("last_file", "budget.json")
        self.setup_ui()
        self.load_data()
        logger.info("Application started")

    def setup_ui(self):
        self.root.title("Budgie")
        self.root.geometry("800x600")

        main = ttk.Frame(self.root)
        main.pack(fill=tk.BOTH, expand=True)

        # transaction list
        self.tree = ttk.Treeview(main, columns=("name","amount","type","date"), show="headings")
        for c in ("name","amount","type","date"):
            self.tree.heading(c, text=c.title())
        self.tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        btn_frame = ttk.Frame(main)
        btn_frame.pack()
        ttk.Button(btn_frame, text="Add", command=self.add_transaction_dialog).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Save", command=self.save_data).pack(side=tk.LEFT, padx=5)

        # console at bottom
        console_frame = ttk.LabelFrame(self.root, text="Console")
        console_frame.pack(fill=tk.BOTH, padx=10, pady=5)
        self.console = tk.Text(console_frame, height=8, state="disabled")
        self.console.pack(fill=tk.BOTH, expand=True)
        th = TextHandler(self.console)
        th.setFormatter(formatter)
        logger.addHandler(th)

    def add_transaction_dialog(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("Add Transaction")
        ttk.Label(dialog, text="Name:").grid(row=0,column=0,padx=5,pady=5)
        name_var = tk.StringVar()
        ttk.Entry(dialog, textvariable=name_var).grid(row=0,column=1,padx=5,pady=5)
        ttk.Label(dialog, text="Amount:").grid(row=1,column=0,padx=5,pady=5)
        amount_var = tk.StringVar()
        ttk.Entry(dialog, textvariable=amount_var).grid(row=1,column=1,padx=5,pady=5)
        ttk.Label(dialog, text="Type:").grid(row=2,column=0,padx=5,pady=5)
        type_var = tk.StringVar(value="expense")
        ttk.Combobox(dialog, textvariable=type_var, values=["income","expense"], state="readonly").grid(row=2,column=1,padx=5,pady=5)
        def save():
            try:
                t = Transaction(name_var.get(), float(amount_var.get()), type_var.get())
            except ValueError:
                messagebox.showerror("Error","Invalid amount")
                return
            self.calculator.add_transaction(t)
            logger.info(f"Added {t.ttype}: {t.name} ${t.amount}")
            self.refresh_list()
            dialog.destroy()
        ttk.Button(dialog, text="Add", command=save).grid(row=3,column=0,columnspan=2,pady=5)

    def refresh_list(self):
        for i in self.tree.get_children():
            self.tree.delete(i)
        for t in self.calculator.transactions:
            self.tree.insert("", tk.END, values=(t.name, f"${t.amount:.2f}", t.ttype, t.date))

    def load_data(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r") as f:
                    data = json.load(f)
                self.calculator.from_dict(data)
                logger.info(f"Loaded data from {self.data_file}")
            except Exception as e:
                logger.error(f"Failed to load data: {e}")
        self.refresh_list()

    def save_data(self):
        try:
            with open(self.data_file, "w") as f:
                json.dump(self.calculator.to_dict(), f, indent=2)
            logger.info(f"Saved data to {self.data_file}")
        except Exception as e:
            logger.error(f"Failed to save data: {e}")


def main():
    root = tk.Tk()
    app = BudgieApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
