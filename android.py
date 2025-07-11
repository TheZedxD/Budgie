import os
import json
import calendar
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta

from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.anchorlayout import AnchorLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.popup import Popup
from kivy.uix.recycleview import RecycleView
from kivy.uix.spinner import Spinner
from kivy.uix.recycleview.views import RecycleDataViewBehavior
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.properties import StringProperty
from kivy.core.window import Window

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

    def get_profit_loss(self):
        return self.get_current_value() - self.get_purchase_value()

    def get_profit_loss_percentage(self):
        if self.purchase_price > 0:
            return ((self.current_price - self.purchase_price) / self.purchase_price) * 100
        return 0.0

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
        self.last_updated = None

    def add_holding(self, holding):
        self.holdings.append(holding)

    def remove_holding(self, holding):
        if holding in self.holdings:
            self.holdings.remove(holding)

    def get_total_value(self):
        return sum(h.get_current_value() for h in self.holdings)

    def get_total_cost(self):
        return sum(h.get_purchase_value() for h in self.holdings)

    def get_total_profit_loss(self):
        return self.get_total_value() - self.get_total_cost()

    def get_total_profit_loss_percentage(self):
        total_cost = self.get_total_cost()
        if total_cost > 0:
            return (self.get_total_profit_loss() / total_cost) * 100
        return 0.0

    def to_dict(self):
        return {
            'holdings': [h.to_dict() for h in self.holdings],
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }

    @classmethod
    def from_dict(cls, data):
        p = cls()
        for h in data.get('holdings', []):
            p.add_holding(CryptoHolding.from_dict(h))
        last_updated = data.get('last_updated')
        if last_updated:
            try:
                p.last_updated = datetime.fromisoformat(last_updated)
            except Exception:
                p.last_updated = None
        return p

class CryptoPriceService:
    @staticmethod
    def fetch_prices(symbols):
        try:
            import urllib.request
            import json

            if not symbols:
                return {}

            symbol_map = {
                'BTC': 'bitcoin',
                'ETH': 'ethereum',
                'ADA': 'cardano',
                'DOT': 'polkadot',
                'LINK': 'chainlink',
                'LTC': 'litecoin',
                'BCH': 'bitcoin-cash',
                'XRP': 'ripple',
                'DOGE': 'dogecoin',
                'MATIC': 'matic-network',
                'SOL': 'solana',
                'AVAX': 'avalanche-2',
                'UNI': 'uniswap',
                'ATOM': 'cosmos',
                'ALGO': 'algorand'
            }

            coin_ids = []
            for symbol in symbols:
                coin_id = symbol_map.get(symbol.upper(), symbol.lower())
                coin_ids.append(coin_id)

            if not coin_ids:
                return {}

            ids_string = ','.join(coin_ids)
            url = f"https://api.coingecko.com/api/v3/simple/price?ids={ids_string}&vs_currencies=usd"

            with urllib.request.urlopen(url, timeout=10) as response:
                data = json.loads(response.read().decode())

            prices = {}
            for i, symbol in enumerate(symbols):
                coin_id = coin_ids[i]
                if coin_id in data and 'usd' in data[coin_id]:
                    prices[symbol.upper()] = data[coin_id]['usd']

            return prices

        except Exception:
            return {}


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

class TaxCalculator:
    @staticmethod
    def calculate_federal_income_tax(annual_income, filing_status="single", allowances=1):
        standard_deductions = {
            "single": 13850,
            "married_joint": 27700,
            "married_separate": 13850,
            "head_of_household": 20800
        }

        brackets = {
            "single": [
                (10275, 0.10),
                (41775, 0.12),
                (89450, 0.22),
                (190750, 0.24),
                (364200, 0.32),
                (462550, 0.35),
                (float('inf'), 0.37)
            ],
            "married_joint": [
                (20550, 0.10),
                (83350, 0.12),
                (178850, 0.22),
                (340100, 0.24),
                (431900, 0.32),
                (647850, 0.35),
                (float('inf'), 0.37)
            ]
        }

        if filing_status not in brackets:
            filing_status = "single"

        standard_deduction = standard_deductions.get(filing_status, 13850)
        allowance_deduction = allowances * 4300
        taxable_income = max(0, annual_income - standard_deduction - allowance_deduction)

        tax = 0
        previous_bracket = 0
        for bracket_max, rate in brackets[filing_status]:
            if taxable_income <= previous_bracket:
                break
            taxable_in_bracket = min(taxable_income, bracket_max) - previous_bracket
            tax += taxable_in_bracket * rate
            previous_bracket = bracket_max
            if taxable_income <= bracket_max:
                break
        return tax

    @staticmethod
    def calculate_virginia_state_tax(annual_income):
        brackets = [
            (3000, 0.02),
            (5000, 0.03),
            (17000, 0.05),
            (float('inf'), 0.0575)
        ]

        tax = 0
        previous_bracket = 0
        for bracket_max, rate in brackets:
            if annual_income <= previous_bracket:
                break
            taxable_in_bracket = min(annual_income, bracket_max) - previous_bracket
            tax += taxable_in_bracket * rate
            previous_bracket = bracket_max
            if annual_income <= bracket_max:
                break
        return tax

    @staticmethod
    def calculate_fica_taxes(gross_pay):
        ss_wage_base = 160200
        ss_rate = 0.062
        medicare_rate = 0.0145
        additional_medicare_rate = 0.009

        social_security = min(gross_pay, ss_wage_base) * ss_rate
        medicare = gross_pay * medicare_rate
        if gross_pay > 200000:
            medicare += (gross_pay - 200000) * additional_medicare_rate
        return social_security, medicare

class Paycheck:
    def __init__(self, job_name, hourly_rate, hours_per_week, frequency="bi-weekly",
                 start_date=None, end_date=None, filing_status="single", allowances=1,
                 health_insurance=0.0, other_deductions=0.0):
        self.job_name = job_name
        self.hourly_rate = float(hourly_rate)
        self.hours_per_week = float(hours_per_week)
        self.frequency = frequency
        self.start_date = start_date or datetime.now().date()
        self.end_date = end_date
        self.filing_status = filing_status
        self.allowances = int(allowances)
        self.health_insurance = float(health_insurance)
        self.other_deductions = float(other_deductions)
        self.id = id(self)

    def calculate_gross_pay(self):
        if self.frequency == "daily":
            return self.hourly_rate * self.hours_per_week / 5
        elif self.frequency == "weekly":
            return self.hourly_rate * self.hours_per_week
        elif self.frequency == "bi-weekly":
            return self.hourly_rate * self.hours_per_week * 2
        elif self.frequency == "monthly":
            return self.hourly_rate * self.hours_per_week * 4.33
        return 0

    def calculate_annual_gross(self):
        gross_per_period = self.calculate_gross_pay()
        if self.frequency == "daily":
            return gross_per_period * 260
        elif self.frequency == "weekly":
            return gross_per_period * 52
        elif self.frequency == "bi-weekly":
            return gross_per_period * 26
        elif self.frequency == "monthly":
            return gross_per_period * 12
        return 0

    def calculate_tax_breakdown(self):
        annual_gross = self.calculate_annual_gross()
        gross_per_period = self.calculate_gross_pay()
        federal_annual = TaxCalculator.calculate_federal_income_tax(
            annual_gross, self.filing_status, self.allowances)
        state_annual = TaxCalculator.calculate_virginia_state_tax(annual_gross)
        ss_annual, medicare_annual = TaxCalculator.calculate_fica_taxes(annual_gross)

        periods_per_year = (
            260 if self.frequency == "daily" else
            52 if self.frequency == "weekly" else
            26 if self.frequency == "bi-weekly" else
            12
        )

        breakdown = {
            'gross_pay': gross_per_period,
            'federal_tax': federal_annual / periods_per_year,
            'state_tax': state_annual / periods_per_year,
            'social_security': ss_annual / periods_per_year,
            'medicare': medicare_annual / periods_per_year,
            'health_insurance': self.health_insurance,
            'other_deductions': self.other_deductions
        }

        total_deductions = (
            breakdown['federal_tax'] + breakdown['state_tax'] +
            breakdown['social_security'] + breakdown['medicare'] +
            breakdown['health_insurance'] + breakdown['other_deductions']
        )
        breakdown['total_deductions'] = total_deductions
        breakdown['net_pay'] = gross_per_period - total_deductions
        return breakdown

    def calculate_pay_amount(self):
        return self.calculate_tax_breakdown()['net_pay']

    def upcoming_paydates(self, start=None, end=None):
        start = start or date.today()
        if start < self.start_date:
            start = self.start_date
        if end is None:
            end = date(start.year, 12, 31)
        if self.end_date and self.end_date < end:
            end = self.end_date

        dates = []
        current = self.start_date

        # advance to first occurrence on or after start
        freq = self.frequency
        while current < start:
            if freq == "weekly":
                current += timedelta(weeks=1)
            elif freq == "bi-weekly":
                current += timedelta(weeks=2)
            elif freq == "monthly":
                current += relativedelta(months=1)
            elif freq == "daily":
                current += timedelta(days=1)
            else:  # one-time
                break

        while current <= end:
            if current >= start:
                dates.append(current)
            if freq == "weekly":
                current += timedelta(weeks=1)
            elif freq == "bi-weekly":
                current += timedelta(weeks=2)
            elif freq == "monthly":
                current += relativedelta(months=1)
            elif freq == "daily":
                current += timedelta(days=1)
            else:
                break

        return dates

    def to_transaction(self):
        return Transaction(
            name=f"{self.job_name} Paycheck (Net)",
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
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'filing_status': self.filing_status,
            'allowances': self.allowances,
            'health_insurance': self.health_insurance,
            'other_deductions': self.other_deductions
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
            end_date,
            data.get('filing_status', 'single'),
            data.get('allowances', 1),
            data.get('health_insurance', 0.0),
            data.get('other_deductions', 0.0)
        )

class BudgetCalculator:
    def __init__(self):
        self.transactions = []
        self.paychecks = []
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


    def update_crypto_prices(self):
        if not self.crypto_portfolio.holdings:
            return

        symbols = [h.symbol for h in self.crypto_portfolio.holdings]
        prices = CryptoPriceService.fetch_prices(symbols)

        for h in self.crypto_portfolio.holdings:
            if h.symbol in prices:
                h.current_price = prices[h.symbol]
        self.crypto_portfolio.last_updated = datetime.now()

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

    def calculate_running_balance(self, start_balance, target_date):
        current_date = datetime.now().date()
        balance = start_balance
        calc_date = current_date
        while calc_date <= target_date:
            balance += self.calculate_daily_total(calc_date)
            calc_date += timedelta(days=1)
        return balance

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

    def get_transactions_for_month(self, year, month):
        """Return a list of (date, transaction) tuples for the given month."""
        month_start = date(year, month, 1)
        month_end = date(year, month, calendar.monthrange(year, month)[1])

        entries = []
        current_day = month_start
        while current_day <= month_end:
            txns = self.get_transactions_for_date(current_day)
            for t in txns:
                entries.append((current_day, t))
            current_day += timedelta(days=1)
        return entries

    def to_dict(self):
        return {
            'transactions': [t.to_dict() for t in self.transactions],
            'paychecks': [p.to_dict() for p in self.paychecks],
            'crypto_portfolio': self.crypto_portfolio.to_dict()
        }

    @classmethod
    def from_dict(cls, data):
        c = cls()
        for t in data.get('transactions', []):
            c.add_transaction(Transaction.from_dict(t))
        for p in data.get('paychecks', []):
            c.add_paycheck(Paycheck.from_dict(p))
        cp = data.get('crypto_portfolio')
        if cp:
            c.crypto_portfolio = CryptoPortfolio.from_dict(cp)
        return c

# --- Kivy UI Classes ---
class TransactionItem(BoxLayout, RecycleDataViewBehavior):
    text = StringProperty("")

class PortfolioItem(BoxLayout, RecycleDataViewBehavior):
    """Row widget displaying a crypto holding in columns."""

    symbol = StringProperty("")
    amount = StringProperty("")
    value = StringProperty("")

    def __init__(self, **kwargs):
        super().__init__(orientation='horizontal', **kwargs)
        self.size_hint_y = None
        self.height = 30
        self.spacing = 10
        self.symbol_lbl = Label(size_hint_x=0.3, color=(1, 1, 1, 1))
        self.amount_lbl = Label(size_hint_x=0.3, color=(1, 1, 1, 1))
        self.value_lbl = Label(size_hint_x=0.4, color=(1, 1, 1, 1))
        self.add_widget(self.symbol_lbl)
        self.add_widget(self.amount_lbl)
        self.add_widget(self.value_lbl)

    def refresh_view_attrs(self, rv, index, data):
        self.symbol_lbl.text = data.get('symbol', '')
        self.amount_lbl.text = data.get('amount', '')
        self.value_lbl.text = data.get('value', '')
        return super().refresh_view_attrs(rv, index, data)

class TransactionsView(RecycleView):
    def __init__(self, viewclass='Button', **kwargs):
        super().__init__(**kwargs)
        # Allow different widgets for items (Button by default so callbacks work)
        self.viewclass = viewclass
        # Ensure vertical layout for list items
        from kivy.uix.recycleboxlayout import RecycleBoxLayout
        self.layout_manager = RecycleBoxLayout(default_size=(None, 40),
                                               default_size_hint=(1, None),
                                               size_hint=(1, None),
                                               orientation='vertical')
        self.layout_manager.bind(minimum_height=self.layout_manager.setter('height'))
        self.add_widget(self.layout_manager)
        self.refresh([])

    def refresh(self, items, callbacks=None):
        data = []
        for idx, text in enumerate(items):
            item = {
                'text': text,
                'color': (1, 1, 1, 1),
                'background_normal': '',
                'background_color': (0.2, 0.2, 0.2, 1),
                'halign': 'center'
            }
            if callbacks and idx < len(callbacks) and callbacks[idx]:
                item['on_release'] = callbacks[idx]
            data.append(item)
        self.data = data


class PortfolioView(RecycleView):
    """RecycleView showing crypto holdings using PortfolioItem."""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.viewclass = PortfolioItem
        from kivy.uix.recycleboxlayout import RecycleBoxLayout
        self.layout_manager = RecycleBoxLayout(
            default_size=(None, 30),
            default_size_hint=(1, None),
            size_hint=(1, None),
            orientation='vertical'
        )
        self.layout_manager.bind(minimum_height=self.layout_manager.setter('height'))
        self.add_widget(self.layout_manager)
        self.refresh([])

    def refresh(self, rows):
        data = []
        for row in rows:
            data.append({
                'symbol': row.get('symbol', ''),
                'amount': row.get('amount', ''),
                'value': row.get('value', '')
            })
        if not data:
            data.append({'symbol': '', 'amount': '', 'value': 'No holdings recorded'})
        self.data = data

class CalendarScreen(Screen):
    def __init__(self, app, **kwargs):
        super().__init__(**kwargs)
        self.app = app
        self.current_month = datetime.now().month
        self.current_year = datetime.now().year

        layout = BoxLayout(orientation='vertical')

        self.summary = Label(text='', size_hint_y=None, color=(1,1,1,1),
                             halign='center', valign='middle')
        self.summary.bind(size=self._update_summary_size, texture_size=self._update_summary_height)
        layout.add_widget(self.summary)

        header = BoxLayout(size_hint_y=0.06)
        header.add_widget(Button(text='<', size_hint_x=0.15,
                                 on_release=lambda x: self.prev_month(),
                                 background_normal='',
                                 background_color=(0.2, 0.2, 0.2, 1),
                                 color=(1, 1, 1, 1)))

        center_box = BoxLayout()
        self.month_label = Label(text='', color=(1,1,1,1), font_size='18sp')
        self.today_label = Label(text='', color=(1,1,1,1), font_size='12sp')
        center_box.add_widget(self.month_label)
        center_box.add_widget(self.today_label)
        header.add_widget(center_box)

        header.add_widget(Button(text='Today', size_hint_x=0.15,
                                 on_release=lambda x: self.goto_today(),
                                 background_normal='',
                                 background_color=(0.2,0.2,0.2,1),
                                 color=(1,1,1,1)))

        header.add_widget(Button(text='>', size_hint_x=0.15,
                                 on_release=lambda x: self.next_month(),
                                 background_normal='',
                                 background_color=(0.2,0.2,0.2,1),
                                 color=(1,1,1,1)))
        layout.add_widget(header)

        # Grid for the calendar with square cells
        self.cell_size = self._calculate_cell_size()
        self.grid = GridLayout(
            cols=7,
            size_hint=(None, None),
            row_force_default=True,
            col_force_default=True,
            row_default_height=self.cell_size,
            col_default_width=self.cell_size,
        )
        # Grid size will be configured after the first calendar update
        grid_container = AnchorLayout()
        grid_container.add_widget(self.grid)
        layout.add_widget(grid_container)

        self.add_widget(layout)
        Window.bind(size=self._on_window_size)
        self.update_calendar()
        # Initialize selected month/year in the parent app
        self.app.selected_year = self.current_year
        self.app.selected_month = self.current_month

    def _update_summary_size(self, instance, size):
        instance.text_size = (instance.width, None)

    def _update_summary_height(self, instance, size):
        instance.height = size[1]

    def _calculate_cell_size(self):
        return min(Window.width, Window.height) // 8

    def _on_window_size(self, *args):
        self.cell_size = self._calculate_cell_size()
        self.grid.row_default_height = self.cell_size
        self.grid.col_default_width = self.cell_size
        self._update_grid_size()

    def _update_grid_size(self):
        self.grid.width = self.cell_size * 7
        self.grid.height = self.cell_size * self.grid.rows

    def prev_month(self):
        if self.current_month == 1:
            self.current_month = 12
            self.current_year -= 1
        else:
            self.current_month -= 1
        self.update_calendar()
        self.app.selected_year = self.current_year
        self.app.selected_month = self.current_month

    def next_month(self):
        if self.current_month == 12:
            self.current_month = 1
            self.current_year += 1
        else:
            self.current_month += 1
        self.update_calendar()
        self.app.selected_year = self.current_year
        self.app.selected_month = self.current_month

    def goto_today(self):
        today = date.today()
        self.current_year = today.year
        self.current_month = today.month
        self.update_calendar()
        self.app.selected_year = self.current_year
        self.app.selected_month = self.current_month

    def update_calendar(self):
        self.grid.clear_widgets()
        self.app.selected_year = self.current_year
        self.app.selected_month = self.current_month
        month_name = calendar.month_name[self.current_month]
        self.month_label.text = f"{month_name} {self.current_year}"
        self.today_label.text = date.today().strftime('%Y-%m-%d')

        today = date.today()

        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for d in days:
            self.grid.add_widget(Label(text=d, size_hint_y=None, height=30, color=(1,1,1,1)))

        first_weekday, num_days = calendar.monthrange(self.current_year, self.current_month)
        weeks = []
        week = [0] * first_weekday
        day_num = 1
        while day_num <= num_days:
            week.append(day_num)
            if len(week) == 7:
                weeks.append(week)
                week = []
            day_num += 1
        if week:
            while len(week) < 7:
                week.append(0)
            weeks.append(week)

        self.grid.rows = len(weeks) + 1
        self._update_grid_size()

        cal_data = self.app.calculator.get_calendar_data(self.current_year, self.current_month)

        income_total = 0
        expense_total = 0

        for week in weeks:
            for day in week:
                if day == 0:
                    self.grid.add_widget(
                        Label(text='', size_hint=(None, None), size=(self.cell_size, self.cell_size))
                    )
                else:
                    total = cal_data.get(day, {}).get('total', 0)
                    for t in cal_data.get(day, {}).get('transactions', []):
                        if t.transaction_type == 'income':
                            income_total += t.amount
                        else:
                            expense_total += t.amount
                    txt = str(day)
                    bg = (0.2, 0.2, 0.2, 1)
                    if total > 0:
                        bg = (0.1, 0.6, 0.1, 1)
                    elif total < 0:
                        bg = (0.6, 0.1, 0.1, 1)
                    txt_color = (1, 1, 1, 1)
                    if (day == today.day and self.current_month == today.month and
                            self.current_year == today.year):
                        bg = (0.2, 0.4, 1.0, 1)
                        txt_color = (1, 1, 1, 1)
                    btn = Button(
                        text=f'[u][b]{txt}[/b][/u]',
                        markup=True,
                        size_hint=(None, None),
                        size=(self.cell_size, self.cell_size),
                        on_release=lambda x, d=day: self.show_day(d),
                        background_normal='',
                        background_color=bg,
                        color=txt_color,
                    )
                    self.grid.add_widget(btn)

        net = income_total - expense_total
        today_str = today.strftime('%Y-%m-%d')
        self.summary.text = (
            f"Income: ${income_total:.0f}  Expenses: ${expense_total:.0f}\n"
            f"Net: ${net:+.0f}  Today: {today_str}"
        )

    def show_day(self, day):
        selected = date(self.current_year, self.current_month, day)
        items = self.app.calculator.get_transactions_for_date(selected)
        content = BoxLayout(orientation='vertical', padding=10, spacing=10)
        content.add_widget(Label(text=selected.strftime('%Y-%m-%d'), color=(1,1,1,1), size_hint_y=None, height=30))
        for t in items:
            content.add_widget(Label(text=f"{t.name}: {t.amount:+.2f}", color=(1,1,1,1), size_hint_y=None, height=30))

        daily_total = self.app.calculator.calculate_daily_total(selected)
        content.add_widget(Label(text=f"Total: ${daily_total:+.2f}", color=(1,1,1,1), size_hint_y=None, height=30))
        btn_box = BoxLayout(size_hint_y=None, height=40, spacing=10)
        add_btn = Button(text='Add', background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1))
        close_btn = Button(text='Close', background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1))
        btn_box.add_widget(add_btn)
        btn_box.add_widget(close_btn)
        content.add_widget(btn_box)

        popup = Popup(title='Day Detail', content=content, size_hint=(0.7,0.5))

        def add_trans(instance):
            popup.dismiss()
            self.add_transaction(selected)

        add_btn.bind(on_release=add_trans)
        close_btn.bind(on_release=lambda x: popup.dismiss())
        popup.open()

    def add_transaction(self, selected_date):
        content = BoxLayout(orientation='vertical')
        name = TextInput(hint_text='Name')
        amount = TextInput(hint_text='Amount', input_filter='float')
        t_type = Spinner(text='expense', values=['expense', 'income'])
        freq = Spinner(text='one-time',
                       values=['one-time', 'weekly', 'bi-weekly', 'monthly', 'yearly'])
        category = TextInput(hint_text='Category')
        content.add_widget(name)
        content.add_widget(amount)
        content.add_widget(t_type)
        content.add_widget(freq)
        content.add_widget(category)

        def done(instance):
            try:
                t = Transaction(name.text,
                                float(amount.text),
                                t_type.text,
                                frequency=freq.text,
                                start_date=selected_date,
                                category=category.text or 'other')
                self.app.calculator.add_transaction(t)
                self.app.maybe_auto_save()
                self.update_calendar()
                self.app.show_message('Transaction added.', title='Added')
                popup.dismiss()
            except ValueError:
                popup.dismiss()

        content.add_widget(Button(text='Add', on_release=done,
                                 background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        popup = Popup(title='Add Transaction', content=content, size_hint=(0.7,0.6))
        popup.open()

class TransactionsScreen(Screen):
    def __init__(self, app, **kwargs):
        super().__init__(**kwargs)
        self.app = app
        layout = BoxLayout(orientation='vertical')

        # Information label shown above the list
        self.summary = Label(text='', size_hint_y=None, color=(1,1,1,1),
                             halign='center', valign='middle')
        self.summary.bind(size=lambda i, s: i.setter('text_size')(i, (i.width, None)),
                           texture_size=lambda i, s: i.setter('height')(i, s[1]))
        layout.add_widget(self.summary)

        header_row = BoxLayout(size_hint_y=None, height=30)
        for text in ['Symbol', 'Amount', 'Value']:
            header_row.add_widget(Label(text=text, color=(1, 1, 1, 1)))
        layout.add_widget(header_row)

        self.view = PortfolioView(size_hint_y=0.8)
        layout.add_widget(self.view)
        btn_box = BoxLayout(size_hint_y=0.1)
        btn_box.add_widget(Button(text='Add', on_release=lambda x: self.add(),
                                  background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        btn_box.add_widget(Button(text='Refresh', on_release=lambda x: self.refresh(),
                                  background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        btn_box.add_widget(Button(text='Back', on_release=lambda x: setattr(app.sm, 'current', 'calendar'),
                                  background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        layout.add_widget(btn_box)
        self.add_widget(layout)
        self.refresh()

    def on_pre_enter(self):
        self.refresh()

    def refresh(self):
        items = []
        income_total = 0
        expense_total = 0

        year = self.app.selected_year
        month = self.app.selected_month

        entries = self.app.calculator.get_transactions_for_month(year, month)
        for dt, t in entries:
            items.append(f"{dt.strftime('%Y-%m-%d')} {t.name}: {t.amount:+.2f} ({t.frequency})")
            if t.transaction_type == 'income':
                income_total += t.amount
            else:
                expense_total += t.amount

        net = income_total - expense_total
        month_name = calendar.month_name[month]
        self.summary.text = (
            f"{month_name} {year} - Income: ${income_total:.2f}  Expenses: ${expense_total:.2f}\n"
            f"Net: ${net:+.2f}")

        # Include paycheck info
        if self.app.calculator.paychecks:
            p_info = ', '.join([
                f"{p.job_name} ${p.calculate_pay_amount():.2f}" for p in self.app.calculator.paychecks
            ])
            self.summary.text += f"\nPaychecks: {p_info}"

        if not items:
            items.append('No transactions found')

        self.view.refresh(items)

    def add(self):
        content = BoxLayout(orientation='vertical')
        name = TextInput(hint_text='Name')
        amount = TextInput(hint_text='Amount', input_filter='float')
        t_type = Spinner(text='expense', values=['expense', 'income'])
        freq = Spinner(text='one-time',
                       values=['one-time', 'weekly', 'bi-weekly', 'monthly', 'yearly'])
        category = TextInput(hint_text='Category')
        start = TextInput(hint_text='Start Date YYYY-MM-DD')
        content.add_widget(name)
        content.add_widget(amount)
        content.add_widget(t_type)
        content.add_widget(freq)
        content.add_widget(category)
        content.add_widget(start)
        def done(instance):
            try:
                sdate = None
                if start.text:
                    sdate = datetime.strptime(start.text, '%Y-%m-%d').date()
                t = Transaction(name.text,
                                float(amount.text),
                                t_type.text,
                                frequency=freq.text,
                                start_date=sdate,
                                category=category.text or 'other')
                self.app.calculator.add_transaction(t)
                self.app.maybe_auto_save()
                self.refresh()
                self.app.sm.get_screen('calendar').update_calendar()
                self.app.show_message('Transaction added.', title='Added')
                popup.dismiss()
            except ValueError:
                popup.dismiss()
        content.add_widget(Button(text='Add', on_release=done,
                                 background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        popup = Popup(title='Add Transaction', content=content, size_hint=(0.7,0.6))
        popup.open()

class PaycheckScreen(Screen):
    def __init__(self, app, **kwargs):
        super().__init__(**kwargs)
        self.app = app
        layout = BoxLayout(orientation='vertical')
        # Show paycheck summary above the list
        self.summary = Label(text='', size_hint_y=None, color=(1,1,1,1),
                             halign='center', valign='middle')
        self.summary.bind(size=lambda i, s: setattr(i, 'text_size', (i.width, None)),
                           texture_size=lambda i, s: setattr(i, 'height', s[1]))
        layout.add_widget(self.summary)

        self.view = TransactionsView(size_hint_y=0.8)
        layout.add_widget(self.view)
        btn_box = BoxLayout(size_hint_y=0.1)
        btn_box.add_widget(Button(text='Add', on_release=lambda x: self.add(),
                                  background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        # Refresh simply reloads the paycheck list
        btn_box.add_widget(Button(text='Refresh', on_release=lambda x: self.refresh(),
                                  background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        btn_box.add_widget(Button(text='Back', on_release=lambda x: setattr(app.sm, 'current', 'calendar'),
                                  background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        layout.add_widget(btn_box)
        self.add_widget(layout)
        self.refresh()

    def on_pre_enter(self):
        self.refresh()

    def refresh(self):
        year = self.app.selected_year
        month = self.app.selected_month
        month_start = date(year, month, 1)
        month_end = date(year, month,
                         calendar.monthrange(year, month)[1])

        entries = []
        total = 0

        for i, p in enumerate(self.app.calculator.paychecks):
            paydates = p.upcoming_paydates(start=month_start, end=month_end)
            for pd in paydates:
                total += p.calculate_pay_amount()
                entries.append((pd,
                                f"{pd.strftime('%m/%d')} {p.job_name}: ${p.calculate_pay_amount():.2f}",
                                lambda x, idx=i: self.edit(idx)))

        # Sort entries by date
        entries.sort(key=lambda e: e[0])

        items = [e[1] for e in entries]
        callbacks = [e[2] for e in entries]

        month_name = calendar.month_name[month]
        self.summary.text = f"{month_name} {year} - Total Net Pay: ${total:.2f}"

        if not items:
            items = ['No paychecks scheduled']
            callbacks = [None]

        self.view.refresh(items, callbacks)

    def add(self):
        content = BoxLayout(orientation='vertical')
        name = TextInput(hint_text='Job Name')
        rate = TextInput(hint_text='Hourly Rate', input_filter='float')
        hours = TextInput(hint_text='Hours/Week', input_filter='float')
        content.add_widget(name)
        content.add_widget(rate)
        content.add_widget(hours)
        freq = Spinner(text='bi-weekly',
                       values=['weekly', 'bi-weekly', 'monthly'])
        start = TextInput(hint_text='Start Date YYYY-MM-DD')
        content.add_widget(freq)
        content.add_widget(start)
        def done(instance):
            try:
                sdate = None
                if start.text:
                    sdate = datetime.strptime(start.text, '%Y-%m-%d').date()
                p = Paycheck(name.text, float(rate.text), float(hours.text),
                             frequency=freq.text, start_date=sdate)
                self.app.calculator.add_paycheck(p)
                self.app.maybe_auto_save()
                self.refresh()
                self.app.sm.get_screen('calendar').update_calendar()
                self.app.show_message('Paycheck added.', title='Added')
                popup.dismiss()
            except ValueError:
                popup.dismiss()
        content.add_widget(Button(text='Add', on_release=done,
                                 background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        popup = Popup(title='Add Paycheck', content=content, size_hint=(0.7,0.6))
        popup.open()

    def edit(self, index):
        p = self.app.calculator.paychecks[index]
        content = BoxLayout(orientation='vertical')
        name = TextInput(text=p.job_name)
        rate = TextInput(text=str(p.hourly_rate), input_filter='float')
        hours = TextInput(text=str(p.hours_per_week), input_filter='float')
        freq = Spinner(text=p.frequency, values=['weekly', 'bi-weekly', 'monthly'])
        start = TextInput(text=p.start_date.strftime('%Y-%m-%d') if p.start_date else '')
        content.add_widget(name)
        content.add_widget(rate)
        content.add_widget(hours)
        content.add_widget(freq)
        content.add_widget(start)

        btn_box = BoxLayout(size_hint_y=0.3)

        def save(instance):
            try:
                sdate = datetime.strptime(start.text, '%Y-%m-%d').date() if start.text else None
                p.job_name = name.text
                p.hourly_rate = float(rate.text)
                p.hours_per_week = float(hours.text)
                p.frequency = freq.text
                p.start_date = sdate or p.start_date
                self.app.maybe_auto_save()
                self.refresh()
                self.app.sm.get_screen('calendar').update_calendar()
                popup.dismiss()
            except ValueError:
                popup.dismiss()

        def delete(instance):
            self.app.calculator.remove_paycheck(p)
            self.app.maybe_auto_save()
            self.refresh()
            self.app.sm.get_screen('calendar').update_calendar()
            popup.dismiss()

        btn_box.add_widget(Button(text='Save', on_release=save,
                                  background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        btn_box.add_widget(Button(text='Delete', on_release=delete,
                                  background_normal='', background_color=(0.5,0.2,0.2,1), color=(1,1,1,1)))
        content.add_widget(btn_box)
        popup = Popup(title='Edit Paycheck', content=content, size_hint=(0.7,0.7))
        popup.open()


class PortfolioScreen(Screen):
    def __init__(self, app, **kwargs):
        super().__init__(**kwargs)
        self.app = app
        layout = BoxLayout(orientation='vertical')
        # Show portfolio total
        self.summary = Label(text='', size_hint_y=None, color=(1,1,1,1),
                             halign='center', valign='middle', font_size='18sp')
        self.summary.bind(size=lambda i, s: setattr(i, 'text_size', (i.width, None)),
                           texture_size=lambda i, s: setattr(i, 'height', s[1]))
        layout.add_widget(self.summary)

        self.view = TransactionsView(size_hint_y=0.8)
        layout.add_widget(self.view)
        btn_box = BoxLayout(size_hint_y=0.1)
        btn_box.add_widget(Button(text='Add', on_release=lambda x: self.add(),
                                  background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        btn_box.add_widget(Button(text='Refresh', on_release=lambda x: self.refresh(),
                                  background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        btn_box.add_widget(Button(text='Back', on_release=lambda x: setattr(app.sm, 'current', 'calendar'),
                                  background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        layout.add_widget(btn_box)
        self.add_widget(layout)
        self.refresh()

    def on_pre_enter(self):
        self.refresh()

    def refresh(self):
        self.app.calculator.update_crypto_prices()
        rows = []
        total = 0

        for h in self.app.calculator.crypto_portfolio.holdings:
            value = h.get_current_value()
            total += value
            rows.append({
                'symbol': h.symbol,
                'amount': f"{h.amount:.8f}",
                'value': f"${value:.2f}"
            })

        last_updated = self.app.calculator.crypto_portfolio.last_updated
        if last_updated:
            updated = last_updated.strftime('%Y-%m-%d %H:%M')
            self.summary.text = f"Total Portfolio Value: ${total:.2f} (Updated {updated})"
        else:
            self.summary.text = f"Total Portfolio Value: ${total:.2f}"

        self.view.refresh(rows)

    def refresh_prices(self):
        self.refresh()

    def add(self):
        content = BoxLayout(orientation='vertical')
        sym = TextInput(hint_text='Symbol')
        amt = TextInput(hint_text='Amount', input_filter='float')
        content.add_widget(sym)
        content.add_widget(amt)
        def done(instance):
            try:
                h = CryptoHolding(sym.text, sym.text, float(amt.text))
                self.app.calculator.crypto_portfolio.add_holding(h)
                self.app.calculator.update_crypto_prices()
                self.app.maybe_auto_save()
                self.refresh()
                self.app.show_message('Holding added.', title='Added')
                popup.dismiss()
            except ValueError:
                popup.dismiss()
        content.add_widget(Button(text='Add', on_release=done,
                                 background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        popup = Popup(title='Add Holding', content=content, size_hint=(0.7,0.6))
        popup.open()

class SettingsScreen(Screen):
    def __init__(self, app, **kwargs):
        super().__init__(**kwargs)
        self.app = app
        layout = BoxLayout(orientation='vertical')
        layout.add_widget(Label(text='Settings', color=(1,1,1,1)))
        layout.add_widget(Button(text='Save Data', on_release=lambda x: app.save_data(),
                                 background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        layout.add_widget(Button(text='Clear Data', on_release=lambda x: app.confirm_clear_data(),
                                 background_normal='', background_color=(0.5,0.2,0.2,1), color=(1,1,1,1)))
        layout.add_widget(Button(text='Back', on_release=lambda x: setattr(app.sm, 'current', 'calendar'),
                                 background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))
        self.add_widget(layout)

class BudgieAndroid(App):
    def show_message(self, message, title='Info'):
        content = BoxLayout(orientation='vertical')
        content.add_widget(Label(text=message))
        btn = Button(text='OK', size_hint_y=0.3,
                     background_normal='', background_color=(0.2,0.2,0.2,1),
                     color=(1,1,1,1))
        content.add_widget(btn)
        popup = Popup(title=title, content=content, size_hint=(0.6, 0.4))
        btn.bind(on_release=popup.dismiss)
        popup.open()

    def build(self):
        Window.clearcolor = (0.1, 0.1, 0.1, 1)
        self.preferences = {}
        self.data_file = os.path.join(os.getcwd(), 'budgie_data.json')
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                self.calculator = BudgetCalculator.from_dict(data)
                if self.calculator.crypto_portfolio.holdings:
                    self.calculator.update_crypto_prices()
            except Exception:
                self.calculator = BudgetCalculator()
        else:
            self.calculator = BudgetCalculator()

        now = datetime.now()
        self.selected_year = now.year
        self.selected_month = now.month

        self.sm = ScreenManager()
        self.sm.add_widget(CalendarScreen(self, name='calendar'))
        self.sm.add_widget(TransactionsScreen(self, name='transactions'))
        self.sm.add_widget(PaycheckScreen(self, name='paychecks'))
        self.sm.add_widget(PortfolioScreen(self, name='portfolio'))
        self.sm.add_widget(SettingsScreen(self, name='settings'))

        # Refresh screens so loaded data is displayed immediately
        for screen in self.sm.screens:
            if hasattr(screen, 'refresh'):
                screen.refresh()

        root = BoxLayout(orientation='vertical')
        root.add_widget(self.sm)

        nav = BoxLayout(size_hint_y=0.08)
        def add_nav(text, screen):
            nav.add_widget(Button(text=text, size_hint_x=0.2,
                                  on_release=lambda x: setattr(self.sm, 'current', screen),
                                  background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1)))

        add_nav('Home', 'calendar')
        add_nav('Trans', 'transactions')
        add_nav('Pay', 'paychecks')
        add_nav('Crypto', 'portfolio')
        add_nav('Settings', 'settings')

        root.add_widget(nav)
        return root

    def save_data(self, show_popup=True):
        with open(self.data_file, 'w') as f:
            json.dump(self.calculator.to_dict(), f, indent=2)
        if show_popup:
            self.show_message('Data saved successfully.', title='Saved')

    def confirm_clear_data(self):
        content = BoxLayout(orientation='vertical')
        content.add_widget(Label(text='Clear all saved data?'))
        btn_box = BoxLayout(size_hint_y=0.3)
        yes_btn = Button(text='Yes', background_normal='', background_color=(0.5,0.2,0.2,1), color=(1,1,1,1))
        no_btn = Button(text='No', background_normal='', background_color=(0.2,0.2,0.2,1), color=(1,1,1,1))
        btn_box.add_widget(yes_btn)
        btn_box.add_widget(no_btn)
        content.add_widget(btn_box)
        popup = Popup(title='Confirm', content=content, size_hint=(0.7,0.4))
        yes_btn.bind(on_release=lambda x: (popup.dismiss(), self.clear_data()))
        no_btn.bind(on_release=popup.dismiss)
        popup.open()

    def clear_data(self):
        self.calculator = BudgetCalculator()
        try:
            os.remove(self.data_file)
        except OSError:
            pass
        for screen in self.sm.screens:
            if hasattr(screen, 'refresh'):
                screen.refresh()
        self.show_message('All data cleared.', title='Cleared')

    def maybe_auto_save(self):
        # Always auto-save for simplicity
        self.save_data(show_popup=False)

if __name__ == '__main__':
    BudgieAndroid().run()
