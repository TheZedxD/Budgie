import os
import json
import calendar
from datetime import datetime, date, timedelta

from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.popup import Popup
from kivy.uix.recycleview import RecycleView
from kivy.uix.recycleview.views import RecycleDataViewBehavior
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.properties import StringProperty

# --- Data Models copied from app.py (simplified) ---
class CryptoHolding:
    def __init__(self, symbol, name, amount, purchase_price=0.0, purchase_date=None):
        self.symbol = symbol.upper()
        self.name = name
        self.amount = float(amount)
        self.purchase_price = float(purchase_price)
        self.purchase_date = purchase_date or datetime.now().date()
        self.current_price = 0.0
        self.id = id(self)

    def get_purchase_value(self):
        return self.amount * self.purchase_price

    def get_current_value(self):
        return self.amount * self.current_price

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'name': self.name,
            'amount': self.amount,
            'purchase_price': self.purchase_price,
            'purchase_date': self.purchase_date.isoformat()
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            data['symbol'],
            data['name'],
            data['amount'],
            data.get('purchase_price', 0.0),
            datetime.fromisoformat(data['purchase_date']).date()
        )

class CryptoPortfolio:
    def __init__(self):
        self.holdings = []

    def add_holding(self, holding):
        self.holdings.append(holding)

    def to_dict(self):
        return {
            'holdings': [h.to_dict() for h in self.holdings]
        }

    @classmethod
    def from_dict(cls, data):
        p = cls()
        for h in data.get('holdings', []):
            p.add_holding(CryptoHolding.from_dict(h))
        return p

class SavingsAccount:
    def __init__(self, name, balance=0.0, interest_rate=0.0):
        self.name = name
        self.balance = balance
        self.interest_rate = interest_rate
        self.id = id(self)

    def to_dict(self):
        return {'name': self.name, 'balance': self.balance, 'interest_rate': self.interest_rate}

    @classmethod
    def from_dict(cls, data):
        return cls(data['name'], data.get('balance', 0.0), data.get('interest_rate', 0.0))

class Transaction:
    def __init__(self, name, amount, transaction_type, frequency="one-time", start_date=None, category="other", end_date=None):
        self.name = name
        self.amount = float(amount)
        self.transaction_type = transaction_type
        self.frequency = frequency
        self.start_date = start_date or datetime.now().date()
        self.end_date = end_date
        self.category = category
        self.id = id(self)

    def to_dict(self):
        return {
            'name': self.name,
            'amount': self.amount,
            'transaction_type': self.transaction_type,
            'frequency': self.frequency,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'category': self.category
        }

    @classmethod
    def from_dict(cls, data):
        end_date = datetime.fromisoformat(data['end_date']).date() if data.get('end_date') else None
        return cls(
            data['name'],
            data['amount'],
            data['transaction_type'],
            data['frequency'],
            datetime.fromisoformat(data['start_date']).date(),
            data.get('category', 'other'),
            end_date
        )

class Paycheck:
    def __init__(self, job_name, hourly_rate, hours_per_week, frequency="bi-weekly",
                 start_date=None, end_date=None):
        self.job_name = job_name
        self.hourly_rate = float(hourly_rate)
        self.hours_per_week = float(hours_per_week)
        self.frequency = frequency
        self.start_date = start_date or datetime.now().date()
        self.end_date = end_date
        self.id = id(self)

    def calculate_gross_pay(self):
        if self.frequency == "weekly":
            return self.hourly_rate * self.hours_per_week
        elif self.frequency == "bi-weekly":
            return self.hourly_rate * self.hours_per_week * 2
        elif self.frequency == "monthly":
            return self.hourly_rate * self.hours_per_week * 4.33
        return 0

    def calculate_pay_amount(self):
        return self.calculate_gross_pay()  # simplified without taxes

    def to_transaction(self):
        return Transaction(
            name=f"{self.job_name} Paycheck",
            amount=self.calculate_pay_amount(),
            transaction_type="income",
            frequency=self.frequency,
            start_date=self.start_date,
            end_date=self.end_date,
            category="income"
        )

    def to_dict(self):
        return {
            'job_name': self.job_name,
            'hourly_rate': self.hourly_rate,
            'hours_per_week': self.hours_per_week,
            'frequency': self.frequency,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None
        }

    @classmethod
    def from_dict(cls, data):
        end_date = datetime.fromisoformat(data['end_date']).date() if data.get('end_date') else None
        return cls(
            data['job_name'],
            data['hourly_rate'],
            data['hours_per_week'],
            data['frequency'],
            datetime.fromisoformat(data['start_date']).date(),
            end_date
        )

class BudgetCalculator:
    def __init__(self):
        self.transactions = []
        self.paychecks = []
        self.savings_accounts = []
        self.crypto_portfolio = CryptoPortfolio()

    def add_transaction(self, t):
        self.transactions.append(t)

    def remove_transaction(self, t):
        if t in self.transactions:
            self.transactions.remove(t)

    def add_paycheck(self, p):
        self.paychecks.append(p)

    def remove_paycheck(self, p):
        if p in self.paychecks:
            self.paychecks.remove(p)

    # --- Date based helpers copied from app.py ---
    def get_transactions_for_date(self, target_date):
        return self.get_all_transactions_for_date(target_date)

    def get_all_transactions_for_date(self, target_date):
        all_transactions = []

        for trans in self.transactions:
            if self._transaction_occurs_on_date(trans, target_date):
                all_transactions.append(trans)

        for paycheck in self.paychecks:
            p_trans = paycheck.to_transaction()
            if self._transaction_occurs_on_date(p_trans, target_date):
                all_transactions.append(p_trans)

        return all_transactions

    def _transaction_occurs_on_date(self, transaction, target_date):
        start_date = transaction.start_date
        end_date = transaction.end_date

        if target_date < start_date:
            return False
        if end_date and target_date > end_date:
            return False

        if transaction.frequency == "one-time":
            return start_date == target_date
        elif transaction.frequency == "daily":
            return True
        elif transaction.frequency == "weekly":
            days_diff = (target_date - start_date).days
            return days_diff >= 0 and days_diff % 7 == 0
        elif transaction.frequency == "bi-weekly":
            days_diff = (target_date - start_date).days
            return days_diff >= 0 and days_diff % 14 == 0
        elif transaction.frequency == "monthly":
            if target_date.day == start_date.day:
                return True
            if start_date.day > target_date.day:
                last_day = calendar.monthrange(target_date.year, target_date.month)[1]
                return target_date.day == last_day and start_date.day > last_day
            return False
        elif transaction.frequency == "yearly":
            return target_date.month == start_date.month and target_date.day == start_date.day
        return False

    def calculate_daily_total(self, target_date):
        txns = self.get_transactions_for_date(target_date)
        total_income = sum(t.amount for t in txns if t.transaction_type == "income")
        total_expenses = sum(t.amount for t in txns if t.transaction_type == "expense")
        return total_income - total_expenses

    def get_calendar_data(self, year, month):
        cal_data = {}
        first_day = date(year, month, 1)
        last_day = date(year, month, calendar.monthrange(year, month)[1])

        current_date = first_day
        while current_date <= last_day:
            daily_total = self.calculate_daily_total(current_date)
            cal_data[current_date.day] = {
                'total': daily_total,
                'transactions': self.get_transactions_for_date(current_date)
            }
            current_date += timedelta(days=1)

        return cal_data

    def to_dict(self):
        return {
            'transactions': [t.to_dict() for t in self.transactions],
            'paychecks': [p.to_dict() for p in self.paychecks],
            'savings_accounts': [a.to_dict() for a in self.savings_accounts],
            'crypto_portfolio': self.crypto_portfolio.to_dict()
        }

    @classmethod
    def from_dict(cls, data):
        c = cls()
        for t in data.get('transactions', []):
            c.add_transaction(Transaction.from_dict(t))
        for p in data.get('paychecks', []):
            c.add_paycheck(Paycheck.from_dict(p))
        for a in data.get('savings_accounts', []):
            c.savings_accounts.append(SavingsAccount.from_dict(a))
        cp = data.get('crypto_portfolio')
        if cp:
            c.crypto_portfolio = CryptoPortfolio.from_dict(cp)
        return c

# --- Kivy UI Classes ---
class TransactionItem(BoxLayout, RecycleDataViewBehavior):
    text = StringProperty("")

class TransactionsView(RecycleView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.refresh([])

    def refresh(self, items):
        self.data = [{'text': i} for i in items]

class CalendarScreen(Screen):
    def __init__(self, app, **kwargs):
        super().__init__(**kwargs)
        self.app = app
        self.current_month = datetime.now().month
        self.current_year = datetime.now().year

        layout = BoxLayout(orientation='vertical')

        header = BoxLayout(size_hint_y=0.1)
        header.add_widget(Button(text='<', on_release=lambda x: self.prev_month()))
        self.month_label = Label(text='')
        header.add_widget(self.month_label)
        header.add_widget(Button(text='>', on_release=lambda x: self.next_month()))
        layout.add_widget(header)

        self.grid = GridLayout(cols=7)
        layout.add_widget(self.grid)

        bottom = BoxLayout(size_hint_y=0.1)
        bottom.add_widget(Button(text='Transactions', on_release=lambda x: setattr(app.sm, 'current', 'transactions')))
        bottom.add_widget(Button(text='Paychecks', on_release=lambda x: setattr(app.sm, 'current', 'paychecks')))
        layout.add_widget(bottom)

        self.add_widget(layout)
        self.update_calendar()

    def prev_month(self):
        if self.current_month == 1:
            self.current_month = 12
            self.current_year -= 1
        else:
            self.current_month -= 1
        self.update_calendar()

    def next_month(self):
        if self.current_month == 12:
            self.current_month = 1
            self.current_year += 1
        else:
            self.current_month += 1
        self.update_calendar()

    def update_calendar(self):
        self.grid.clear_widgets()
        month_name = calendar.month_name[self.current_month]
        self.month_label.text = f"{month_name} {self.current_year}"

        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for d in days:
            self.grid.add_widget(Label(text=d))

        cal = calendar.monthcalendar(self.current_year, self.current_month)
        cal_data = self.app.calculator.get_calendar_data(self.current_year, self.current_month)

        for week in cal:
            for day in week:
                if day == 0:
                    self.grid.add_widget(Label(text=''))
                else:
                    total = cal_data.get(day, {}).get('total', 0)
                    txt = str(day)
                    if total != 0:
                        txt += f"\n${total:.0f}"
                    btn = Button(text=txt, on_release=lambda x, d=day: self.show_day(d))
                    self.grid.add_widget(btn)

    def show_day(self, day):
        selected = date(self.current_year, self.current_month, day)
        items = self.app.calculator.get_transactions_for_date(selected)
        content = BoxLayout(orientation='vertical')
        content.add_widget(Label(text=selected.strftime('%Y-%m-%d')))
        for t in items:
            content.add_widget(Label(text=f"{t.name}: {t.amount}"))
        add_btn = Button(text='Add Transaction')
        content.add_widget(add_btn)

        popup = Popup(title='Day Detail', content=content, size_hint=(0.8,0.8))

        def add_trans(instance):
            popup.dismiss()
            self.add_transaction(selected)

        add_btn.bind(on_release=add_trans)
        content.add_widget(Button(text='Close', on_release=lambda x: popup.dismiss()))
        popup.open()

    def add_transaction(self, selected_date):
        content = BoxLayout(orientation='vertical')
        name = TextInput(hint_text='Name')
        amount = TextInput(hint_text='Amount', input_filter='float')
        content.add_widget(name)
        content.add_widget(amount)

        def done(instance):
            try:
                t = Transaction(name.text, float(amount.text), 'expense', start_date=selected_date)
                self.app.calculator.add_transaction(t)
                self.app.maybe_auto_save()
                self.update_calendar()
                popup.dismiss()
            except ValueError:
                popup.dismiss()

        content.add_widget(Button(text='Add', on_release=done))
        popup = Popup(title='Add Transaction', content=content, size_hint=(0.8,0.6))
        popup.open()

class TransactionsScreen(Screen):
    def __init__(self, app, **kwargs):
        super().__init__(**kwargs)
        self.app = app
        layout = BoxLayout(orientation='vertical')
        self.view = TransactionsView(size_hint_y=0.9)
        layout.add_widget(self.view)
        btn_box = BoxLayout(size_hint_y=0.1)
        btn_box.add_widget(Button(text='Add', on_release=lambda x: self.add()))
        btn_box.add_widget(Button(text='Save', on_release=lambda x: app.save_data()))
        btn_box.add_widget(Button(text='Back', on_release=lambda x: setattr(app.sm, 'current', 'calendar')))
        layout.add_widget(btn_box)
        self.add_widget(layout)
        self.refresh()

    def refresh(self):
        items = [f"{t.name}: {t.amount}" for t in self.app.calculator.transactions]
        self.view.refresh(items)

    def add(self):
        content = BoxLayout(orientation='vertical')
        name = TextInput(hint_text='Name')
        amount = TextInput(hint_text='Amount', input_filter='float')
        content.add_widget(name)
        content.add_widget(amount)
        def done(instance):
            try:
                t = Transaction(name.text, float(amount.text), 'expense')
                self.app.calculator.add_transaction(t)
                self.app.maybe_auto_save()
                self.refresh()
                popup.dismiss()
            except ValueError:
                popup.dismiss()
        content.add_widget(Button(text='Add', on_release=done))
        popup = Popup(title='Add Transaction', content=content, size_hint=(0.8,0.6))
        popup.open()

class PaycheckScreen(Screen):
    def __init__(self, app, **kwargs):
        super().__init__(**kwargs)
        self.app = app
        layout = BoxLayout(orientation='vertical')
        self.view = TransactionsView(size_hint_y=0.9)
        layout.add_widget(self.view)
        btn_box = BoxLayout(size_hint_y=0.1)
        btn_box.add_widget(Button(text='Add', on_release=lambda x: self.add()))
        btn_box.add_widget(Button(text='Back', on_release=lambda x: setattr(app.sm, 'current', 'calendar')))
        layout.add_widget(btn_box)
        self.add_widget(layout)
        self.refresh()

    def refresh(self):
        items = [p.job_name for p in self.app.calculator.paychecks]
        self.view.refresh(items)

    def add(self):
        content = BoxLayout(orientation='vertical')
        name = TextInput(hint_text='Job Name')
        rate = TextInput(hint_text='Hourly Rate', input_filter='float')
        hours = TextInput(hint_text='Hours/Week', input_filter='float')
        content.add_widget(name)
        content.add_widget(rate)
        content.add_widget(hours)
        def done(instance):
            try:
                p = Paycheck(name.text, float(rate.text), float(hours.text))
                self.app.calculator.add_paycheck(p)
                self.app.maybe_auto_save()
                self.refresh()
                popup.dismiss()
            except ValueError:
                popup.dismiss()
        content.add_widget(Button(text='Add', on_release=done))
        popup = Popup(title='Add Paycheck', content=content, size_hint=(0.8,0.6))
        popup.open()

class BudgieAndroid(App):
    def build(self):
        self.preferences = {}
        self.data_file = os.path.join(os.getcwd(), 'budgie_data.json')
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                self.calculator = BudgetCalculator.from_dict(data)
            except Exception:
                self.calculator = BudgetCalculator()
        else:
            self.calculator = BudgetCalculator()
        self.sm = ScreenManager()
        self.sm.add_widget(CalendarScreen(self, name='calendar'))
        self.sm.add_widget(TransactionsScreen(self, name='transactions'))
        self.sm.add_widget(PaycheckScreen(self, name='paychecks'))
        return self.sm

    def save_data(self):
        with open(self.data_file, 'w') as f:
            json.dump(self.calculator.to_dict(), f, indent=2)

    def maybe_auto_save(self):
        # Always auto-save for simplicity
        self.save_data()

if __name__ == '__main__':
    BudgieAndroid().run()
