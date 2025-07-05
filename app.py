import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import calendar
import json
import os
import math
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta
import copy

class UserPreferences:
    def __init__(self):
        self.prefs_file = os.path.join(os.getcwd(), "budgie_preferences.json")
        self.default_prefs = {
            'theme': 'light',
            'colors': {
                'income': '#4CAF50',
                'expense': '#F44336',
                'savings': '#2196F3',
                'investment': '#9C27B0',
                'entertainment': '#FF9800',
                'utilities': '#607D8B',
                'food': '#8BC34A',
                'transportation': '#795548',
                'other': '#757575',
                'positive_day': '#E8F5E8',
                'negative_day': '#FFE8E8',
                'neutral_day': '#F5F5F5'
            },
            'default_data_directory': os.getcwd(),
            'window_geometry': '1200x800',
            'auto_save': True,
            'show_weekends': True,
            'currency_symbol': '$',
            'date_format': '%Y-%m-%d',
            'decimal_places': 2,
            'show_cents': True
        }
        self.preferences = self.load_preferences()
    
    def load_preferences(self):
        try:
            if os.path.exists(self.prefs_file):
                with open(self.prefs_file, 'r') as f:
                    loaded_prefs = json.load(f)
                prefs = self.default_prefs.copy()
                prefs.update(loaded_prefs)
                return prefs
        except Exception as e:
            print(f"Error loading preferences: {e}")
        return self.default_prefs.copy()
    
    def save_preferences(self):
        try:
            with open(self.prefs_file, 'w') as f:
                json.dump(self.preferences, f, indent=2)
        except Exception as e:
            print(f"Error saving preferences: {e}")
    
    def get(self, key, default=None):
        return self.preferences.get(key, default)
    
    def set(self, key, value):
        self.preferences[key] = value
        self.save_preferences()

class ThemeManager:
    def __init__(self, preferences):
        self.preferences = preferences
        self.themes = {
            'light': {
                'bg': '#ffffff',
                'fg': '#2c2c2c',
                'select_bg': '#0078d4',
                'select_fg': '#ffffff',
                'entry_bg': '#ffffff',
                'entry_fg': '#2c2c2c',
                'button_bg': '#f8f9fa',
                'button_hover': '#e9ecef',
                'frame_bg': '#ffffff',
                'label_bg': '#ffffff',
                'tree_bg': '#ffffff',
                'tree_fg': '#2c2c2c',
                'tree_select_bg': '#0078d4',
                'tree_select_fg': '#ffffff',
                'menu_bg': '#ffffff',
                'menu_fg': '#2c2c2c',
                'dialog_bg': '#ffffff',
                'border_color': '#dee2e6',
                'labelframe_bg': '#f8f9fa',
                'header_bg': '#f8f9fa',
                'accent': '#0078d4'
            },
            'dark': {
                'bg': '#1e1e1e',
                'fg': '#ffffff',
                'select_bg': '#0078d4',
                'select_fg': '#ffffff',
                'entry_bg': '#2d2d2d',
                'entry_fg': '#ffffff',
                'button_bg': '#2d2d2d',
                'button_hover': '#3d3d3d',
                'frame_bg': '#1e1e1e',
                'label_bg': '#1e1e1e',
                'tree_bg': '#2d2d2d',
                'tree_fg': '#ffffff',
                'tree_select_bg': '#0078d4',
                'tree_select_fg': '#ffffff',
                'menu_bg': '#2d2d2d',
                'menu_fg': '#ffffff',
                'dialog_bg': '#1e1e1e',
                'border_color': '#404040',
                'labelframe_bg': '#2d2d2d',
                'header_bg': '#2d2d2d',
                'accent': '#0078d4'
            }
        }
    
    def get_theme(self):
        theme_name = self.preferences.get('theme', 'light')
        return self.themes.get(theme_name, self.themes['light'])
    
    def apply_theme(self, root):
        theme = self.get_theme()
        is_dark = self.preferences.get('theme') == 'dark'
        
        # Set root window background
        root.configure(bg=theme['bg'])
        
        # Configure ttk style
        style = ttk.Style()
        
        if is_dark:
            style.theme_use('clam')
        else:
            style.theme_use('clam')
        
        # Configure all ttk styles
        style.configure('.',
                       background=theme['bg'],
                       foreground=theme['fg'],
                       fieldbackground=theme['entry_bg'],
                       bordercolor=theme['border_color'],
                       lightcolor=theme['border_color'],
                       darkcolor=theme['border_color'],
                       focuscolor=theme['accent'])
        
        style.configure('TLabel',
                       background=theme['label_bg'],
                       foreground=theme['fg'])
        
        style.configure('TFrame',
                       background=theme['frame_bg'],
                       borderwidth=0)
        
        style.configure('TLabelFrame',
                       background=theme['labelframe_bg'],
                       foreground=theme['fg'],
                       borderwidth=1,
                       relief='solid')
        
        style.configure('TLabelFrame.Label',
                       background=theme['labelframe_bg'],
                       foreground=theme['fg'],
                       font=('Arial', 9, 'bold'))
        
        style.configure('TButton',
                       background=theme['button_bg'],
                       foreground=theme['fg'],
                       borderwidth=1,
                       relief='raised',
                       padding=(8, 4))
        
        style.map('TButton',
                 background=[('active', theme['button_hover']),
                           ('pressed', theme['accent'])],
                 foreground=[('pressed', theme['select_fg'])])
        
        style.configure('TEntry',
                       fieldbackground=theme['entry_bg'],
                       foreground=theme['entry_fg'],
                       bordercolor=theme['border_color'],
                       insertcolor=theme['fg'],
                       borderwidth=1)
        
        style.configure('TCombobox',
                       fieldbackground=theme['entry_bg'],
                       foreground=theme['entry_fg'],
                       bordercolor=theme['border_color'],
                       arrowcolor=theme['fg'])
        
        style.configure('Treeview',
                       background=theme['tree_bg'],
                       foreground=theme['tree_fg'],
                       fieldbackground=theme['tree_bg'],
                       borderwidth=1)
        
        style.configure('Treeview.Heading',
                       background=theme['button_bg'],
                       foreground=theme['fg'],
                       font=('Arial', 9, 'bold'))
        
        style.map('Treeview',
                 background=[('selected', theme['tree_select_bg'])],
                 foreground=[('selected', theme['tree_select_fg'])])
        
        style.configure('TNotebook',
                       background=theme['frame_bg'],
                       borderwidth=1)
        
        style.configure('TNotebook.Tab',
                       background=theme['button_bg'],
                       foreground=theme['fg'],
                       padding=(12, 8))
        
        style.map('TNotebook.Tab',
                 background=[('selected', theme['accent']),
                           ('active', theme['button_hover'])],
                 foreground=[('selected', theme['select_fg'])])
        
        style.configure('TScrollbar',
                       background=theme['button_bg'],
                       troughcolor=theme['bg'],
                       borderwidth=1,
                       arrowcolor=theme['fg'])
        
        style.configure('TPanedwindow',
                       background=theme['frame_bg'])
        
        # Header style for month display
        style.configure('Header.TLabel',
                       background=theme['header_bg'],
                       foreground=theme['accent'],
                       font=('Arial', 18, 'bold'),
                       padding=(10, 10))
        
        # Configure menu colors
        try:
            root.option_add('*Menu.background', theme['menu_bg'])
            root.option_add('*Menu.foreground', theme['menu_fg'])
            root.option_add('*Menu.activeBackground', theme['accent'])
            root.option_add('*Menu.activeForeground', theme['select_fg'])
            root.option_add('*Menu.selectColor', theme['accent'])
        except:
            pass

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
        return sum(holding.get_current_value() for holding in self.holdings)
    
    def get_total_cost(self):
        return sum(holding.get_purchase_value() for holding in self.holdings)
    
    def get_total_profit_loss(self):
        return self.get_total_value() - self.get_total_cost()
    
    def get_total_profit_loss_percentage(self):
        total_cost = self.get_total_cost()
        if total_cost > 0:
            return (self.get_total_profit_loss() / total_cost) * 100
        return 0.0
    
    def to_dict(self):
        return {
            'holdings': [holding.to_dict() for holding in self.holdings],
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }
    
    @classmethod
    def from_dict(cls, data):
        portfolio = cls()
        for holding_data in data.get('holdings', []):
            holding = CryptoHolding.from_dict(holding_data)
            portfolio.add_holding(holding)
        last_updated = data.get('last_updated')
        if last_updated:
            try:
                portfolio.last_updated = datetime.fromisoformat(last_updated)
            except Exception:
                portfolio.last_updated = None
        return portfolio

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
            
        except Exception as e:
            print(f"Error fetching crypto prices: {e}")
            return {}

class SavingsAccount:
    def __init__(self, name, balance=0.0, interest_rate=0.0):
        self.name = name
        self.balance = balance
        self.interest_rate = interest_rate
        self.id = id(self)
    
    def to_dict(self):
        return {
            'name': self.name,
            'balance': self.balance,
            'interest_rate': self.interest_rate
        }
    
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
        trans = cls(
            data['name'],
            data['amount'],
            data['transaction_type'],
            data['frequency'],
            datetime.fromisoformat(data['start_date']).date(),
            data.get('category', 'other'),
            end_date
        )
        return trans

class TaxCalculator:
    @staticmethod
    def calculate_federal_income_tax(annual_income, filing_status="single", allowances=1):
        """Calculate federal income tax based on 2023 tax brackets"""
        # Standard deduction for 2023
        standard_deductions = {
            "single": 13850,
            "married_joint": 27700,
            "married_separate": 13850,
            "head_of_household": 20800
        }
        
        # Tax brackets for 2023
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
        
        # Calculate taxable income
        standard_deduction = standard_deductions.get(filing_status, 13850)
        allowance_deduction = allowances * 4300  # Rough estimate for allowances
        taxable_income = max(0, annual_income - standard_deduction - allowance_deduction)
        
        # Calculate tax
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
        """Calculate Virginia state income tax"""
        # Virginia tax brackets for 2023
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
        """Calculate Social Security and Medicare taxes"""
        # 2023 limits
        ss_wage_base = 160200
        ss_rate = 0.062
        medicare_rate = 0.0145
        additional_medicare_rate = 0.009  # On income over $200k
        
        # For simplicity, calculate on annual basis
        social_security = min(gross_pay, ss_wage_base) * ss_rate
        medicare = gross_pay * medicare_rate
        
        # Additional Medicare tax on high earners
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
        self.health_insurance = float(health_insurance)  # Per pay period
        self.other_deductions = float(other_deductions)  # Per pay period
        self.id = id(self)
    
    def calculate_gross_pay(self):
        """Calculate gross pay per pay period"""
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
        """Calculate annual gross income"""
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
        """Calculate detailed tax breakdown per pay period"""
        annual_gross = self.calculate_annual_gross()
        gross_per_period = self.calculate_gross_pay()
        
        # Calculate annual taxes
        federal_annual = TaxCalculator.calculate_federal_income_tax(
            annual_gross, self.filing_status, self.allowances)
        va_state_annual = TaxCalculator.calculate_virginia_state_tax(annual_gross)
        ss_annual, medicare_annual = TaxCalculator.calculate_fica_taxes(annual_gross)
        
        # Convert to per pay period
        periods_per_year = (
            260 if self.frequency == "daily" else
            52 if self.frequency == "weekly" else
            26 if self.frequency == "bi-weekly" else
            12
        )
        
        breakdown = {
            'gross_pay': gross_per_period,
            'federal_tax': federal_annual / periods_per_year,
            'state_tax': va_state_annual / periods_per_year,
            'social_security': ss_annual / periods_per_year,
            'medicare': medicare_annual / periods_per_year,
            'health_insurance': self.health_insurance,
            'other_deductions': self.other_deductions
        }
        
        # Calculate total deductions and net pay
        total_deductions = (breakdown['federal_tax'] + breakdown['state_tax'] + 
                          breakdown['social_security'] + breakdown['medicare'] + 
                          breakdown['health_insurance'] + breakdown['other_deductions'])
        
        breakdown['total_deductions'] = total_deductions
        breakdown['net_pay'] = gross_per_period - total_deductions
        
        return breakdown
    
    def calculate_pay_amount(self):
        """Calculate net pay (take-home) amount"""
        return self.calculate_tax_breakdown()['net_pay']
    
    def to_transaction(self):
        net_amount = self.calculate_pay_amount()
        name = f"{self.job_name} Paycheck (Net)"
        return Transaction(
            name=name,
            amount=net_amount,
            transaction_type="income",
            frequency=self.frequency,
            start_date=self.start_date,
            category="income",
            end_date=self.end_date
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
        self.savings_accounts = []
        self.crypto_portfolio = CryptoPortfolio()
    
    def add_transaction(self, transaction):
        self.transactions.append(transaction)
    
    def remove_transaction(self, transaction):
        if transaction in self.transactions:
            self.transactions.remove(transaction)
    
    def add_paycheck(self, paycheck):
        self.paychecks.append(paycheck)
    
    def remove_paycheck(self, paycheck):
        if paycheck in self.paychecks:
            self.paychecks.remove(paycheck)
    
    def add_savings_account(self, account):
        self.savings_accounts.append(account)
    
    def remove_savings_account(self, account):
        if account in self.savings_accounts:
            self.savings_accounts.remove(account)
    
    def update_crypto_prices(self):
        if not self.crypto_portfolio.holdings:
            return
        
        symbols = [holding.symbol for holding in self.crypto_portfolio.holdings]
        prices = CryptoPriceService.fetch_prices(symbols)
        
        for holding in self.crypto_portfolio.holdings:
            if holding.symbol in prices:
                holding.current_price = prices[holding.symbol]
        
        self.crypto_portfolio.last_updated = datetime.now()
    
    def get_all_transactions_for_date(self, target_date):
        all_transactions = []
        
        for trans in self.transactions:
            if self._transaction_occurs_on_date(trans, target_date):
                all_transactions.append(trans)
        
        for paycheck in self.paychecks:
            paycheck_trans = paycheck.to_transaction()
            if self._transaction_occurs_on_date(paycheck_trans, target_date):
                all_transactions.append(paycheck_trans)
        
        return all_transactions
    
    def get_transactions_for_date(self, target_date):
        return self.get_all_transactions_for_date(target_date)
    
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
            return (target_date.month == start_date.month and 
                   target_date.day == start_date.day)
        
        return False
    
    def calculate_daily_total(self, target_date):
        transactions = self.get_transactions_for_date(target_date)
        
        total_income = sum(t.amount for t in transactions if t.transaction_type == "income")
        total_expenses = sum(t.amount for t in transactions if t.transaction_type == "expense")
        
        return total_income - total_expenses
    
    def calculate_running_balance(self, start_balance, target_date):
        current_date = datetime.now().date()
        
        balance = start_balance
        
        calc_date = current_date
        while calc_date <= target_date:
            daily_total = self.calculate_daily_total(calc_date)
            balance += daily_total
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

class CalendarWidget:
    def __init__(self, parent, calculator, preferences, theme_manager, on_day_click=None, on_month_change=None):
        self.parent = parent
        self.calculator = calculator
        self.preferences = preferences
        self.theme_manager = theme_manager
        self.on_day_click = on_day_click
        self.on_month_change = on_month_change
        
        self.current_month = datetime.now().month
        self.current_year = datetime.now().year
        
        self.frame = ttk.Frame(parent)
        self.setup_calendar()
        self.update_calendar()
    
    def setup_calendar(self):
        # Month header with better styling
        header_frame = ttk.Frame(self.frame)
        header_frame.pack(fill=tk.X, pady=(0, 15))
        
        # Navigation buttons
        nav_frame = ttk.Frame(header_frame)
        nav_frame.pack(fill=tk.X)
        
        ttk.Button(nav_frame, text="◀ Prev", command=self.previous_month).pack(side=tk.LEFT)
        
        # Center frame for month display and today's date
        center_frame = ttk.Frame(nav_frame)
        center_frame.pack(side=tk.LEFT, expand=True, fill=tk.X)

        labels_frame = ttk.Frame(center_frame)
        labels_frame.pack(expand=True)

        self.month_label = ttk.Label(labels_frame, style='Header.TLabel')
        self.month_label.pack(side=tk.LEFT)

        # Small label showing today's date
        self.today_label = tk.Label(labels_frame)
        self.today_label.pack(side=tk.LEFT, padx=(10, 0))
        
        ttk.Button(nav_frame, text="Next ▶", command=self.next_month).pack(side=tk.RIGHT)
        ttk.Button(nav_frame, text="Today", command=self.goto_current_month).pack(side=tk.RIGHT, padx=(0, 10))
        
        # Calendar grid container with proper resizing
        cal_container = ttk.Frame(self.frame)
        cal_container.pack(fill=tk.BOTH, expand=True)
        
        # Configure container for proper resizing
        cal_container.grid_rowconfigure(0, weight=1)
        cal_container.grid_columnconfigure(0, weight=1)
        
        self.cal_frame = ttk.Frame(cal_container, style='TFrame')
        self.cal_frame.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)
        
        # Day headers with better styling
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for i, day in enumerate(days):
            label = ttk.Label(self.cal_frame, text=day, font=("Arial", 10, "bold"), 
                             style='TLabel', anchor='center')
            label.grid(row=0, column=i, padx=1, pady=2, sticky="ew")
        
        # Configure grid weights for proper resizing
        cell_size = 80
        for i in range(7):  # 7 columns (days of week)
            self.cal_frame.columnconfigure(i, weight=1, minsize=cell_size)
        # Preconfigure maximum possible rows (header + up to 6 weeks)
        for i in range(7):
            self.cal_frame.rowconfigure(i, weight=1, minsize=cell_size)
        
        self.day_buttons = {}
    
    def previous_month(self):
        if self.current_month == 1:
            self.current_month = 12
            self.current_year -= 1
        else:
            self.current_month -= 1
        self.update_calendar()
        if self.on_month_change:
            self.on_month_change(self.current_year, self.current_month)
    
    def next_month(self):
        if self.current_month == 12:
            self.current_month = 1
            self.current_year += 1
        else:
            self.current_month += 1
        self.update_calendar()
        if self.on_month_change:
            self.on_month_change(self.current_year, self.current_month)
    
    def goto_current_month(self):
        now = datetime.now()
        self.current_month = now.month
        self.current_year = now.year
        self.update_calendar()
        if self.on_month_change:
            self.on_month_change(self.current_year, self.current_month)
    
    def update_calendar(self):
        month_name = calendar.month_name[self.current_month]
        self.month_label.config(text=f"{month_name} {self.current_year}")

        # Update today's date label with themed outline
        theme = self.theme_manager.get_theme()
        today = datetime.now().date()
        date_format = self.preferences.get('date_format', '%Y-%m-%d')
        self.today_label.config(
            text=today.strftime(date_format),
            bg=theme['header_bg'],
            fg=theme['fg'],
            highlightbackground=theme['border_color'],
            highlightcolor=theme['border_color'],
            highlightthickness=1,
            font=("Arial", 10)
        )
        
        for button in self.day_buttons.values():
            button.destroy()
        self.day_buttons.clear()
        
        cal_data = self.calculator.get_calendar_data(self.current_year, self.current_month)
        colors = self.preferences.get('colors', {})
        is_dark_theme = self.preferences.get('theme', 'light') == 'dark'
        
        cal = calendar.monthcalendar(self.current_year, self.current_month)
        num_weeks = len(cal)

        # Adjust row configuration so there is no extra spacing when fewer than
        # 6 weeks are displayed
        cell_size = 80
        for i in range(1, 7):
            if i <= num_weeks:
                self.cal_frame.rowconfigure(i, weight=1, minsize=cell_size)
            else:
                self.cal_frame.rowconfigure(i, weight=0, minsize=0)
        
        today = datetime.now().date()
        is_current_month = (self.current_year == today.year and self.current_month == today.month)
        
        for week_num, week in enumerate(cal):
            for day_num, day in enumerate(week):
                if day == 0:
                    continue
                
                row = week_num + 1
                col = day_num
                
                daily_data = cal_data.get(day, {'total': 0, 'transactions': []})
                daily_total = daily_data['total']
                transactions = daily_data['transactions']
                
                is_today = is_current_month and day == today.day

                # Determine colors based on theme and transaction status
                if is_today:
                    # Today gets special highlighting
                    bg_color = '#FF8C00'  # Orange
                    text_color = '#FFFFFF'
                    border_color = '#FF6600'
                    border_width = 3
                else:
                    border_width = 1

                    if is_dark_theme:
                        # Dark theme colors
                        if daily_total > 0:
                            bg_color = '#2E5D2E'  # Dark green
                            text_color = '#90EE90'  # Light green text
                        elif daily_total < 0:
                            bg_color = '#5D2E2E'  # Dark red
                            text_color = '#FFB6C1'  # Light red text
                        else:
                            bg_color = theme['button_bg']
                            text_color = theme['fg']
                        border_color = theme['border_color']
                    else:
                        # Light theme colors
                        if daily_total > 0:
                            bg_color = colors.get('positive_day', '#E8F5E8')
                            text_color = '#2E7D32'  # Dark green text
                        elif daily_total < 0:
                            bg_color = colors.get('negative_day', '#FFE8E8')
                            text_color = '#C62828'  # Dark red text
                        else:
                            bg_color = colors.get('neutral_day', '#F5F5F5')
                            text_color = theme['fg']
                        border_color = theme['border_color']

                # Outline color based on theme and whether this is today
                outline_color = '#FFFFFF' if is_dark_theme else '#000000'
                if is_today:
                    outline_color = theme['accent']
                    outline_width = 2
                else:
                    outline_width = 1

                # Unified container for each day to keep sizes consistent
                container_size = 80
                container = tk.Frame(
                    self.cal_frame,
                    bg=bg_color if transactions else theme['frame_bg'],
                    bd=border_width if transactions else 1,
                    relief=tk.RAISED if transactions else tk.FLAT,
                    highlightbackground=outline_color,
                    highlightcolor=outline_color,
                    highlightthickness=outline_width,
                    width=container_size,
                    height=container_size,
                )
                container.grid(row=row, column=col, padx=1, pady=1, sticky="nsew")
                container.grid_propagate(False)

                if transactions:
                    button_text = f"{day}\n${daily_total:+,.0f}"
                    fg_color = text_color
                else:
                    button_text = str(day)
                    fg_color = theme['fg']

                label = tk.Label(
                    container,
                    text=button_text,
                    bg=bg_color if transactions else theme['frame_bg'],
                    fg=fg_color,
                    font=("Arial", 9, "bold underline"),
                    wraplength=container_size,
                    justify=tk.CENTER,
                    cursor="hand2" if transactions else "arrow",
                )
                label.pack(fill=tk.BOTH, expand=True)
                if transactions:
                    label.bind("<Button-1>", lambda e, d=day: self.day_clicked(d))

                    # Canvas showing color-coded transactions
                    bar_canvas = tk.Canvas(
                        container,
                        height=5,
                        bg=bg_color,
                        highlightthickness=0,
                    )
                    bar_canvas.pack(fill=tk.X)

                    bar_width = max(1, int(container_size / len(transactions)))
                    x = 0
                    for trans in transactions:
                        color = colors.get(trans.category, '#000000')
                        bar_canvas.create_rectangle(
                            x, 0, x + bar_width, 5,
                            fill=color,
                            outline="",
                        )
                        x += bar_width
                    bar_canvas.bind("<Button-1>", lambda e, d=day: self.day_clicked(d))

                self.day_buttons[day] = container
    
    def day_clicked(self, day):
        if self.on_day_click:
            selected_date = date(self.current_year, self.current_month, day)
            self.on_day_click(selected_date)
    
    def get_widget(self):
        return self.frame

class DayDetailDialog:
    def __init__(self, parent, selected_date, calculator, preferences, theme_manager):
        self.selected_date = selected_date
        self.calculator = calculator
        self.preferences = preferences
        self.theme_manager = theme_manager
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(f"Transactions for {selected_date.strftime('%B %d, %Y')}")
        self.dialog.geometry("600x500")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Apply theme to dialog
        theme = self.theme_manager.get_theme()
        self.dialog.configure(bg=theme['dialog_bg'])
        
        self.setup_dialog()
        
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")
    
    def setup_dialog(self):
        main_frame = ttk.Frame(self.dialog, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        date_label = ttk.Label(main_frame, text=f"Transactions for {self.selected_date.strftime('%A, %B %d, %Y')}", 
                              font=("Arial", 12, "bold"))
        date_label.pack(pady=(0, 10))
        
        daily_total = self.calculator.calculate_daily_total(self.selected_date)
        
        total_label = ttk.Label(main_frame, text=f"Daily Net Total: ${daily_total:+,.2f}",
                               font=("Arial", 11, "bold"))
        total_label.pack(pady=(0, 15))
        
        transactions_frame = ttk.LabelFrame(main_frame, text="Transactions", padding="10")
        transactions_frame.pack(fill=tk.BOTH, expand=True)
        
        columns = ("Name", "Type", "Amount", "Category", "Frequency")
        tree = ttk.Treeview(transactions_frame, columns=columns, show="headings", height=15)
        
        for col in columns:
            tree.heading(col, text=col)
            if col == "Name":
                tree.column(col, width=150)
            elif col == "Amount":
                tree.column(col, width=100)
            else:
                tree.column(col, width=80)
        
        scrollbar = ttk.Scrollbar(transactions_frame, orient=tk.VERTICAL, command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        
        tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        transactions_frame.columnconfigure(0, weight=1)
        transactions_frame.rowconfigure(0, weight=1)
        
        colors = self.preferences.get('colors', {})
        for category, color in colors.items():
            tree.tag_configure(f"cat_{category}", foreground=color)
        
        transactions = self.calculator.get_transactions_for_date(self.selected_date)
        
        if not transactions:
            no_trans_label = ttk.Label(transactions_frame, text="No transactions scheduled for this day")
            no_trans_label.grid(row=0, column=0, pady=20)
        else:
            for trans in transactions:
                type_display = "Income" if trans.transaction_type == "income" else "Expense"
                amount_display = f"${trans.amount:,.2f}"
                
                color_tag = f"cat_{trans.category}" if trans.transaction_type == "expense" else "cat_income"
                
                tree.insert("", "end", values=(
                    trans.name, type_display, amount_display, 
                    trans.category.title(), trans.frequency.title()
                ), tags=(color_tag,))
        
        ttk.Button(main_frame, text="Close", command=self.dialog.destroy).pack(pady=(10, 0))

class BudgieApp:
    def __init__(self, root):
        self.root = root
        self.preferences = UserPreferences()
        self.theme_manager = ThemeManager(self.preferences)
        
        self.root.title("Budgie - Financial Budget Manager")
        
        # Set minimum window size and default geometry
        self.root.minsize(1200, 800)
        geometry = self.preferences.get('window_geometry', '1200x800')
        self.root.geometry(geometry)
        
        # Bind window state change events for better resizing
        self.root.bind('<Configure>', self.on_window_configure)
        
        # Apply theme first
        self.theme_manager.apply_theme(self.root)
        
        self.calculator = BudgetCalculator()
        self.current_balance = 0.0
        
        data_dir = self.preferences.get('default_data_directory', os.getcwd())
        self.data_file = os.path.join(data_dir, "budgie_data.json")
        
        self.load_data()
        self.setup_menu()
        self.setup_main_interface()
        
        # Auto-refresh crypto prices on startup
        self.root.after(1000, self.auto_refresh_on_startup)  # Delay to ensure UI is ready
        
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
    
    def on_closing(self):
        self.preferences.set('window_geometry', self.root.geometry())
        self.maybe_auto_save()
        self.root.destroy()
    
    def on_window_configure(self, event):
        """Handle window resize events to maintain layout"""
        # Only process if the event is for the main window
        if event.widget == self.root:
            # Update calendar layout if it exists
            if hasattr(self, 'calendar_widget'):
                # Force calendar to recalculate its layout
                self.root.after_idle(self.calendar_widget.update_calendar)
    
    def auto_refresh_on_startup(self):
        """Auto-refresh crypto prices when app starts"""
        if self.calculator.crypto_portfolio.holdings:
            try:
                self.calculator.update_crypto_prices()
                self.update_crypto_display()
                print("Crypto prices refreshed on startup")
            except Exception as e:
                print(f"Failed to refresh crypto prices on startup: {e}")
    
    def refresh_all_data(self):
        """Refresh all data including crypto prices"""
        try:
            # Show loading message
            loading_dialog = tk.Toplevel(self.root)
            loading_dialog.title("Refreshing...")
            loading_dialog.geometry("250x100")
            loading_dialog.transient(self.root)
            loading_dialog.grab_set()
            
            # Apply theme to loading dialog
            theme = self.theme_manager.get_theme()
            loading_dialog.configure(bg=theme['bg'])
            
            frame = ttk.Frame(loading_dialog, padding="20")
            frame.pack(fill=tk.BOTH, expand=True)
            
            label = ttk.Label(frame, text="Refreshing all data...")
            label.pack(expand=True)
            
            progress = ttk.Progressbar(frame, mode='indeterminate')
            progress.pack(fill=tk.X, pady=(10, 0))
            progress.start()
            
            self.root.update()
            
            # Refresh crypto prices if we have holdings
            if self.calculator.crypto_portfolio.holdings:
                self.calculator.update_crypto_prices()
                self.update_crypto_display()
            
            # Refresh calendar and all displays
            self.refresh_calendar()
            
            loading_dialog.destroy()
            
            messagebox.showinfo("Success", "All data refreshed successfully!")
            
        except Exception as e:
            if 'loading_dialog' in locals():
                loading_dialog.destroy()
            messagebox.showerror("Error", f"Failed to refresh data: {str(e)}")
    
    def setup_menu(self):
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="New Budget", command=self.new_budget)
        file_menu.add_command(label="Open Budget", command=self.open_budget)
        file_menu.add_command(label="Save Budget", command=self.save_data)
        file_menu.add_command(label="Save As...", command=self.save_as)
        file_menu.add_separator()
        file_menu.add_command(label="Preferences", command=self.show_preferences)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.on_closing)
        
        paycheck_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Paychecks", menu=paycheck_menu)
        paycheck_menu.add_command(label="Add Paycheck", command=self.add_paycheck_dialog)
        paycheck_menu.add_command(label="Manage Paychecks", command=self.manage_paychecks)
        
        trans_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Transactions", menu=trans_menu)
        trans_menu.add_command(label="Add Transaction", command=self.add_transaction_dialog)
        trans_menu.add_command(label="Manage Transactions", command=self.manage_transactions)
        trans_menu.add_separator()
        trans_menu.add_command(label="Set Current Balance", command=self.set_balance_dialog)
        
        portfolio_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Portfolio", menu=portfolio_menu)
        portfolio_menu.add_command(label="View Portfolio", command=self.show_crypto_portfolio)
        portfolio_menu.add_command(label="Add Crypto Holding", command=self.add_crypto_dialog)
        portfolio_menu.add_command(label="Refresh Prices", command=self.refresh_crypto_prices)
        
        savings_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Savings", menu=savings_menu)
        savings_menu.add_command(label="Manage Savings Accounts", command=self.manage_savings)
        
        tools_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Tools", menu=tools_menu)
        tools_menu.add_command(label="Monthly Analyzer", command=self.show_monthly_analyzer)
        tools_menu.add_command(label="Future Balance Projection", command=self.show_future_projection)
        tools_menu.add_command(label="Export Report", command=self.export_report)
    
    def setup_main_interface(self):
        # Create main container frame
        main_container = ttk.Frame(self.root)
        main_container.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Configure main container grid
        main_container.grid_columnconfigure(1, weight=1)  # Right side expands
        main_container.grid_rowconfigure(0, weight=1)     # Full height
        
        # Left panel with fixed width (no resizing)
        # Reduced width so the calendar area has more room
        left_frame = ttk.Frame(main_container, width=220)
        left_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 5))
        left_frame.grid_propagate(False)  # Maintain fixed width
        
        # Right panel (calendar area) - expands with window
        right_frame = ttk.Frame(main_container)
        right_frame.grid(row=0, column=1, sticky="nsew")
        
        self.setup_stats_panel(left_frame)
        
        self.calendar_widget = CalendarWidget(
            right_frame, 
            self.calculator, 
            self.preferences,
            self.theme_manager,
            self.on_day_click,
            self.on_month_change
        )
        self.calendar_widget.get_widget().pack(fill=tk.BOTH, expand=True)
    
    def setup_stats_panel(self, parent):
        """Create the left side stats/actions panel"""
        panel = ttk.Frame(parent)
        panel.pack(fill=tk.BOTH, expand=True)

        theme = self.theme_manager.get_theme()
        panel.configure(style='TFrame')

        # Create a scrollable area so large stats sections don't get cut off
        canvas = tk.Canvas(panel, borderwidth=0, highlightthickness=0,
                           background=theme['frame_bg'])
        scrollbar = ttk.Scrollbar(panel, orient="vertical", command=canvas.yview)
        scroll_frame = ttk.Frame(canvas)

        scroll_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        canvas.create_window((0, 0), window=scroll_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        scrollable_frame = scroll_frame
        
        # Current balance section
        balance_frame = ttk.LabelFrame(scrollable_frame, text="Account Status", padding="10")
        balance_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(balance_frame, text="Current Balance:", font=("Arial", 10, "bold")).pack(anchor=tk.W)
        self.balance_label = ttk.Label(balance_frame, text=f"${self.current_balance:,.2f}", font=("Arial", 12))
        self.balance_label.pack(anchor=tk.W, padx=(10, 0))
        
        # Crypto portfolio section
        ttk.Label(balance_frame, text="Crypto Portfolio:", font=("Arial", 10, "bold")).pack(anchor=tk.W, pady=(10, 0))
        self.crypto_balance_label = ttk.Label(balance_frame, text="$0.00", font=("Arial", 12))
        self.crypto_balance_label.pack(anchor=tk.W, padx=(10, 0))

        columns = ("Symbol", "Amount", "Value")
        self.portfolio_tree = ttk.Treeview(balance_frame, columns=columns, show="headings", height=5)
        for col in columns:
            self.portfolio_tree.heading(col, text=col)
            self.portfolio_tree.column(col, width=80)
        self.portfolio_tree.pack(fill=tk.X, padx=(10, 0), pady=(5, 0))
        
        # Total net worth
        ttk.Label(balance_frame, text="Total Net Worth:", font=("Arial", 10, "bold")).pack(anchor=tk.W, pady=(10, 0))
        self.net_worth_label = ttk.Label(balance_frame, text="$0.00", font=("Arial", 12, "bold"))
        self.net_worth_label.pack(anchor=tk.W, padx=(10, 0))
        
        ttk.Button(balance_frame, text="Set Balance", command=self.set_balance_dialog).pack(fill=tk.X, pady=(10, 5))
        ttk.Button(balance_frame, text="Refresh All Data", command=self.refresh_all_data).pack(fill=tk.X, pady=(0, 5))
        
        # Update crypto display
        self.update_crypto_display()
        
        # Paycheck actions
        paycheck_frame = ttk.LabelFrame(scrollable_frame, text="Paychecks", padding="10")
        paycheck_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Button(paycheck_frame, text="Add Paycheck", command=self.add_paycheck_dialog).pack(fill=tk.X, pady=2)
        ttk.Button(paycheck_frame, text="Manage Paychecks", command=self.manage_paychecks).pack(fill=tk.X, pady=2)
        
        # Quick actions
        actions_frame = ttk.LabelFrame(scrollable_frame, text="Quick Actions", padding="10")
        actions_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Button(actions_frame, text="Add Transaction", command=self.add_transaction_dialog).pack(fill=tk.X, pady=2)
        ttk.Button(actions_frame, text="Manage Transactions", command=self.manage_transactions).pack(fill=tk.X, pady=2)
        ttk.Button(actions_frame, text="View Portfolio", command=self.show_crypto_portfolio).pack(fill=tk.X, pady=2)
        ttk.Button(actions_frame, text="Monthly Analyzer", command=self.show_monthly_analyzer).pack(fill=tk.X, pady=2)
        
        # Monthly summary
        self.summary_frame = ttk.LabelFrame(scrollable_frame, text="Monthly Summary", padding="10")
        self.summary_frame.pack(fill=tk.X, padx=5, pady=5)
        
        self.update_monthly_summary(datetime.now().year, datetime.now().month)
    
    def update_monthly_summary(self, year, month):
        """Update monthly summary for specified year/month"""
        # Clear existing widgets
        for widget in self.summary_frame.winfo_children():
            widget.destroy()
        
        # Add title
        month_name = calendar.month_name[month]
        ttk.Label(self.summary_frame, text=f"{month_name} {year} Summary", 
                 font=("Arial", 10, "bold")).grid(row=0, column=0, columnspan=2, pady=(0, 10))
        
        income, expenses = self.calculate_monthly_summary(year, month)
        
        ttk.Label(self.summary_frame, text="Income:", font=("Arial", 9, "bold")).grid(row=1, column=0, sticky=tk.W)
        self.monthly_income_label = ttk.Label(self.summary_frame, text=f"${income:,.2f}", foreground="green")
        self.monthly_income_label.grid(row=1, column=1, sticky=tk.W, padx=(10, 0))
        
        ttk.Label(self.summary_frame, text="Expenses:", font=("Arial", 9, "bold")).grid(row=2, column=0, sticky=tk.W)
        self.monthly_expenses_label = ttk.Label(self.summary_frame, text=f"${expenses:,.2f}", foreground="red")
        self.monthly_expenses_label.grid(row=2, column=1, sticky=tk.W, padx=(10, 0))
        
        net = income - expenses
        ttk.Label(self.summary_frame, text="Net:", font=("Arial", 9, "bold")).grid(row=3, column=0, sticky=tk.W)
        net_color = "green" if net >= 0 else "red"
        self.monthly_net_label = ttk.Label(self.summary_frame, text=f"${net:+,.2f}", foreground=net_color)
        self.monthly_net_label.grid(row=3, column=1, sticky=tk.W, padx=(10, 0))
    
    def update_crypto_display(self):
        """Update the crypto portfolio display on main screen"""
        portfolio_value = self.calculator.crypto_portfolio.get_total_value()
        self.crypto_balance_label.config(text=f"${portfolio_value:,.2f}")
        
        # Update net worth
        total_net_worth = self.current_balance + portfolio_value
        self.net_worth_label.config(text=f"${total_net_worth:,.2f}")
        
        # Color code based on portfolio performance
        if portfolio_value > 0:
            profit_loss = self.calculator.crypto_portfolio.get_total_profit_loss()
            if profit_loss > 0:
                self.crypto_balance_label.config(foreground="green")
            elif profit_loss < 0:
                self.crypto_balance_label.config(foreground="red")
            else:
                theme = self.theme_manager.get_theme()
                self.crypto_balance_label.config(foreground=theme['fg'])
        else:
            theme = self.theme_manager.get_theme()
            self.crypto_balance_label.config(foreground=theme['fg'])

        if hasattr(self, 'portfolio_tree'):
            for item in self.portfolio_tree.get_children():
                self.portfolio_tree.delete(item)
            for holding in self.calculator.crypto_portfolio.holdings:
                self.portfolio_tree.insert(
                    "",
                    "end",
                    values=(
                        holding.symbol,
                        f"{holding.amount:.8f}",
                        f"${holding.get_current_value():,.2f}"
                    ),
                )
    
    def calculate_monthly_summary(self, year, month):
        first_day = date(year, month, 1)
        last_day = date(year, month, calendar.monthrange(year, month)[1])
        
        total_income = 0
        total_expenses = 0
        
        current_date = first_day
        while current_date <= last_day:
            transactions = self.calculator.get_transactions_for_date(current_date)
            for trans in transactions:
                if trans.transaction_type == "income":
                    total_income += trans.amount
                else:
                    total_expenses += trans.amount
            current_date += timedelta(days=1)
        
        return total_income, total_expenses
    
    def on_day_click(self, selected_date):
        DayDetailDialog(self.root, selected_date, self.calculator, self.preferences, self.theme_manager)
    
    def on_month_change(self, year, month):
        """Called when calendar month changes"""
        self.update_monthly_summary(year, month)
    
    def refresh_calendar(self):
        """Refresh the calendar display and update all UI elements"""
        self.calendar_widget.update_calendar()
        
        # Update monthly summary for current displayed month
        self.update_monthly_summary(self.calendar_widget.current_year, self.calendar_widget.current_month)
        
        # Update crypto display
        self.update_crypto_display()
    
    def refresh_crypto_prices(self):
        """Refresh cryptocurrency prices"""
        if not self.calculator.crypto_portfolio.holdings:
            messagebox.showinfo("No Holdings", "Add some crypto holdings first!")
            return
        
        try:
            loading_dialog = tk.Toplevel(self.root)
            loading_dialog.title("Loading...")
            loading_dialog.geometry("200x100")
            loading_dialog.transient(self.root)
            loading_dialog.grab_set()
            
            # Apply theme to loading dialog
            theme = self.theme_manager.get_theme()
            loading_dialog.configure(bg=theme['bg'])
            
            label = ttk.Label(loading_dialog, text="Fetching prices...")
            label.pack(expand=True)
            
            self.root.update()
            
            self.calculator.update_crypto_prices()
            
            loading_dialog.destroy()
            
            # Update crypto display on main screen
            self.update_crypto_display()
            
            messagebox.showinfo("Success", "Crypto prices updated successfully!")
            
        except Exception as e:
            if 'loading_dialog' in locals():
                loading_dialog.destroy()
            messagebox.showerror("Error", f"Failed to update prices: {str(e)}")
    
    def add_crypto_dialog(self):
        dialog = CryptoDialog(self.root, "Add Crypto Holding", self.preferences, self.theme_manager)
        if dialog.result:
            holding = CryptoHolding(
                dialog.result['symbol'],
                dialog.result['name'],
                dialog.result['amount'],
                dialog.result['purchase_price'],
                dialog.result['purchase_date']
            )
            self.calculator.crypto_portfolio.add_holding(holding)
            self.update_crypto_display()  # Update main screen
            self.maybe_auto_save()
    
    def show_crypto_portfolio(self):
        CryptoPortfolioWindow(self.root, self.calculator, self.preferences, self.theme_manager, self.update_crypto_display, self.save_data)
    
    def add_paycheck_dialog(self):
        dialog = PaycheckDialog(self.root, "Add Paycheck", self.preferences, self.theme_manager)
        if dialog.result:
            paycheck = Paycheck(
                dialog.result['job_name'],
                dialog.result['hourly_rate'],
                dialog.result['hours_per_week'],
                dialog.result['frequency'],
                dialog.result['start_date'],
                dialog.result.get('end_date'),
                dialog.result.get('filing_status', 'single'),
                dialog.result.get('allowances', 1),
                dialog.result.get('health_insurance', 0.0),
                dialog.result.get('other_deductions', 0.0)
            )
            self.calculator.add_paycheck(paycheck)
            self.refresh_calendar()
            self.maybe_auto_save()
    
    def manage_paychecks(self, year=None, month=None):
        if not self.calculator.paychecks:
            messagebox.showinfo("No Paychecks", "No paychecks to manage.")
            return

        if year is None or month is None:
            if hasattr(self, 'calendar_widget'):
                year = self.calendar_widget.current_year
                month = self.calendar_widget.current_month
            else:
                today = datetime.now()
                year, month = today.year, today.month

        self.dialog = tk.Toplevel(self.root)
        self.dialog.title("Manage Paychecks")
        self.dialog.geometry("1400x600")
        self.dialog.minsize(1200, 500)  # Set minimum size
        self.dialog.transient(self.root)
        self.dialog.grab_set()
        
        # Apply theme
        theme = self.theme_manager.get_theme()
        self.dialog.configure(bg=theme['dialog_bg'])
        
        frame = ttk.Frame(self.dialog, padding="10")
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="Paycheck Management", font=("Arial", 12, "bold")).pack(pady=(0, 10))

        month_name = calendar.month_name[month]
        ttk.Label(frame, text=f"Showing {month_name} {year}").pack(pady=(0, 10))
        
        # Create notebook for tabs
        notebook = ttk.Notebook(frame)
        notebook.pack(fill=tk.BOTH, expand=True)
        
        # Main paycheck list tab
        list_frame = ttk.Frame(notebook, padding="10")
        notebook.add(list_frame, text="Paycheck List")
        
        columns = (
            "Job Name",
            "Hourly Rate",
            "Hours/Week",
            "Frequency",
            "Gross Pay",
            "Health Ins.",
            "Other Ded.",
            "Net Pay",
            "Start Date",
            "End Date",
        )
        tree = ttk.Treeview(list_frame, columns=columns, show="headings")
        
        for col in columns:
            tree.heading(col, text=col)
            if col == "Job Name":
                tree.column(col, width=120)
            elif col in ["Gross Pay", "Net Pay", "Health Ins.", "Other Ded."]:
                tree.column(col, width=90)
            else:
                tree.column(col, width=80)
        
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        
        tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Add right-click context menu for paychecks
        tree.bind("<Button-3>", self.show_paycheck_context_menu)
        tree.bind("<Double-1>", lambda event: self.edit_paycheck_from_tree(tree))
        
        month_start = date(year, month, 1)
        month_end = date(year, month, calendar.monthrange(year, month)[1])

        for paycheck in self.calculator.paychecks:
            if paycheck.start_date > month_end:
                continue
            if paycheck.end_date and paycheck.end_date < month_start:
                continue

            gross_amount = paycheck.calculate_gross_pay()
            net_amount = paycheck.calculate_pay_amount()
            health_ins = getattr(paycheck, 'health_insurance', 0.0)
            other_ded = getattr(paycheck, 'other_deductions', 0.0)
            end_date_str = paycheck.end_date.strftime("%Y-%m-%d") if paycheck.end_date else "None"
            tree.insert(
                "",
                "end",
                values=(
                    paycheck.job_name,
                    f"${paycheck.hourly_rate:.2f}",
                    f"{paycheck.hours_per_week:.1f}",
                    paycheck.frequency.title(),
                    f"${gross_amount:.2f}",
                    f"${health_ins:.2f}",
                    f"${other_ded:.2f}",
                    f"${net_amount:.2f}",
                    paycheck.start_date.strftime("%Y-%m-%d"),
                    end_date_str,
                ),
            )
        
        # Tax breakdown tab
        breakdown_frame = ttk.Frame(notebook, padding="10")
        notebook.add(breakdown_frame, text="Tax Breakdown")
        
        # Create breakdown display
        self.setup_tax_breakdown_tab(breakdown_frame, tree)
        
        def on_tree_select(event):
            self.update_tax_breakdown(tree, breakdown_frame)
        
        tree.bind("<<TreeviewSelect>>", on_tree_select)
        
        def edit_selected():
            selection = tree.selection()
            if selection:
                idx = tree.index(selection[0])
                paycheck = self.calculator.paychecks[idx]
                edit_dialog = EditPaycheckDialog(self.dialog, paycheck, self.preferences, self.theme_manager)
                if edit_dialog.result:
                    # Update paycheck with new values
                    paycheck.job_name = edit_dialog.result['job_name']
                    paycheck.hourly_rate = edit_dialog.result['hourly_rate']
                    paycheck.hours_per_week = edit_dialog.result['hours_per_week']
                    paycheck.frequency = edit_dialog.result['frequency']
                    paycheck.start_date = edit_dialog.result['start_date']
                    paycheck.end_date = edit_dialog.result['end_date']
                    paycheck.filing_status = edit_dialog.result.get('filing_status', 'single')
                    paycheck.allowances = edit_dialog.result.get('allowances', 1)
                    paycheck.health_insurance = edit_dialog.result.get('health_insurance', 0.0)
                    paycheck.other_deductions = edit_dialog.result.get('other_deductions', 0.0)
                    # Refresh display
                    self.dialog.destroy()
                    self.manage_paychecks()
                    self.refresh_calendar()
                    self.maybe_auto_save()
            else:
                messagebox.showwarning("No Selection", "Please select a paycheck to edit.")
        
        def delete_selected():
            selection = tree.selection()
            if selection:
                idx = tree.index(selection[0])
                paycheck = self.calculator.paychecks[idx]
                if messagebox.askyesno("Confirm Delete", f"Delete paycheck for '{paycheck.job_name}'?"):
                    self.calculator.remove_paycheck(paycheck)
                    tree.delete(selection[0])
                    self.refresh_calendar()
                    self.maybe_auto_save()
            else:
                messagebox.showwarning("No Selection", "Please select a paycheck to delete.")
        
        button_frame = ttk.Frame(frame)
        button_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(button_frame, text="Edit Selected", command=edit_selected).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(button_frame, text="Delete Selected", command=delete_selected).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(button_frame, text="Add New Paycheck", command=lambda: [self.dialog.destroy(), self.add_paycheck_dialog()]).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(button_frame, text="Close", command=self.dialog.destroy).pack(side=tk.LEFT)
    
    def setup_tax_breakdown_tab(self, parent, tree):
        """Setup the tax breakdown display"""
        ttk.Label(parent, text="Select a paycheck from the list to view tax breakdown", 
                 font=("Arial", 12)).pack(pady=20)
        
        self.breakdown_frame = ttk.LabelFrame(parent, text="Tax Breakdown", padding="10")
        self.breakdown_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Create labels for breakdown display
        self.breakdown_labels = {}
        
    def update_tax_breakdown(self, tree, parent):
        """Update tax breakdown display when paycheck is selected"""
        selection = tree.selection()
        if not selection:
            return
        
        idx = tree.index(selection[0])
        paycheck = self.calculator.paychecks[idx]
        breakdown = paycheck.calculate_tax_breakdown()
        
        # Clear existing labels
        for widget in self.breakdown_frame.winfo_children():
            widget.destroy()
        
        # Display breakdown
        row = 0
        ttk.Label(self.breakdown_frame, text=f"Paycheck Breakdown for {paycheck.job_name}", 
                 font=("Arial", 14, "bold")).grid(row=row, column=0, columnspan=2, pady=(0, 15))
        row += 1
        
        ttk.Label(self.breakdown_frame, text="Gross Pay:", font=("Arial", 11, "bold")).grid(row=row, column=0, sticky=tk.W)
        ttk.Label(self.breakdown_frame, text=f"${breakdown['gross_pay']:.2f}", 
                 font=("Arial", 11)).grid(row=row, column=1, sticky=tk.W, padx=(20, 0))
        row += 1
        
        ttk.Label(self.breakdown_frame, text="Deductions:", font=("Arial", 11, "bold")).grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(10, 5))
        row += 1
        
        deductions = [
            ("Federal Income Tax", breakdown['federal_tax']),
            ("Virginia State Tax", breakdown['state_tax']),
            ("Social Security", breakdown['social_security']),
            ("Medicare", breakdown['medicare']),
            ("Health Insurance", breakdown['health_insurance']),
            ("Other Deductions", breakdown['other_deductions'])
        ]
        
        for label, amount in deductions:
            ttk.Label(self.breakdown_frame, text=f"  {label}:").grid(row=row, column=0, sticky=tk.W, padx=(20, 0))
            ttk.Label(self.breakdown_frame, text=f"${amount:.2f}", foreground="red").grid(row=row, column=1, sticky=tk.W, padx=(20, 0))
            row += 1
        
        ttk.Label(self.breakdown_frame, text="Total Deductions:", font=("Arial", 11, "bold")).grid(row=row, column=0, sticky=tk.W, pady=(10, 0))
        ttk.Label(self.breakdown_frame, text=f"${breakdown['total_deductions']:.2f}", 
                 font=("Arial", 11, "bold"), foreground="red").grid(row=row, column=1, sticky=tk.W, padx=(20, 0), pady=(10, 0))
        row += 1
        
        ttk.Label(self.breakdown_frame, text="Net Pay (Take-Home):", font=("Arial", 12, "bold")).grid(row=row, column=0, sticky=tk.W, pady=(10, 0))
        ttk.Label(self.breakdown_frame, text=f"${breakdown['net_pay']:.2f}", 
                 font=("Arial", 12, "bold"), foreground="green").grid(row=row, column=1, sticky=tk.W, padx=(20, 0), pady=(10, 0))
        row += 1
        
        # Annual projections
        annual_gross = paycheck.calculate_annual_gross()
        annual_net = breakdown['net_pay'] * (52 if paycheck.frequency == "weekly" else 26 if paycheck.frequency == "bi-weekly" else 12)
        
        ttk.Label(self.breakdown_frame, text="Annual Projections:", font=("Arial", 11, "bold")).grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(20, 5))
        row += 1
        
        ttk.Label(self.breakdown_frame, text="  Annual Gross:").grid(row=row, column=0, sticky=tk.W, padx=(20, 0))
        ttk.Label(self.breakdown_frame, text=f"${annual_gross:,.2f}").grid(row=row, column=1, sticky=tk.W, padx=(20, 0))
        row += 1
        
        ttk.Label(self.breakdown_frame, text="  Annual Net:").grid(row=row, column=0, sticky=tk.W, padx=(20, 0))
        ttk.Label(self.breakdown_frame, text=f"${annual_net:,.2f}", foreground="green").grid(row=row, column=1, sticky=tk.W, padx=(20, 0))
    
    def show_paycheck_context_menu(self, event):
        """Show right-click context menu for paychecks"""
        # Get the tree widget from the event
        tree = event.widget
        selection = tree.selection()
        if not selection:
            return
        
        menu = tk.Menu(tree, tearoff=0)
        
        # Apply theme to context menu
        theme = self.theme_manager.get_theme()
        menu.configure(bg=theme['menu_bg'], fg=theme['menu_fg'])
        
        menu.add_command(label="Edit Paycheck", command=lambda: self.edit_paycheck_from_tree(tree))
        menu.add_command(label="Delete Paycheck", command=lambda: self.delete_paycheck_from_tree(tree))
        menu.tk_popup(event.x_root, event.y_root)
    
    def edit_paycheck_from_tree(self, tree):
        """Edit selected paycheck from tree view"""
        selection = tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a paycheck to edit.")
            return
        
        idx = tree.index(selection[0])
        paycheck = self.calculator.paychecks[idx]
        edit_dialog = EditPaycheckDialog(tree.winfo_toplevel(), paycheck, self.preferences, self.theme_manager)
        if edit_dialog.result:
            # Update paycheck with new values
            paycheck.job_name = edit_dialog.result['job_name']
            paycheck.hourly_rate = edit_dialog.result['hourly_rate']
            paycheck.hours_per_week = edit_dialog.result['hours_per_week']
            paycheck.frequency = edit_dialog.result['frequency']
            paycheck.start_date = edit_dialog.result['start_date']
            paycheck.end_date = edit_dialog.result['end_date']
            paycheck.filing_status = edit_dialog.result.get('filing_status', 'single')
            paycheck.allowances = edit_dialog.result.get('allowances', 1)
            paycheck.health_insurance = edit_dialog.result.get('health_insurance', 0.0)
            paycheck.other_deductions = edit_dialog.result.get('other_deductions', 0.0)
            # Refresh display
            tree.winfo_toplevel().destroy()
            self.manage_paychecks()
            self.refresh_calendar()
            self.maybe_auto_save()
    
    def delete_paycheck_from_tree(self, tree):
        """Delete selected paycheck from tree view"""
        selection = tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a paycheck to delete.")
            return
        
        idx = tree.index(selection[0])
        paycheck = self.calculator.paychecks[idx]
        if messagebox.askyesno("Confirm Delete", f"Delete paycheck for '{paycheck.job_name}'?"):
            self.calculator.remove_paycheck(paycheck)
            tree.delete(selection[0])
            self.refresh_calendar()
            self.maybe_auto_save()
    
    def add_transaction_dialog(self):
        dialog = TransactionDialog(self.root, "Add Transaction", self.preferences, self.theme_manager)
        if dialog.result:
            trans = Transaction(
                dialog.result['name'],
                dialog.result['amount'],
                dialog.result['type'],
                dialog.result['frequency'],
                dialog.result['start_date'],
                dialog.result['category'],
                dialog.result.get('end_date')
            )
            self.calculator.add_transaction(trans)
            self.refresh_calendar()
            self.maybe_auto_save()
    
    def manage_transactions(self, year=None, month=None):
        if not self.calculator.transactions:
            messagebox.showinfo("No Transactions", "No transactions to manage.")
            return
        
        if year is None or month is None:
            if hasattr(self, 'calendar_widget'):
                year = self.calendar_widget.current_year
                month = self.calendar_widget.current_month
            else:
                today = datetime.now()
                year, month = today.year, today.month

        dialog = tk.Toplevel(self.root)
        dialog.title("Manage Transactions")
        dialog.geometry("1000x600")
        dialog.minsize(900, 500)  # Set minimum size
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Apply theme
        theme = self.theme_manager.get_theme()
        dialog.configure(bg=theme['dialog_bg'])
        
        frame = ttk.Frame(dialog, padding="10")
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="Transaction Management", font=("Arial", 12, "bold")).pack(pady=(0, 10))

        month_name = calendar.month_name[month]
        ttk.Label(frame, text=f"Showing {month_name} {year}").pack(pady=(0, 10))
        
        # Create treeview frame
        tree_frame = ttk.Frame(frame)
        tree_frame.pack(fill=tk.BOTH, expand=True)
        
        columns = ("Name", "Type", "Amount", "Frequency", "Start Date", "End Date", "Category")
        tree = ttk.Treeview(tree_frame, columns=columns, show="headings")
        
        for col in columns:
            tree.heading(col, text=col)
            if col == "Name":
                tree.column(col, width=150)
            elif col == "Amount":
                tree.column(col, width=100)
            else:
                tree.column(col, width=100)
        
        scrollbar = ttk.Scrollbar(tree_frame, orient=tk.VERTICAL, command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        
        tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Add right-click context menu for transactions
        tree.bind("<Button-3>", self.show_transaction_context_menu)
        tree.bind("<Double-1>", lambda event: self.edit_transaction_from_tree(tree))
        
        month_start = date(year, month, 1)
        month_end = date(year, month, calendar.monthrange(year, month)[1])

        for trans in self.calculator.transactions:
            if trans.start_date > month_end:
                continue
            if trans.end_date and trans.end_date < month_start:
                continue

            type_str = "Income" if trans.transaction_type == "income" else "Expense"
            end_date_str = trans.end_date.strftime("%Y-%m-%d") if trans.end_date else "None"
            tree.insert(
                "",
                "end",
                values=(
                    trans.name,
                    type_str,
                    f"${trans.amount:.2f}",
                    trans.frequency.title(),
                    trans.start_date.strftime("%Y-%m-%d"),
                    end_date_str,
                    trans.category.title(),
                ),
            )
        
        def edit_selected():
            selection = tree.selection()
            if selection:
                idx = tree.index(selection[0])
                transaction = self.calculator.transactions[idx]
                edit_dialog = EditTransactionDialog(dialog, transaction, self.preferences, self.theme_manager)
                if edit_dialog.result:
                    # Update transaction with new values
                    transaction.name = edit_dialog.result['name']
                    transaction.amount = edit_dialog.result['amount']
                    transaction.transaction_type = edit_dialog.result['type']
                    transaction.frequency = edit_dialog.result['frequency']
                    transaction.start_date = edit_dialog.result['start_date']
                    transaction.end_date = edit_dialog.result['end_date']
                    transaction.category = edit_dialog.result['category']
                    # Refresh display
                    dialog.destroy()
                    self.manage_transactions()
                    self.refresh_calendar()
                    self.maybe_auto_save()
            else:
                messagebox.showwarning("No Selection", "Please select a transaction to edit.")
        
        def delete_selected():
            selection = tree.selection()
            if selection:
                idx = tree.index(selection[0])
                trans = self.calculator.transactions[idx]
                if messagebox.askyesno("Confirm Delete", f"Delete transaction '{trans.name}'?"):
                    self.calculator.remove_transaction(trans)
                    tree.delete(selection[0])
                    self.refresh_calendar()
                    self.maybe_auto_save()
            else:
                messagebox.showwarning("No Selection", "Please select a transaction to delete.")
        
        button_frame = ttk.Frame(frame)
        button_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(button_frame, text="Edit Selected", command=edit_selected).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(button_frame, text="Delete Selected", command=delete_selected).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(button_frame, text="Add New Transaction", command=lambda: [dialog.destroy(), self.add_transaction_dialog()]).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(button_frame, text="Close", command=dialog.destroy).pack(side=tk.LEFT)
    
    def show_transaction_context_menu(self, event):
        """Show right-click context menu for transactions"""
        # Get the tree widget from the event
        tree = event.widget
        selection = tree.selection()
        if not selection:
            return
        
        menu = tk.Menu(tree, tearoff=0)
        
        # Apply theme to context menu
        theme = self.theme_manager.get_theme()
        menu.configure(bg=theme['menu_bg'], fg=theme['menu_fg'])
        
        menu.add_command(label="Edit Transaction", command=lambda: self.edit_transaction_from_tree(tree))
        menu.add_command(label="Delete Transaction", command=lambda: self.delete_transaction_from_tree(tree))
        menu.tk_popup(event.x_root, event.y_root)
    
    def edit_transaction_from_tree(self, tree):
        """Edit selected transaction from tree view"""
        selection = tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a transaction to edit.")
            return
        
        idx = tree.index(selection[0])
        transaction = self.calculator.transactions[idx]
        edit_dialog = EditTransactionDialog(tree.winfo_toplevel(), transaction, self.preferences, self.theme_manager)
        if edit_dialog.result:
            # Update transaction with new values
            transaction.name = edit_dialog.result['name']
            transaction.amount = edit_dialog.result['amount']
            transaction.transaction_type = edit_dialog.result['type']
            transaction.frequency = edit_dialog.result['frequency']
            transaction.start_date = edit_dialog.result['start_date']
            transaction.end_date = edit_dialog.result['end_date']
            transaction.category = edit_dialog.result['category']
            # Refresh display
            tree.winfo_toplevel().destroy()
            self.manage_transactions()
            self.refresh_calendar()
            self.maybe_auto_save()
    
    def delete_transaction_from_tree(self, tree):
        """Delete selected transaction from tree view"""
        selection = tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a transaction to delete.")
            return
        
        idx = tree.index(selection[0])
        trans = self.calculator.transactions[idx]
        if messagebox.askyesno("Confirm Delete", f"Delete transaction '{trans.name}'?"):
            self.calculator.remove_transaction(trans)
            tree.delete(selection[0])
            self.refresh_calendar()
            self.maybe_auto_save()
    
    def show_preferences(self):
        PreferencesDialog(self.root, self.preferences, self.theme_manager)
    
    def manage_savings(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("Manage Savings Accounts")
        dialog.geometry("600x400")
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Apply theme
        theme = self.theme_manager.get_theme()
        dialog.configure(bg=theme['dialog_bg'])
        
        frame = ttk.Frame(dialog, padding="10")
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="Savings Accounts", font=("Arial", 12, "bold")).pack(pady=(0, 10))
        
        ttk.Label(frame, text="Savings accounts feature coming soon!").pack()
        ttk.Button(frame, text="Close", command=dialog.destroy).pack(pady=10)
    
    def show_future_projection(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("Future Balance Projection")
        dialog.geometry("400x300")
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Apply theme
        theme = self.theme_manager.get_theme()
        dialog.configure(bg=theme['dialog_bg'])
        
        frame = ttk.Frame(dialog, padding="20")
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="Future Balance Projection", font=("Arial", 12, "bold")).pack(pady=(0, 20))
        
        projections = []
        current_date = datetime.now().date()
        
        for i in range(12):
            future_date = current_date + relativedelta(months=i)
            future_balance = self.calculator.calculate_running_balance(self.current_balance, future_date)
            projections.append((future_date.strftime("%B %Y"), future_balance))
        
        list_frame = ttk.Frame(frame)
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        listbox = tk.Listbox(list_frame)
        list_scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=listbox.yview)
        listbox.configure(yscrollcommand=list_scrollbar.set)
        
        for month, balance in projections:
            listbox.insert(tk.END, f"{month}: ${balance:,.2f}")
        
        listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        list_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        ttk.Button(frame, text="Close", command=dialog.destroy).pack(pady=(10, 0))
    
    def show_monthly_analyzer(self):
        """Show monthly transaction analyzer with bar charts"""
        analyzer_dialog = MonthlyAnalyzerWindow(self.root, self.calculator, self.preferences, self.theme_manager, self)
    
    def export_report(self):
        """Export comprehensive financial report"""
        try:
            filename = filedialog.asksaveasfilename(
                title="Export Financial Report",
                defaultextension=".txt",
                filetypes=[("Text files", "*.txt"), ("CSV files", "*.csv"), ("All files", "*.*")]
            )
            if not filename:
                return
            
            current_date = datetime.now()
            
            with open(filename, 'w') as f:
                f.write("BUDGIE FINANCIAL REPORT\n")
                f.write("=" * 50 + "\n")
                f.write(f"Generated: {current_date.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                
                # Account Status
                f.write("ACCOUNT STATUS\n")
                f.write("-" * 20 + "\n")
                f.write(f"Current Balance: ${self.current_balance:,.2f}\n")
                crypto_value = self.calculator.crypto_portfolio.get_total_value()
                f.write(f"Crypto Portfolio Value: ${crypto_value:,.2f}\n")
                f.write(f"Total Net Worth: ${(self.current_balance + crypto_value):,.2f}\n\n")
                
                # Paychecks
                f.write("PAYCHECKS\n")
                f.write("-" * 20 + "\n")
                if self.calculator.paychecks:
                    for paycheck in self.calculator.paychecks:
                        breakdown = paycheck.calculate_tax_breakdown()
                        f.write(f"Job: {paycheck.job_name}\n")
                        f.write(f"  Hourly Rate: ${paycheck.hourly_rate:.2f}\n")
                        f.write(f"  Hours/Week: {paycheck.hours_per_week:.1f}\n")
                        f.write(f"  Frequency: {paycheck.frequency}\n")
                        f.write(f"  Gross Pay: ${breakdown['gross_pay']:.2f}\n")
                        f.write(f"  Net Pay: ${breakdown['net_pay']:.2f}\n")
                        f.write(f"  Federal Tax: ${breakdown['federal_tax']:.2f}\n")
                        f.write(f"  State Tax: ${breakdown['state_tax']:.2f}\n")
                        f.write(f"  Social Security: ${breakdown['social_security']:.2f}\n")
                        f.write(f"  Medicare: ${breakdown['medicare']:.2f}\n")
                        f.write(f"  Health Insurance: ${breakdown['health_insurance']:.2f}\n")
                        f.write(f"  Other Deductions: ${breakdown['other_deductions']:.2f}\n")
                        f.write(f"  Start Date: {paycheck.start_date}\n")
                        if paycheck.end_date:
                            f.write(f"  End Date: {paycheck.end_date}\n")
                        f.write("\n")
                else:
                    f.write("No paychecks configured.\n\n")
                
                # Transactions (only past and current, no future)
                f.write("TRANSACTIONS\n")
                f.write("-" * 20 + "\n")
                if self.calculator.transactions:
                    for trans in self.calculator.transactions:
                        # Only include transactions that have already started
                        if trans.start_date <= current_date.date():
                            f.write(f"Name: {trans.name}\n")
                            f.write(f"  Amount: ${trans.amount:.2f}\n")
                            f.write(f"  Type: {trans.transaction_type.title()}\n")
                            f.write(f"  Category: {trans.category.title()}\n")
                            f.write(f"  Frequency: {trans.frequency}\n")
                            f.write(f"  Start Date: {trans.start_date}\n")
                            if trans.end_date:
                                f.write(f"  End Date: {trans.end_date}\n")
                            f.write("\n")
                else:
                    f.write("No transactions configured.\n\n")
                
                # Crypto Portfolio
                f.write("CRYPTOCURRENCY PORTFOLIO\n")
                f.write("-" * 30 + "\n")
                if self.calculator.crypto_portfolio.holdings:
                    portfolio = self.calculator.crypto_portfolio
                    f.write(f"Total Portfolio Value: ${portfolio.get_total_value():,.2f}\n")
                    f.write(f"Total Cost Basis: ${portfolio.get_total_cost():,.2f}\n")
                    f.write(f"Total P/L: ${portfolio.get_total_profit_loss():,.2f}\n")
                    f.write(f"Total P/L %: {portfolio.get_total_profit_loss_percentage():.2f}%\n\n")
                    
                    f.write("Holdings:\n")
                    for holding in portfolio.holdings:
                        f.write(f"  {holding.symbol} ({holding.name})\n")
                        f.write(f"    Amount: {holding.amount:.8f}\n")
                        f.write(f"    Purchase Price: ${holding.purchase_price:.2f}\n")
                        f.write(f"    Current Price: ${holding.current_price:.2f}\n")
                        f.write(f"    Purchase Date: {holding.purchase_date}\n")
                        f.write(f"    Current Value: ${holding.get_current_value():.2f}\n")
                        f.write(f"    P/L: ${holding.get_profit_loss():,.2f}\n")
                        f.write(f"    P/L %: {holding.get_profit_loss_percentage():.2f}%\n\n")
                    
                    if portfolio.last_updated:
                        f.write(f"Last Updated: {portfolio.last_updated.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                else:
                    f.write("No cryptocurrency holdings.\n\n")
                
                # Monthly Summary (current month only)
                current_month = current_date.month
                current_year = current_date.year
                month_name = calendar.month_name[current_month]
                
                f.write(f"CURRENT MONTH SUMMARY ({month_name} {current_year})\n")
                f.write("-" * 40 + "\n")
                
                income, expenses = self.calculate_monthly_summary(current_year, current_month)
                f.write(f"Total Income: ${income:,.2f}\n")
                f.write(f"Total Expenses: ${expenses:,.2f}\n")
                f.write(f"Net Income: ${(income - expenses):,.2f}\n\n")
                
                # Category breakdown for current month
                f.write("EXPENSE BREAKDOWN BY CATEGORY\n")
                f.write("-" * 35 + "\n")
                category_totals = self.get_monthly_category_breakdown(current_year, current_month)
                for category, amount in sorted(category_totals.items()):
                    if amount > 0:
                        f.write(f"  {category.title()}: ${amount:,.2f}\n")
            
            messagebox.showinfo("Export Complete", f"Financial report exported to:\n{filename}")
            
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export report: {str(e)}")
    
    def get_monthly_category_breakdown(self, year, month):
        """Get expense breakdown by category for a specific month"""
        first_day = date(year, month, 1)
        last_day = date(year, month, calendar.monthrange(year, month)[1])
        
        category_totals = {}
        
        current_date = first_day
        while current_date <= last_day:
            transactions = self.calculator.get_transactions_for_date(current_date)
            for trans in transactions:
                if trans.transaction_type == "expense":
                    category = trans.category
                    if category not in category_totals:
                        category_totals[category] = 0
                    category_totals[category] += trans.amount
            current_date += timedelta(days=1)
        
        return category_totals
    
    def set_balance_dialog(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("Set Current Balance")
        dialog.geometry("300x150")
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Apply theme
        theme = self.theme_manager.get_theme()
        dialog.configure(bg=theme['dialog_bg'])
        
        frame = ttk.Frame(dialog, padding="20")
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="Current Balance:").pack()
        
        balance_var = tk.StringVar(value=str(self.current_balance))
        entry = ttk.Entry(frame, textvariable=balance_var)
        entry.pack(pady=10)
        entry.focus()
        
        def save_balance():
            try:
                self.current_balance = float(balance_var.get())
                self.balance_label.config(text=f"${self.current_balance:,.2f}")
                self.update_crypto_display()  # Update net worth
                self.maybe_auto_save()
                dialog.destroy()
            except ValueError:
                messagebox.showerror("Invalid Input", "Please enter a valid number.")
        
        button_frame = ttk.Frame(frame)
        button_frame.pack()
        
        ttk.Button(button_frame, text="Save", command=save_balance).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=dialog.destroy).pack(side=tk.LEFT)
        
        entry.bind("<Return>", lambda e: save_balance())
    
    def save_data(self):
        data = {
            'current_balance': self.current_balance,
            'transactions': [trans.to_dict() for trans in self.calculator.transactions],
            'paychecks': [paycheck.to_dict() for paycheck in self.calculator.paychecks],
            'savings_accounts': [acc.to_dict() for acc in self.calculator.savings_accounts],
            'crypto_portfolio': self.calculator.crypto_portfolio.to_dict()
        }
        
        try:
            with open(self.data_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            messagebox.showerror("Save Error", f"Could not save data: {str(e)}")

    def maybe_auto_save(self):
        """Save data if the auto_save preference is enabled."""
        if self.preferences.get('auto_save', True):
            self.save_data()
    
    def load_data(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                
                self.current_balance = data.get('current_balance', 0.0)
                
                for trans_data in data.get('transactions', []):
                    trans = Transaction.from_dict(trans_data)
                    self.calculator.add_transaction(trans)
                
                for paycheck_data in data.get('paychecks', []):
                    paycheck = Paycheck.from_dict(paycheck_data)
                    self.calculator.add_paycheck(paycheck)
                
                for acc_data in data.get('savings_accounts', []):
                    acc = SavingsAccount.from_dict(acc_data)
                    self.calculator.add_savings_account(acc)
                
                crypto_data = data.get('crypto_portfolio', {})
                if crypto_data:
                    self.calculator.crypto_portfolio = CryptoPortfolio.from_dict(crypto_data)
            
            except Exception as e:
                messagebox.showerror("Load Error", f"Could not load data: {str(e)}")
    
    def new_budget(self):
        if messagebox.askyesno("New Budget", "Create a new budget? All current data will be lost."):
            self.calculator = BudgetCalculator()
            self.current_balance = 0.0
            self.refresh_calendar()
    
    def open_budget(self):
        filename = filedialog.askopenfilename(
            title="Open Budget File",
            initialdir=os.getcwd(),
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        if filename:
            self.data_file = filename
            self.calculator = BudgetCalculator()
            self.load_data()
            self.refresh_calendar()
    
    def save_as(self):
        filename = filedialog.asksaveasfilename(
            title="Save Budget As",
            initialdir=os.getcwd(),
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        if filename:
            self.data_file = filename
            self.maybe_auto_save()

class PreferencesDialog:
    def __init__(self, parent, preferences, theme_manager):
        self.preferences = preferences
        self.theme_manager = theme_manager
        self.original_values = {}
        self.changes_made = False
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title("Preferences")
        self.dialog.geometry("600x700")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Apply theme to dialog
        theme = self.theme_manager.get_theme()
        self.dialog.configure(bg=theme['dialog_bg'])
        
        self.store_original_values()
        self.setup_dialog()
        self.dialog.protocol("WM_DELETE_WINDOW", self.on_close)
        
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")
    
    def store_original_values(self):
        self.original_values = {
            'theme': self.preferences.get('theme', 'light'),
            'auto_save': self.preferences.get('auto_save', True),
            'show_weekends': self.preferences.get('show_weekends', True),
            'currency_symbol': self.preferences.get('currency_symbol', '$'),
            'date_format': self.preferences.get('date_format', '%Y-%m-%d'),
            'decimal_places': self.preferences.get('decimal_places', 2),
            'show_cents': self.preferences.get('show_cents', True),
            'colors': self.preferences.get('colors', {}).copy()
        }
    
    def setup_dialog(self):
        notebook = ttk.Notebook(self.dialog)
        notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.setup_appearance_tab(notebook)
        self.setup_general_tab(notebook)
        self.setup_colors_tab(notebook)
        self.setup_buttons()
    
    def setup_appearance_tab(self, notebook):
        appearance_frame = ttk.Frame(notebook, padding="20")
        notebook.add(appearance_frame, text="Appearance")
        
        ttk.Label(appearance_frame, text="Theme:", font=("Arial", 12, "bold")).pack(anchor=tk.W, pady=(0, 10))
        
        self.theme_var = tk.StringVar(value=self.preferences.get('theme', 'light'))
        self.theme_var.trace('w', self.on_change)
        
        theme_frame = ttk.Frame(appearance_frame)
        theme_frame.pack(anchor=tk.W, pady=(0, 20))
        
        ttk.Radiobutton(theme_frame, text="Light Theme", variable=self.theme_var, value="light").pack(anchor=tk.W)
        ttk.Radiobutton(theme_frame, text="Dark Theme", variable=self.theme_var, value="dark").pack(anchor=tk.W, pady=(5, 0))
        
        ttk.Label(theme_frame, text="(Requires restart to fully apply)", font=("Arial", 8)).pack(anchor=tk.W, pady=(5, 0))
        
        ttk.Label(appearance_frame, text="Display Options:", font=("Arial", 12, "bold")).pack(anchor=tk.W, pady=(20, 10))
        
        self.show_weekends_var = tk.BooleanVar(value=self.preferences.get('show_weekends', True))
        self.show_weekends_var.trace('w', self.on_change)
        ttk.Checkbutton(appearance_frame, text="Show weekends in calendar", variable=self.show_weekends_var).pack(anchor=tk.W)
        
        self.show_cents_var = tk.BooleanVar(value=self.preferences.get('show_cents', True))
        self.show_cents_var.trace('w', self.on_change)
        ttk.Checkbutton(appearance_frame, text="Show cents in amounts", variable=self.show_cents_var).pack(anchor=tk.W, pady=(5, 0))
    
    def setup_general_tab(self, notebook):
        general_frame = ttk.Frame(notebook, padding="20")
        notebook.add(general_frame, text="General")
        
        ttk.Label(general_frame, text="Currency Settings:", font=("Arial", 12, "bold")).pack(anchor=tk.W, pady=(0, 10))
        
        currency_frame = ttk.Frame(general_frame)
        currency_frame.pack(anchor=tk.W, pady=(0, 20))
        
        ttk.Label(currency_frame, text="Currency Symbol:").grid(row=0, column=0, sticky=tk.W)
        self.currency_var = tk.StringVar(value=self.preferences.get('currency_symbol', '$'))
        self.currency_var.trace('w', self.on_change)
        currency_entry = ttk.Entry(currency_frame, textvariable=self.currency_var, width=5)
        currency_entry.grid(row=0, column=1, padx=(10, 0), sticky=tk.W)
        
        ttk.Label(currency_frame, text="Decimal Places:").grid(row=1, column=0, sticky=tk.W, pady=(10, 0))
        self.decimal_var = tk.StringVar(value=str(self.preferences.get('decimal_places', 2)))
        self.decimal_var.trace('w', self.on_change)
        decimal_combo = ttk.Combobox(currency_frame, textvariable=self.decimal_var, width=5)
        decimal_combo['values'] = ("0", "1", "2", "3", "4")
        decimal_combo.grid(row=1, column=1, padx=(10, 0), sticky=tk.W, pady=(10, 0))
        decimal_combo.state(['readonly'])
        
        ttk.Label(general_frame, text="Date Format:", font=("Arial", 12, "bold")).pack(anchor=tk.W, pady=(20, 10))
        
        self.date_format_var = tk.StringVar(value=self.preferences.get('date_format', '%Y-%m-%d'))
        self.date_format_var.trace('w', self.on_change)
        date_combo = ttk.Combobox(general_frame, textvariable=self.date_format_var, width=20)
        date_combo['values'] = ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%B %d, %Y")
        date_combo.pack(anchor=tk.W)
        date_combo.state(['readonly'])
        
        ttk.Label(general_frame, text="File Settings:", font=("Arial", 12, "bold")).pack(anchor=tk.W, pady=(20, 10))
        
        self.auto_save_var = tk.BooleanVar(value=self.preferences.get('auto_save', True))
        self.auto_save_var.trace('w', self.on_change)
        ttk.Checkbutton(general_frame, text="Auto-save changes", variable=self.auto_save_var).pack(anchor=tk.W)
    
    def setup_colors_tab(self, notebook):
        colors_frame = ttk.Frame(notebook, padding="20")
        notebook.add(colors_frame, text="Colors")
        
        ttk.Label(colors_frame, text="Category Colors:", font=("Arial", 12, "bold")).pack(anchor=tk.W, pady=(0, 15))
        
        canvas = tk.Canvas(colors_frame, height=400)
        scrollbar = ttk.Scrollbar(colors_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        self.color_vars = {}
        colors = self.preferences.get('colors', {})
        
        categories = [
            ('income', 'Income/Paychecks'),
            ('expense', 'General Expenses'), 
            ('savings', 'Savings'),
            ('investment', 'Investments'),
            ('entertainment', 'Entertainment'),
            ('utilities', 'Utilities/Bills'),
            ('food', 'Food/Dining'),
            ('transportation', 'Transportation'),
            ('other', 'Other'),
            ('positive_day', 'Positive Day Background'),
            ('negative_day', 'Negative Day Background'),
            ('neutral_day', 'Neutral Day Background')
        ]
        
        for i, (key, label) in enumerate(categories):
            row = i // 2
            col = i % 2
            
            category_frame = ttk.Frame(scrollable_frame)
            category_frame.grid(row=row, column=col, sticky=tk.W, padx=(0, 30), pady=5)
            
            ttk.Label(category_frame, text=f"{label}:", width=20).pack(side=tk.LEFT)
            
            self.color_vars[key] = tk.StringVar(value=colors.get(key, '#000000'))
            self.color_vars[key].trace('w', self.on_change)
            
            color_button = tk.Button(category_frame, 
                                   text="  ", 
                                   bg=colors.get(key, '#000000'),
                                   width=3,
                                   command=lambda k=key: self.choose_color(k))
            color_button.pack(side=tk.LEFT, padx=(5, 0))
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
    
    def setup_buttons(self):
        button_frame = ttk.Frame(self.dialog)
        button_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Button(button_frame, text="Save", command=self.save_preferences).pack(side=tk.RIGHT, padx=(5, 0))
        ttk.Button(button_frame, text="Cancel", command=self.cancel_changes).pack(side=tk.RIGHT)
        ttk.Button(button_frame, text="Apply", command=self.apply_preferences).pack(side=tk.RIGHT, padx=(0, 5))
        ttk.Button(button_frame, text="Reset to Defaults", command=self.reset_defaults).pack(side=tk.LEFT)
    
    def on_change(self, *args):
        self.changes_made = True
    
    def choose_color(self, category):
        from tkinter import colorchooser
        color = colorchooser.askcolor(color=self.color_vars[category].get())
        if color[1]:
            self.color_vars[category].set(color[1])
    
    def has_unsaved_changes(self):
        current_values = {
            'theme': self.theme_var.get(),
            'auto_save': self.auto_save_var.get(),
            'show_weekends': self.show_weekends_var.get(),
            'currency_symbol': self.currency_var.get(),
            'date_format': self.date_format_var.get(),
            'decimal_places': int(self.decimal_var.get()),
            'show_cents': self.show_cents_var.get(),
            'colors': {k: v.get() for k, v in self.color_vars.items()}
        }
        
        return current_values != self.original_values
    
    def on_close(self):
        if self.has_unsaved_changes():
            result = messagebox.askyesnocancel(
                "Unsaved Changes", 
                "You have unsaved changes. Do you want to save them before closing?"
            )
            if result is True:
                self.save_preferences()
            elif result is False:
                self.dialog.destroy()
        else:
            self.dialog.destroy()
    
    def cancel_changes(self):
        if self.has_unsaved_changes():
            if messagebox.askyesno("Discard Changes", "Discard all unsaved changes?"):
                self.dialog.destroy()
        else:
            self.dialog.destroy()
    
    def apply_preferences(self):
        self.save_preferences_internal()
        messagebox.showinfo("Applied", "Preferences applied successfully!")
    
    def save_preferences(self):
        self.save_preferences_internal()
        messagebox.showinfo("Saved", "Preferences saved successfully!")
        self.dialog.destroy()
    
    def save_preferences_internal(self):
        self.preferences.set('theme', self.theme_var.get())
        self.preferences.set('auto_save', self.auto_save_var.get())
        self.preferences.set('show_weekends', self.show_weekends_var.get())
        self.preferences.set('currency_symbol', self.currency_var.get())
        self.preferences.set('date_format', self.date_format_var.get())
        self.preferences.set('decimal_places', int(self.decimal_var.get()))
        self.preferences.set('show_cents', self.show_cents_var.get())
        
        colors = {}
        for key, var in self.color_vars.items():
            colors[key] = var.get()
        self.preferences.set('colors', colors)
        
        self.store_original_values()
        self.changes_made = False
    
    def reset_defaults(self):
        if messagebox.askyesno("Reset", "Reset all preferences to defaults?"):
            defaults = UserPreferences().default_prefs
            
            self.theme_var.set(defaults['theme'])
            self.auto_save_var.set(defaults['auto_save'])
            self.show_weekends_var.set(defaults['show_weekends'])
            self.currency_var.set(defaults['currency_symbol'])
            self.date_format_var.set(defaults['date_format'])
            self.decimal_var.set(str(defaults['decimal_places']))
            self.show_cents_var.set(defaults['show_cents'])
            
            for key, color in defaults['colors'].items():
                if key in self.color_vars:
                    self.color_vars[key].set(color)

class CryptoPortfolioWindow:
    def __init__(self, parent, calculator, preferences, theme_manager, update_callback=None, save_callback=None):
        self.calculator = calculator
        self.preferences = preferences
        self.theme_manager = theme_manager
        self.update_callback = update_callback
        self.save_callback = save_callback
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title("Crypto Portfolio")
        self.dialog.geometry("1000x600")
        self.dialog.transient(parent)
        
        # Apply theme to dialog
        theme = self.theme_manager.get_theme()
        self.dialog.configure(bg=theme['dialog_bg'])
        
        self.setup_window()
        self.update_display()
        
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")
    
    def setup_window(self):
        main_frame = ttk.Frame(self.dialog, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(header_frame, text="Cryptocurrency Portfolio", font=("Arial", 16, "bold")).pack(side=tk.LEFT)
        ttk.Button(header_frame, text="Refresh Prices", command=self.refresh_prices).pack(side=tk.RIGHT)
        ttk.Button(header_frame, text="Add Holding", command=self.add_holding).pack(side=tk.RIGHT, padx=(0, 10))
        
        summary_frame = ttk.LabelFrame(main_frame, text="Portfolio Summary", padding="10")
        summary_frame.pack(fill=tk.X, pady=(0, 20))
        
        self.total_value_label = ttk.Label(summary_frame, font=("Arial", 12, "bold"))
        self.total_value_label.grid(row=0, column=0, sticky=tk.W)
        
        self.total_cost_label = ttk.Label(summary_frame, font=("Arial", 10))
        self.total_cost_label.grid(row=1, column=0, sticky=tk.W)
        
        self.profit_loss_label = ttk.Label(summary_frame, font=("Arial", 10))
        self.profit_loss_label.grid(row=2, column=0, sticky=tk.W)
        
        self.last_updated_label = ttk.Label(summary_frame, font=("Arial", 8))
        self.last_updated_label.grid(row=3, column=0, sticky=tk.W, pady=(10, 0))
        
        holdings_frame = ttk.LabelFrame(main_frame, text="Holdings", padding="10")
        holdings_frame.pack(fill=tk.BOTH, expand=True)
        
        columns = ("Symbol", "Name", "Amount", "Purchase Price", "Current Price", "Value", "P/L", "P/L %")
        self.tree = ttk.Treeview(holdings_frame, columns=columns, show="headings")
        
        for col in columns:
            self.tree.heading(col, text=col)
            if col in ["Symbol", "Name"]:
                self.tree.column(col, width=100)
            else:
                self.tree.column(col, width=90)
        
        scrollbar = ttk.Scrollbar(holdings_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.tree.bind("<Button-3>", self.show_context_menu)
        self.tree.bind("<Double-1>", self.edit_holding)
    
    def update_display(self):
        portfolio = self.calculator.crypto_portfolio
        
        total_value = portfolio.get_total_value()
        total_cost = portfolio.get_total_cost()
        profit_loss = portfolio.get_total_profit_loss()
        pl_percentage = portfolio.get_total_profit_loss_percentage()
        
        self.total_value_label.config(text=f"Total Portfolio Value: ${total_value:,.2f}")
        self.total_cost_label.config(text=f"Total Cost Basis: ${total_cost:,.2f}")
        
        pl_color = "green" if profit_loss >= 0 else "red"
        pl_text = f"Profit/Loss: ${profit_loss:,.2f} ({pl_percentage:+.2f}%)"
        self.profit_loss_label.config(text=pl_text, foreground=pl_color)
        
        if portfolio.last_updated:
            update_text = f"Prices last updated: {portfolio.last_updated.strftime('%Y-%m-%d %H:%M:%S')}"
        else:
            update_text = "Prices not updated yet"
        self.last_updated_label.config(text=update_text)
        
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        for holding in portfolio.holdings:
            profit_loss = holding.get_profit_loss()
            pl_percentage = holding.get_profit_loss_percentage()
            
            item_id = self.tree.insert("", "end", values=(
                holding.symbol,
                holding.name,
                f"{holding.amount:.8f}",
                f"${holding.purchase_price:.2f}" if holding.purchase_price > 0 else "N/A",
                f"${holding.current_price:.2f}" if holding.current_price > 0 else "N/A",
                f"${holding.get_current_value():.2f}",
                f"${profit_loss:+.2f}",
                f"{pl_percentage:+.2f}%"
            ))
            
            if profit_loss > 0:
                self.tree.item(item_id, tags=("profit",))
            elif profit_loss < 0:
                self.tree.item(item_id, tags=("loss",))
        
        self.tree.tag_configure("profit", foreground="green")
        self.tree.tag_configure("loss", foreground="red")
    
    def refresh_prices(self):
        try:
            self.calculator.update_crypto_prices()
            self.update_display()
            # Update main screen if callback provided
            if self.update_callback:
                self.update_callback()
            messagebox.showinfo("Success", "Prices updated successfully!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to update prices: {str(e)}")
    
    def add_holding(self):
        dialog = CryptoDialog(self.dialog, "Add Crypto Holding", self.preferences, self.theme_manager)
        if dialog.result:
            holding = CryptoHolding(
                dialog.result['symbol'],
                dialog.result['name'],
                dialog.result['amount'],
                dialog.result['purchase_price'],
                dialog.result['purchase_date']
            )
            self.calculator.crypto_portfolio.add_holding(holding)
            self.update_display()
            # Update main screen if callback provided
            if self.update_callback:
                self.update_callback()
            # Save data
            if self.save_callback:
                self.save_callback()
    
    def edit_holding(self, event):
        selection = self.tree.selection()
        if not selection:
            return
        
        idx = self.tree.index(selection[0])
        holding = self.calculator.crypto_portfolio.holdings[idx]
        edit_dialog = EditCryptoDialog(self.dialog, holding, self.preferences, self.theme_manager)
        if edit_dialog.result:
            # Update holding with new values
            holding.symbol = edit_dialog.result['symbol']
            holding.name = edit_dialog.result['name']
            holding.amount = edit_dialog.result['amount']
            holding.purchase_price = edit_dialog.result['purchase_price']
            holding.purchase_date = edit_dialog.result['purchase_date']
            self.update_display()
            # Update main screen if callback provided
            if self.update_callback:
                self.update_callback()
            # Save data
            if self.save_callback:
                self.save_callback()
    
    def show_context_menu(self, event):
        selection = self.tree.selection()
        if not selection:
            return
        
        menu = tk.Menu(self.dialog, tearoff=0)
        
        # Apply theme to context menu
        theme = self.theme_manager.get_theme()
        menu.configure(bg=theme['menu_bg'], fg=theme['menu_fg'])
        
        menu.add_command(label="Edit Holding", command=lambda: self.edit_holding(event))
        menu.add_command(label="Delete Holding", command=self.delete_holding)
        menu.tk_popup(event.x_root, event.y_root)
    
    def delete_holding(self):
        selection = self.tree.selection()
        if not selection:
            return
        
        idx = self.tree.index(selection[0])
        holding = self.calculator.crypto_portfolio.holdings[idx]
        
        if messagebox.askyesno("Confirm Delete", f"Delete {holding.symbol} holding?"):
            self.calculator.crypto_portfolio.remove_holding(holding)
            self.update_display()
            # Update main screen if callback provided
            if self.update_callback:
                self.update_callback()
            # Save data
            if self.save_callback:
                self.save_callback()

class CryptoDialog:
    def __init__(self, parent, title, preferences, theme_manager):
        self.result = None
        self.preferences = preferences
        self.theme_manager = theme_manager
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("400x350")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Apply theme to dialog
        theme = self.theme_manager.get_theme()
        self.dialog.configure(bg=theme['dialog_bg'])
        
        self.setup_dialog()
        
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")
        
        self.dialog.wait_window()
    
    def setup_dialog(self):
        frame = ttk.Frame(self.dialog, padding="20")
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="Add Cryptocurrency Holding", font=("Arial", 12, "bold")).grid(row=0, column=0, columnspan=2, pady=(0, 20))
        
        ttk.Label(frame, text="Symbol (e.g., BTC):").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.symbol_var = tk.StringVar()
        symbol_entry = ttk.Entry(frame, textvariable=self.symbol_var, width=30)
        symbol_entry.grid(row=1, column=1, pady=5, padx=(10, 0))
        symbol_entry.focus()
        
        ttk.Label(frame, text="Name (e.g., Bitcoin):").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.name_var = tk.StringVar()
        ttk.Entry(frame, textvariable=self.name_var, width=30).grid(row=2, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Amount:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.amount_var = tk.StringVar()
        ttk.Entry(frame, textvariable=self.amount_var, width=30).grid(row=3, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Purchase Price ($):").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.price_var = tk.StringVar()
        ttk.Entry(frame, textvariable=self.price_var, width=30).grid(row=4, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Purchase Date:").grid(row=5, column=0, sticky=tk.W, pady=5)
        self.date_var = tk.StringVar(value=datetime.now().strftime("%Y-%m-%d"))
        ttk.Entry(frame, textvariable=self.date_var, width=30).grid(row=5, column=1, pady=5, padx=(10, 0))
        
        button_frame = ttk.Frame(frame)
        button_frame.grid(row=6, column=0, columnspan=2, pady=20)
        
        ttk.Button(button_frame, text="Add Holding", command=self.save_holding).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=self.dialog.destroy).pack(side=tk.LEFT)
    
    def save_holding(self):
        try:
            symbol = self.symbol_var.get().strip().upper()
            if not symbol:
                messagebox.showerror("Error", "Please enter a symbol.")
                return
            
            name = self.name_var.get().strip()
            if not name:
                messagebox.showerror("Error", "Please enter a name.")
                return
            
            amount = float(self.amount_var.get())
            if amount <= 0:
                messagebox.showerror("Error", "Amount must be greater than 0.")
                return
            
            purchase_price = float(self.price_var.get() or 0)
            purchase_date = datetime.strptime(self.date_var.get(), "%Y-%m-%d").date()
            
            self.result = {
                'symbol': symbol,
                'name': name,
                'amount': amount,
                'purchase_price': purchase_price,
                'purchase_date': purchase_date
            }
            
            self.dialog.destroy()
            
        except ValueError:
            messagebox.showerror("Error", "Please check your input values.")

class EditCryptoDialog:
    def __init__(self, parent, holding, preferences, theme_manager):
        self.result = None
        self.preferences = preferences
        self.theme_manager = theme_manager
        self.holding = holding
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title("Edit Crypto Holding")
        self.dialog.geometry("400x350")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Apply theme to dialog
        theme = self.theme_manager.get_theme()
        self.dialog.configure(bg=theme['dialog_bg'])
        
        self.setup_dialog()
        
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")
        
        self.dialog.wait_window()
    
    def setup_dialog(self):
        frame = ttk.Frame(self.dialog, padding="20")
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="Edit Cryptocurrency Holding", font=("Arial", 12, "bold")).grid(row=0, column=0, columnspan=2, pady=(0, 20))
        
        # Pre-fill with existing holding data
        ttk.Label(frame, text="Symbol (e.g., BTC):").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.symbol_var = tk.StringVar(value=self.holding.symbol)
        symbol_entry = ttk.Entry(frame, textvariable=self.symbol_var, width=30)
        symbol_entry.grid(row=1, column=1, pady=5, padx=(10, 0))
        symbol_entry.focus()
        
        ttk.Label(frame, text="Name (e.g., Bitcoin):").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.name_var = tk.StringVar(value=self.holding.name)
        ttk.Entry(frame, textvariable=self.name_var, width=30).grid(row=2, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Amount:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.amount_var = tk.StringVar(value=str(self.holding.amount))
        ttk.Entry(frame, textvariable=self.amount_var, width=30).grid(row=3, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Purchase Price ($):").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.price_var = tk.StringVar(value=str(self.holding.purchase_price))
        ttk.Entry(frame, textvariable=self.price_var, width=30).grid(row=4, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Purchase Date:").grid(row=5, column=0, sticky=tk.W, pady=5)
        self.date_var = tk.StringVar(value=self.holding.purchase_date.strftime("%Y-%m-%d"))
        ttk.Entry(frame, textvariable=self.date_var, width=30).grid(row=5, column=1, pady=5, padx=(10, 0))
        
        # Current value display (read-only)
        ttk.Label(frame, text="Current Price:").grid(row=6, column=0, sticky=tk.W, pady=5)
        current_price_text = f"${self.holding.current_price:.2f}" if self.holding.current_price > 0 else "Not updated"
        ttk.Label(frame, text=current_price_text, foreground="blue").grid(row=6, column=1, sticky=tk.W, padx=(10, 0), pady=5)
        
        button_frame = ttk.Frame(frame)
        button_frame.grid(row=7, column=0, columnspan=2, pady=20)
        
        ttk.Button(button_frame, text="Save Changes", command=self.save_holding).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=self.dialog.destroy).pack(side=tk.LEFT)
    
    def save_holding(self):
        try:
            symbol = self.symbol_var.get().strip().upper()
            if not symbol:
                messagebox.showerror("Error", "Please enter a symbol.")
                return
            
            name = self.name_var.get().strip()
            if not name:
                messagebox.showerror("Error", "Please enter a name.")
                return
            
            amount = float(self.amount_var.get())
            if amount <= 0:
                messagebox.showerror("Error", "Amount must be greater than 0.")
                return
            
            purchase_price = float(self.price_var.get() or 0)
            purchase_date = datetime.strptime(self.date_var.get(), "%Y-%m-%d").date()
            
            self.result = {
                'symbol': symbol,
                'name': name,
                'amount': amount,
                'purchase_price': purchase_price,
                'purchase_date': purchase_date
            }
            
            self.dialog.destroy()
            
        except ValueError:
            messagebox.showerror("Error", "Please check your input values.")

class PaycheckDialog:
    def __init__(self, parent, title, preferences, theme_manager):
        self.result = None
        self.preferences = preferences
        self.theme_manager = theme_manager
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("500x700")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Apply theme to dialog
        theme = self.theme_manager.get_theme()
        self.dialog.configure(bg=theme['dialog_bg'])
        
        self.setup_dialog()
        
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")
        
        self.dialog.wait_window()
    
    def setup_dialog(self):
        # Create notebook for tabs
        notebook = ttk.Notebook(self.dialog)
        notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Basic info tab
        basic_frame = ttk.Frame(notebook, padding="20")
        notebook.add(basic_frame, text="Basic Info")
        self.setup_basic_tab(basic_frame)
        
        # Tax info tab
        tax_frame = ttk.Frame(notebook, padding="20")
        notebook.add(tax_frame, text="Tax & Deductions")
        self.setup_tax_tab(tax_frame)
        
        # Preview tab
        preview_frame = ttk.Frame(notebook, padding="20")
        notebook.add(preview_frame, text="Paycheck Preview")
        self.setup_preview_tab(preview_frame)
        
        # Buttons
        button_frame = ttk.Frame(self.dialog)
        button_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Button(button_frame, text="Save Paycheck", command=self.save_paycheck).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=self.dialog.destroy).pack(side=tk.LEFT)
    
    def setup_basic_tab(self, frame):
        ttk.Label(frame, text="Job/Employer Name:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.job_name_var = tk.StringVar()
        ttk.Entry(frame, textvariable=self.job_name_var, width=30).grid(row=0, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Hourly Rate ($):").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.hourly_rate_var = tk.StringVar()
        ttk.Entry(frame, textvariable=self.hourly_rate_var, width=30).grid(row=1, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Hours per Week:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.hours_var = tk.StringVar(value="40")
        ttk.Entry(frame, textvariable=self.hours_var, width=30).grid(row=2, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Pay Frequency:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.frequency_var = tk.StringVar(value="bi-weekly")
        frequency_combo = ttk.Combobox(frame, textvariable=self.frequency_var, width=27)
        frequency_combo['values'] = ("daily", "weekly", "bi-weekly", "monthly")
        frequency_combo.grid(row=3, column=1, pady=5, padx=(10, 0))
        frequency_combo.state(['readonly'])
        
        ttk.Label(frame, text="First Paycheck Date:").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.date_var = tk.StringVar(value=datetime.now().strftime("%Y-%m-%d"))
        ttk.Entry(frame, textvariable=self.date_var, width=30).grid(row=4, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Last Paycheck (optional):").grid(row=5, column=0, sticky=tk.W, pady=5)
        self.end_date_var = tk.StringVar()
        ttk.Entry(frame, textvariable=self.end_date_var, width=30).grid(row=5, column=1, pady=5, padx=(10, 0))
    
    def setup_tax_tab(self, frame):
        ttk.Label(frame, text="Tax Information", font=("Arial", 12, "bold")).grid(row=0, column=0, columnspan=2, pady=(0, 15))
        
        ttk.Label(frame, text="Filing Status:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.filing_status_var = tk.StringVar(value="single")
        filing_combo = ttk.Combobox(frame, textvariable=self.filing_status_var, width=27)
        filing_combo['values'] = ("single", "married_joint", "married_separate", "head_of_household")
        filing_combo.grid(row=1, column=1, pady=5, padx=(10, 0))
        filing_combo.state(['readonly'])
        
        ttk.Label(frame, text="Tax Allowances:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.allowances_var = tk.StringVar(value="1")
        ttk.Entry(frame, textvariable=self.allowances_var, width=30).grid(row=2, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Deductions", font=("Arial", 12, "bold")).grid(row=3, column=0, columnspan=2, pady=(20, 15))
        
        ttk.Label(frame, text="Health Insurance (per pay):").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.health_insurance_var = tk.StringVar(value="0.00")
        ttk.Entry(frame, textvariable=self.health_insurance_var, width=30).grid(row=4, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Other Deductions (per pay):").grid(row=5, column=0, sticky=tk.W, pady=5)
        self.other_deductions_var = tk.StringVar(value="0.00")
        ttk.Entry(frame, textvariable=self.other_deductions_var, width=30).grid(row=5, column=1, pady=5, padx=(10, 0))
        
        # Add trace for real-time preview updates
        for var in [self.hourly_rate_var, self.hours_var, self.frequency_var, 
                   self.filing_status_var, self.allowances_var, 
                   self.health_insurance_var, self.other_deductions_var]:
            var.trace('w', self.update_preview)
    
    def setup_preview_tab(self, frame):
        ttk.Label(frame, text="Paycheck Preview", font=("Arial", 14, "bold")).pack(pady=(0, 20))
        
        self.preview_frame = ttk.LabelFrame(frame, text="Calculated Paycheck", padding="15")
        self.preview_frame.pack(fill=tk.BOTH, expand=True)
        
        self.preview_labels = {}
        
        # Initial empty preview
        ttk.Label(self.preview_frame, text="Enter paycheck details to see preview").pack(pady=20)
    
    def update_preview(self, *args):
        try:
            # Clear existing preview
            for widget in self.preview_frame.winfo_children():
                widget.destroy()
            
            rate = float(self.hourly_rate_var.get() or 0)
            hours = float(self.hours_var.get() or 0)
            frequency = self.frequency_var.get()
            filing_status = self.filing_status_var.get()
            allowances = int(self.allowances_var.get() or 1)
            health_insurance = float(self.health_insurance_var.get() or 0)
            other_deductions = float(self.other_deductions_var.get() or 0)
            
            if rate > 0 and hours > 0:
                # Create temporary paycheck for preview
                temp_paycheck = Paycheck(
                    "Preview", rate, hours, frequency, 
                    filing_status=filing_status, allowances=allowances,
                    health_insurance=health_insurance, other_deductions=other_deductions
                )
                
                breakdown = temp_paycheck.calculate_tax_breakdown()
                
                row = 0
                ttk.Label(self.preview_frame, text="Gross Pay:", font=("Arial", 11, "bold")).grid(row=row, column=0, sticky=tk.W)
                ttk.Label(self.preview_frame, text=f"${breakdown['gross_pay']:.2f}", 
                         font=("Arial", 11)).grid(row=row, column=1, sticky=tk.W, padx=(20, 0))
                row += 1
                
                ttk.Label(self.preview_frame, text="Deductions:", font=("Arial", 11, "bold")).grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(10, 5))
                row += 1
                
                deductions = [
                    ("Federal Income Tax", breakdown['federal_tax']),
                    ("Virginia State Tax", breakdown['state_tax']),
                    ("Social Security", breakdown['social_security']),
                    ("Medicare", breakdown['medicare']),
                    ("Health Insurance", breakdown['health_insurance']),
                    ("Other Deductions", breakdown['other_deductions'])
                ]
                
                for label, amount in deductions:
                    ttk.Label(self.preview_frame, text=f"  {label}:").grid(row=row, column=0, sticky=tk.W, padx=(20, 0))
                    ttk.Label(self.preview_frame, text=f"${amount:.2f}", foreground="red").grid(row=row, column=1, sticky=tk.W, padx=(20, 0))
                    row += 1
                
                ttk.Label(self.preview_frame, text="Total Deductions:", font=("Arial", 11, "bold")).grid(row=row, column=0, sticky=tk.W, pady=(10, 0))
                ttk.Label(self.preview_frame, text=f"${breakdown['total_deductions']:.2f}", 
                         font=("Arial", 11, "bold"), foreground="red").grid(row=row, column=1, sticky=tk.W, padx=(20, 0), pady=(10, 0))
                row += 1
                
                ttk.Label(self.preview_frame, text="Net Take-Home Pay:", font=("Arial", 12, "bold")).grid(row=row, column=0, sticky=tk.W, pady=(10, 0))
                ttk.Label(self.preview_frame, text=f"${breakdown['net_pay']:.2f}", 
                         font=("Arial", 12, "bold"), foreground="green").grid(row=row, column=1, sticky=tk.W, padx=(20, 0), pady=(10, 0))
                row += 1
                
                # Annual estimates
                annual_gross = temp_paycheck.calculate_annual_gross()
                annual_net = breakdown['net_pay'] * (52 if frequency == "weekly" else 26 if frequency == "bi-weekly" else 12)
                
                ttk.Label(self.preview_frame, text="Annual Estimates:", font=("Arial", 11, "bold")).grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(20, 5))
                row += 1
                
                ttk.Label(self.preview_frame, text="  Annual Gross:").grid(row=row, column=0, sticky=tk.W, padx=(20, 0))
                ttk.Label(self.preview_frame, text=f"${annual_gross:,.2f}").grid(row=row, column=1, sticky=tk.W, padx=(20, 0))
                row += 1
                
                ttk.Label(self.preview_frame, text="  Annual Net:").grid(row=row, column=0, sticky=tk.W, padx=(20, 0))
                ttk.Label(self.preview_frame, text=f"${annual_net:,.2f}", foreground="green").grid(row=row, column=1, sticky=tk.W, padx=(20, 0))
                
            else:
                ttk.Label(self.preview_frame, text="Enter hourly rate and hours to see preview").pack(pady=20)
                
        except (ValueError, AttributeError):
            ttk.Label(self.preview_frame, text="Please check your input values").pack(pady=20)
    
    def save_paycheck(self):
        try:
            job_name = self.job_name_var.get().strip()
            if not job_name:
                messagebox.showerror("Error", "Please enter a job/employer name.")
                return
            
            hourly_rate = float(self.hourly_rate_var.get())
            if hourly_rate <= 0:
                messagebox.showerror("Error", "Hourly rate must be greater than 0.")
                return
            
            hours_per_week = float(self.hours_var.get())
            if hours_per_week <= 0:
                messagebox.showerror("Error", "Hours per week must be greater than 0.")
                return
            
            start_date = datetime.strptime(self.date_var.get(), "%Y-%m-%d").date()
            
            end_date = None
            if self.end_date_var.get().strip():
                end_date = datetime.strptime(self.end_date_var.get(), "%Y-%m-%d").date()
                if end_date <= start_date:
                    messagebox.showerror("Error", "End date must be after start date.")
                    return
            
            allowances = int(self.allowances_var.get() or 1)
            health_insurance = float(self.health_insurance_var.get() or 0)
            other_deductions = float(self.other_deductions_var.get() or 0)
            
            self.result = {
                'job_name': job_name,
                'hourly_rate': hourly_rate,
                'hours_per_week': hours_per_week,
                'frequency': self.frequency_var.get(),
                'start_date': start_date,
                'end_date': end_date,
                'filing_status': self.filing_status_var.get(),
                'allowances': allowances,
                'health_insurance': health_insurance,
                'other_deductions': other_deductions
            }
            
            self.dialog.destroy()
            
        except ValueError:
            messagebox.showerror("Error", "Please check your input values.")

class EditPaycheckDialog:
    def __init__(self, parent, paycheck, preferences, theme_manager):
        self.result = None
        self.preferences = preferences
        self.theme_manager = theme_manager
        self.paycheck = paycheck
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title("Edit Paycheck")
        self.dialog.geometry("500x700")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Apply theme to dialog
        theme = self.theme_manager.get_theme()
        self.dialog.configure(bg=theme['dialog_bg'])
        
        self.setup_dialog()
        
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")
        
        self.dialog.wait_window()
    
    def setup_dialog(self):
        # Create notebook for tabs
        notebook = ttk.Notebook(self.dialog)
        notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Basic info tab
        basic_frame = ttk.Frame(notebook, padding="20")
        notebook.add(basic_frame, text="Basic Info")
        self.setup_basic_tab(basic_frame)
        
        # Tax info tab
        tax_frame = ttk.Frame(notebook, padding="20")
        notebook.add(tax_frame, text="Tax & Deductions")
        self.setup_tax_tab(tax_frame)
        
        # Preview tab
        preview_frame = ttk.Frame(notebook, padding="20")
        notebook.add(preview_frame, text="Paycheck Preview")
        self.setup_preview_tab(preview_frame)
        
        # Buttons
        button_frame = ttk.Frame(self.dialog)
        button_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Button(button_frame, text="Save Changes", command=self.save_paycheck).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=self.dialog.destroy).pack(side=tk.LEFT)
    
    def setup_basic_tab(self, frame):
        # Pre-fill with existing paycheck data
        ttk.Label(frame, text="Job/Employer Name:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.job_name_var = tk.StringVar(value=self.paycheck.job_name)
        ttk.Entry(frame, textvariable=self.job_name_var, width=30).grid(row=0, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Hourly Rate ($):").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.hourly_rate_var = tk.StringVar(value=str(self.paycheck.hourly_rate))
        ttk.Entry(frame, textvariable=self.hourly_rate_var, width=30).grid(row=1, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Hours per Week:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.hours_var = tk.StringVar(value=str(self.paycheck.hours_per_week))
        ttk.Entry(frame, textvariable=self.hours_var, width=30).grid(row=2, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Pay Frequency:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.frequency_var = tk.StringVar(value=self.paycheck.frequency)
        frequency_combo = ttk.Combobox(frame, textvariable=self.frequency_var, width=27)
        frequency_combo['values'] = ("daily", "weekly", "bi-weekly", "monthly")
        frequency_combo.grid(row=3, column=1, pady=5, padx=(10, 0))
        frequency_combo.state(['readonly'])
        
        ttk.Label(frame, text="First Paycheck Date:").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.date_var = tk.StringVar(value=self.paycheck.start_date.strftime("%Y-%m-%d"))
        ttk.Entry(frame, textvariable=self.date_var, width=30).grid(row=4, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Last Paycheck (optional):").grid(row=5, column=0, sticky=tk.W, pady=5)
        end_date_value = self.paycheck.end_date.strftime("%Y-%m-%d") if self.paycheck.end_date else ""
        self.end_date_var = tk.StringVar(value=end_date_value)
        ttk.Entry(frame, textvariable=self.end_date_var, width=30).grid(row=5, column=1, pady=5, padx=(10, 0))
    
    def setup_tax_tab(self, frame):
        ttk.Label(frame, text="Tax Information", font=("Arial", 12, "bold")).grid(row=0, column=0, columnspan=2, pady=(0, 15))
        
        ttk.Label(frame, text="Filing Status:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.filing_status_var = tk.StringVar(value=getattr(self.paycheck, 'filing_status', 'single'))
        filing_combo = ttk.Combobox(frame, textvariable=self.filing_status_var, width=27)
        filing_combo['values'] = ("single", "married_joint", "married_separate", "head_of_household")
        filing_combo.grid(row=1, column=1, pady=5, padx=(10, 0))
        filing_combo.state(['readonly'])
        
        ttk.Label(frame, text="Tax Allowances:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.allowances_var = tk.StringVar(value=str(getattr(self.paycheck, 'allowances', 1)))
        ttk.Entry(frame, textvariable=self.allowances_var, width=30).grid(row=2, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Deductions", font=("Arial", 12, "bold")).grid(row=3, column=0, columnspan=2, pady=(20, 15))
        
        ttk.Label(frame, text="Health Insurance (per pay):").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.health_insurance_var = tk.StringVar(value=str(getattr(self.paycheck, 'health_insurance', 0.0)))
        ttk.Entry(frame, textvariable=self.health_insurance_var, width=30).grid(row=4, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Other Deductions (per pay):").grid(row=5, column=0, sticky=tk.W, pady=5)
        self.other_deductions_var = tk.StringVar(value=str(getattr(self.paycheck, 'other_deductions', 0.0)))
        ttk.Entry(frame, textvariable=self.other_deductions_var, width=30).grid(row=5, column=1, pady=5, padx=(10, 0))
        
        # Add trace for real-time preview updates
        for var in [self.hourly_rate_var, self.hours_var, self.frequency_var, 
                   self.filing_status_var, self.allowances_var, 
                   self.health_insurance_var, self.other_deductions_var]:
            var.trace('w', self.update_preview)
    
    def setup_preview_tab(self, frame):
        ttk.Label(frame, text="Paycheck Preview", font=("Arial", 14, "bold")).pack(pady=(0, 20))
        
        self.preview_frame = ttk.LabelFrame(frame, text="Updated Paycheck", padding="15")
        self.preview_frame.pack(fill=tk.BOTH, expand=True)
        
        # Initialize preview with current data
        self.update_preview()
    
    def update_preview(self, args=None):
        try:
            # Clear existing preview
            for widget in self.preview_frame.winfo_children():
                widget.destroy()
            
            rate = float(self.hourly_rate_var.get() or 0)
            hours = float(self.hours_var.get() or 0)
            frequency = self.frequency_var.get()
            filing_status = self.filing_status_var.get()
            allowances = int(self.allowances_var.get() or 1)
            health_insurance = float(self.health_insurance_var.get() or 0)
            other_deductions = float(self.other_deductions_var.get() or 0)
            
            if rate > 0 and hours > 0:
                # Create temporary paycheck for preview
                temp_paycheck = Paycheck(
                    "Preview", rate, hours, frequency, 
                    filing_status=filing_status, allowances=allowances,
                    health_insurance=health_insurance, other_deductions=other_deductions
                )
                
                breakdown = temp_paycheck.calculate_tax_breakdown()
                
                row = 0
                ttk.Label(self.preview_frame, text="Gross Pay:", font=("Arial", 11, "bold")).grid(row=row, column=0, sticky=tk.W)
                ttk.Label(self.preview_frame, text=f"${breakdown['gross_pay']:.2f}", 
                         font=("Arial", 11)).grid(row=row, column=1, sticky=tk.W, padx=(20, 0))
                row += 1
                
                ttk.Label(self.preview_frame, text="Deductions:", font=("Arial", 11, "bold")).grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(10, 5))
                row += 1
                
                deductions = [
                    ("Federal Income Tax", breakdown['federal_tax']),
                    ("Virginia State Tax", breakdown['state_tax']),
                    ("Social Security", breakdown['social_security']),
                    ("Medicare", breakdown['medicare']),
                    ("Health Insurance", breakdown['health_insurance']),
                    ("Other Deductions", breakdown['other_deductions'])
                ]
                
                for label, amount in deductions:
                    ttk.Label(self.preview_frame, text=f"  {label}:").grid(row=row, column=0, sticky=tk.W, padx=(20, 0))
                    ttk.Label(self.preview_frame, text=f"${amount:.2f}", foreground="red").grid(row=row, column=1, sticky=tk.W, padx=(20, 0))
                    row += 1
                
                ttk.Label(self.preview_frame, text="Total Deductions:", font=("Arial", 11, "bold")).grid(row=row, column=0, sticky=tk.W, pady=(10, 0))
                ttk.Label(self.preview_frame, text=f"${breakdown['total_deductions']:.2f}", 
                         font=("Arial", 11, "bold"), foreground="red").grid(row=row, column=1, sticky=tk.W, padx=(20, 0), pady=(10, 0))
                row += 1
                
                ttk.Label(self.preview_frame, text="Net Take-Home Pay:", font=("Arial", 12, "bold")).grid(row=row, column=0, sticky=tk.W, pady=(10, 0))
                ttk.Label(self.preview_frame, text=f"${breakdown['net_pay']:.2f}", 
                         font=("Arial", 12, "bold"), foreground="green").grid(row=row, column=1, sticky=tk.W, padx=(20, 0), pady=(10, 0))
                row += 1
                
                # Annual estimates
                annual_gross = temp_paycheck.calculate_annual_gross()
                annual_net = breakdown['net_pay'] * (52 if frequency == "weekly" else 26 if frequency == "bi-weekly" else 12)
                
                ttk.Label(self.preview_frame, text="Annual Estimates:", font=("Arial", 11, "bold")).grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(20, 5))
                row += 1
                
                ttk.Label(self.preview_frame, text="  Annual Gross:").grid(row=row, column=0, sticky=tk.W, padx=(20, 0))
                ttk.Label(self.preview_frame, text=f"${annual_gross:,.2f}").grid(row=row, column=1, sticky=tk.W, padx=(20, 0))
                row += 1
                
                ttk.Label(self.preview_frame, text="  Annual Net:").grid(row=row, column=0, sticky=tk.W, padx=(20, 0))
                ttk.Label(self.preview_frame, text=f"${annual_net:,.2f}", foreground="green").grid(row=row, column=1, sticky=tk.W, padx=(20, 0))
                
            else:
                ttk.Label(self.preview_frame, text="Enter hourly rate and hours to see preview").pack(pady=20)
                
        except (ValueError, AttributeError):
            ttk.Label(self.preview_frame, text="Please check your input values").pack(pady=20)
    
    def save_paycheck(self):
        try:
            job_name = self.job_name_var.get().strip()
            if not job_name:
                messagebox.showerror("Error", "Please enter a job/employer name.")
                return
            
            hourly_rate = float(self.hourly_rate_var.get())
            if hourly_rate <= 0:
                messagebox.showerror("Error", "Hourly rate must be greater than 0.")
                return
            
            hours_per_week = float(self.hours_var.get())
            if hours_per_week <= 0:
                messagebox.showerror("Error", "Hours per week must be greater than 0.")
                return
            
            start_date = datetime.strptime(self.date_var.get(), "%Y-%m-%d").date()
            
            end_date = None
            if self.end_date_var.get().strip():
                end_date = datetime.strptime(self.end_date_var.get(), "%Y-%m-%d").date()
                if end_date <= start_date:
                    messagebox.showerror("Error", "End date must be after start date.")
                    return
            
            allowances = int(self.allowances_var.get() or 1)
            health_insurance = float(self.health_insurance_var.get() or 0)
            other_deductions = float(self.other_deductions_var.get() or 0)
            
            self.result = {
                'job_name': job_name,
                'hourly_rate': hourly_rate,
                'hours_per_week': hours_per_week,
                'frequency': self.frequency_var.get(),
                'start_date': start_date,
                'end_date': end_date,
                'filing_status': self.filing_status_var.get(),
                'allowances': allowances,
                'health_insurance': health_insurance,
                'other_deductions': other_deductions
            }
            
            self.dialog.destroy()
            
        except ValueError:
            messagebox.showerror("Error", "Please check your input values.")

class EditTransactionDialog:
    def __init__(self, parent, transaction, preferences, theme_manager):
        self.result = None
        self.preferences = preferences
        self.theme_manager = theme_manager
        self.transaction = transaction
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title("Edit Transaction")
        self.dialog.geometry("450x450")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Apply theme to dialog
        theme = self.theme_manager.get_theme()
        self.dialog.configure(bg=theme['dialog_bg'])
        
        self.setup_dialog()
        
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")
        
        self.dialog.wait_window()
    
    def setup_dialog(self):
        frame = ttk.Frame(self.dialog, padding="20")
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="Edit Transaction", font=("Arial", 12, "bold")).grid(row=0, column=0, columnspan=2, pady=(0, 20))
        
        # Pre-fill with existing transaction data
        ttk.Label(frame, text="Transaction Name:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.name_var = tk.StringVar(value=self.transaction.name)
        ttk.Entry(frame, textvariable=self.name_var, width=30).grid(row=1, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Amount:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.amount_var = tk.StringVar(value=str(self.transaction.amount))
        ttk.Entry(frame, textvariable=self.amount_var, width=30).grid(row=2, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Type:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.type_var = tk.StringVar(value=self.transaction.transaction_type)
        type_frame = ttk.Frame(frame)
        type_frame.grid(row=3, column=1, sticky=tk.W, padx=(10, 0), pady=5)
        ttk.Radiobutton(type_frame, text="Income", variable=self.type_var, value="income").pack(side=tk.LEFT)
        ttk.Radiobutton(type_frame, text="Expense", variable=self.type_var, value="expense").pack(side=tk.LEFT, padx=(20, 0))
        
        ttk.Label(frame, text="Category:").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.category_var = tk.StringVar(value=self.transaction.category)
        category_combo = ttk.Combobox(frame, textvariable=self.category_var, width=27)
        categories = list(self.preferences.get('colors', {}).keys())
        categories = [c for c in categories if not c.endswith('_day')]
        category_combo['values'] = categories
        category_combo.grid(row=4, column=1, pady=5, padx=(10, 0))
        category_combo.state(['readonly'])
        
        ttk.Label(frame, text="Frequency:").grid(row=5, column=0, sticky=tk.W, pady=5)
        self.frequency_var = tk.StringVar(value=self.transaction.frequency)
        frequency_combo = ttk.Combobox(frame, textvariable=self.frequency_var, width=27)
        frequency_combo['values'] = ("one-time", "daily", "weekly", "bi-weekly", "monthly", "yearly")
        frequency_combo.grid(row=5, column=1, pady=5, padx=(10, 0))
        frequency_combo.state(['readonly'])
        
        ttk.Label(frame, text="Start Date:").grid(row=6, column=0, sticky=tk.W, pady=5)
        self.date_var = tk.StringVar(value=self.transaction.start_date.strftime("%Y-%m-%d"))
        ttk.Entry(frame, textvariable=self.date_var, width=30).grid(row=6, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="End Date (optional):").grid(row=7, column=0, sticky=tk.W, pady=5)
        end_date_value = self.transaction.end_date.strftime("%Y-%m-%d") if self.transaction.end_date else ""
        self.end_date_var = tk.StringVar(value=end_date_value)
        ttk.Entry(frame, textvariable=self.end_date_var, width=30).grid(row=7, column=1, pady=5, padx=(10, 0))
        
        button_frame = ttk.Frame(frame)
        button_frame.grid(row=8, column=0, columnspan=2, pady=20)
        
        ttk.Button(button_frame, text="Save Changes", command=self.save_transaction).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=self.dialog.destroy).pack(side=tk.LEFT)
    
    def save_transaction(self):
        try:
            name = self.name_var.get().strip()
            if not name:
                messagebox.showerror("Error", "Please enter a transaction name.")
                return
            
            amount = float(self.amount_var.get())
            if amount <= 0:
                messagebox.showerror("Error", "Amount must be greater than 0.")
                return
            
            start_date = datetime.strptime(self.date_var.get(), "%Y-%m-%d").date()
            
            end_date = None
            if self.end_date_var.get().strip():
                end_date = datetime.strptime(self.end_date_var.get(), "%Y-%m-%d").date()
                if end_date <= start_date:
                    messagebox.showerror("Error", "End date must be after start date.")
                    return
            
            self.result = {
                'name': name,
                'amount': amount,
                'type': self.type_var.get(),
                'frequency': self.frequency_var.get(),
                'start_date': start_date,
                'category': self.category_var.get(),
                'end_date': end_date
            }
            
            self.dialog.destroy()
            
        except ValueError:
            messagebox.showerror("Error", "Please check your input values.")

class TransactionDialog:
    def __init__(self, parent, title, preferences, theme_manager):
        self.result = None
        self.preferences = preferences
        self.theme_manager = theme_manager
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("450x400")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Apply theme to dialog
        theme = self.theme_manager.get_theme()
        self.dialog.configure(bg=theme['dialog_bg'])
        
        self.setup_dialog()
        
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")
        
        self.dialog.wait_window()
    
    def setup_dialog(self):
        frame = ttk.Frame(self.dialog, padding="20")
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="Transaction Name:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.name_var = tk.StringVar()
        ttk.Entry(frame, textvariable=self.name_var, width=30).grid(row=0, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Amount:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.amount_var = tk.StringVar()
        ttk.Entry(frame, textvariable=self.amount_var, width=30).grid(row=1, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="Type:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.type_var = tk.StringVar(value="expense")
        type_frame = ttk.Frame(frame)
        type_frame.grid(row=2, column=1, sticky=tk.W, padx=(10, 0), pady=5)
        ttk.Radiobutton(type_frame, text="Income", variable=self.type_var, value="income").pack(side=tk.LEFT)
        ttk.Radiobutton(type_frame, text="Expense", variable=self.type_var, value="expense").pack(side=tk.LEFT, padx=(20, 0))
        
        ttk.Label(frame, text="Category:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.category_var = tk.StringVar(value="other")
        category_combo = ttk.Combobox(frame, textvariable=self.category_var, width=27)
        categories = list(self.preferences.get('colors', {}).keys())
        categories = [c for c in categories if not c.endswith('_day')]
        category_combo['values'] = categories
        category_combo.grid(row=3, column=1, pady=5, padx=(10, 0))
        category_combo.state(['readonly'])
        
        ttk.Label(frame, text="Frequency:").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.frequency_var = tk.StringVar(value="monthly")
        frequency_combo = ttk.Combobox(frame, textvariable=self.frequency_var, width=27)
        frequency_combo['values'] = ("one-time", "daily", "weekly", "bi-weekly", "monthly", "yearly")
        frequency_combo.grid(row=4, column=1, pady=5, padx=(10, 0))
        frequency_combo.state(['readonly'])
        
        ttk.Label(frame, text="Start Date:").grid(row=5, column=0, sticky=tk.W, pady=5)
        self.date_var = tk.StringVar(value=datetime.now().strftime("%Y-%m-%d"))
        ttk.Entry(frame, textvariable=self.date_var, width=30).grid(row=5, column=1, pady=5, padx=(10, 0))
        
        ttk.Label(frame, text="End Date (optional):").grid(row=6, column=0, sticky=tk.W, pady=5)
        self.end_date_var = tk.StringVar()
        ttk.Entry(frame, textvariable=self.end_date_var, width=30).grid(row=6, column=1, pady=5, padx=(10, 0))
        
        button_frame = ttk.Frame(frame)
        button_frame.grid(row=7, column=0, columnspan=2, pady=20)
        
        ttk.Button(button_frame, text="Save", command=self.save_transaction).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=self.dialog.destroy).pack(side=tk.LEFT)
    
    def save_transaction(self):
        try:
            name = self.name_var.get().strip()
            if not name:
                messagebox.showerror("Error", "Please enter a transaction name.")
                return
            
            amount = float(self.amount_var.get())
            if amount <= 0:
                messagebox.showerror("Error", "Amount must be greater than 0.")
                return
            
            start_date = datetime.strptime(self.date_var.get(), "%Y-%m-%d").date()
            
            end_date = None
            if self.end_date_var.get().strip():
                end_date = datetime.strptime(self.end_date_var.get(), "%Y-%m-%d").date()
                if end_date <= start_date:
                    messagebox.showerror("Error", "End date must be after start date.")
                    return
            
            self.result = {
                'name': name,
                'amount': amount,
                'type': self.type_var.get(),
                'frequency': self.frequency_var.get(),
                'start_date': start_date,
                'category': self.category_var.get(),
                'end_date': end_date
            }
            
            self.dialog.destroy()
            
        except ValueError:
            messagebox.showerror("Error", "Please check your input values.")

class MonthlyAnalyzerWindow:
    def __init__(self, parent, calculator, preferences, theme_manager, main_app=None):
        self.calculator = calculator
        self.preferences = preferences
        self.theme_manager = theme_manager
        self.main_app = main_app  # Reference to main app for accessing current balance
        self.parent = parent
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title("Monthly Financial Analyzer")
        self.dialog.geometry("1000x700")
        self.dialog.minsize(900, 600)  # Set minimum size
        self.dialog.transient(parent)
        
        # Apply theme to dialog
        theme = self.theme_manager.get_theme()
        self.dialog.configure(bg=theme['dialog_bg'])
        
        self.current_month = datetime.now().month
        self.current_year = datetime.now().year
        
        self.setup_window()

        # Wait for widgets to size themselves before drawing charts
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")

        # Draw charts after the window is displayed and keep them centered on resize
        self.dialog.after(100, self.update_analysis)
        self.resize_job = None
        self.last_size = (self.dialog.winfo_width(), self.dialog.winfo_height())
        self.dialog.bind("<Configure>", self.on_resize)

    def on_resize(self, event):
        # Only handle resize events from the toplevel window itself
        if event.widget is not self.dialog:
            return

        new_size = (event.width, event.height)
        if new_size == self.last_size:
            return
        self.last_size = new_size

        if self.resize_job:
            self.dialog.after_cancel(self.resize_job)
        # Debounce resize events to avoid excessive redraws
        self.resize_job = self.dialog.after(200, self.update_analysis)
    
    def setup_window(self):
        main_frame = ttk.Frame(self.dialog, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Header with month navigation
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Button(header_frame, text="◀ Prev Month", command=self.previous_month).pack(side=tk.LEFT)
        
        self.month_label = ttk.Label(header_frame, font=("Arial", 16, "bold"))
        self.month_label.pack(side=tk.LEFT, expand=True)
        
        ttk.Button(header_frame, text="Next Month ▶", command=self.next_month).pack(side=tk.RIGHT)
        ttk.Button(header_frame, text="Current Month", command=self.goto_current_month).pack(side=tk.RIGHT, padx=(0, 10))
        
        # Create notebook for different views
        notebook = ttk.Notebook(main_frame)
        notebook.pack(fill=tk.BOTH, expand=True)
        
        # Expense breakdown tab
        self.expense_frame = ttk.Frame(notebook, padding="10")
        notebook.add(self.expense_frame, text="Expense Breakdown")
        
        # Income vs Expenses tab
        self.overview_frame = ttk.Frame(notebook, padding="10")
        notebook.add(self.overview_frame, text="Income vs Expenses")
        
        # Future Projections tab
        self.projections_frame = ttk.Frame(notebook, padding="10")
        notebook.add(self.projections_frame, text="Future Projections")
        
        # 5-Year Outlook tab
        self.outlook_frame = ttk.Frame(notebook, padding="10")
        notebook.add(self.outlook_frame, text="5-Year Outlook")
        
        # Summary tab
        self.summary_frame = ttk.Frame(notebook, padding="10")
        notebook.add(self.summary_frame, text="Summary")
    
    def previous_month(self):
        if self.current_month == 1:
            self.current_month = 12
            self.current_year -= 1
        else:
            self.current_month -= 1
        self.update_analysis()
    
    def next_month(self):
        if self.current_month == 12:
            self.current_month = 1
            self.current_year += 1
        else:
            self.current_month += 1
        self.update_analysis()
    
    def goto_current_month(self):
        now = datetime.now()
        self.current_month = now.month
        self.current_year = now.year
        self.update_analysis()
    
    def update_analysis(self):
        month_name = calendar.month_name[self.current_month]
        self.month_label.config(text=f"{month_name} {self.current_year} Analysis")
        
        # Clear existing content
        for widget in self.expense_frame.winfo_children():
            widget.destroy()
        for widget in self.overview_frame.winfo_children():
            widget.destroy()
        for widget in self.projections_frame.winfo_children():
            widget.destroy()
        for widget in self.outlook_frame.winfo_children():
            widget.destroy()
        for widget in self.summary_frame.winfo_children():
            widget.destroy()
        
        # Get data for the month
        category_data = self.get_monthly_category_breakdown()
        income, expenses = self.calculate_monthly_totals()
        
        # Create expense breakdown charts (both bar and pie)
        self.create_expense_charts(category_data)
        
        # Create income vs expenses chart
        self.create_overview_chart(income, expenses)
        
        # Create future projections
        self.create_projections_chart()
        
        # Create 5-year outlook
        self.create_5year_outlook()
        
        # Create summary
        self.create_summary(category_data, income, expenses)
    
    def get_monthly_category_breakdown(self):
        """Get expense breakdown by category for the current month"""
        first_day = date(self.current_year, self.current_month, 1)
        last_day = date(self.current_year, self.current_month, calendar.monthrange(self.current_year, self.current_month)[1])
        
        category_totals = {}
        
        current_date = first_day
        while current_date <= last_day:
            transactions = self.calculator.get_transactions_for_date(current_date)
            for trans in transactions:
                if trans.transaction_type == "expense":
                    category = trans.category
                    if category not in category_totals:
                        category_totals[category] = 0
                    category_totals[category] += trans.amount
            current_date += timedelta(days=1)
        
        return category_totals
    
    def calculate_monthly_totals(self):
        """Calculate total income and expenses for the month"""
        first_day = date(self.current_year, self.current_month, 1)
        last_day = date(self.current_year, self.current_month, calendar.monthrange(self.current_year, self.current_month)[1])
        
        total_income = 0
        total_expenses = 0
        
        current_date = first_day
        while current_date <= last_day:
            transactions = self.calculator.get_transactions_for_date(current_date)
            for trans in transactions:
                if trans.transaction_type == "income":
                    total_income += trans.amount
                else:
                    total_expenses += trans.amount
            current_date += timedelta(days=1)
        
        return total_income, total_expenses
    
    def create_expense_charts(self, category_data):
        """Create both bar chart and pie chart for expense categories"""
        if not category_data:
            ttk.Label(self.expense_frame, text="No expense data for this month", 
                     font=("Arial", 12)).pack(expand=True)
            return
        
        # Create tabs for different chart types
        chart_notebook = ttk.Notebook(self.expense_frame)
        chart_notebook.pack(fill=tk.BOTH, expand=True)
        
        # Bar chart tab
        bar_frame = ttk.Frame(chart_notebook)
        chart_notebook.add(bar_frame, text="Bar Chart")
        self.create_bar_chart(bar_frame, category_data)
        
        # Pie chart tab
        pie_frame = ttk.Frame(chart_notebook)
        chart_notebook.add(pie_frame, text="Pie Chart")
        self.create_pie_chart(pie_frame, category_data)
    
    def create_bar_chart(self, parent, category_data):
        """Create an enhanced bar chart for expense categories"""
        # Create canvas for chart and make sure dimensions are available
        canvas = tk.Canvas(parent, height=450, bg='white')
        canvas.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        canvas.update_idletasks()

        # Sort categories by amount
        sorted_categories = sorted(category_data.items(), key=lambda x: x[1], reverse=True)
        
        if not sorted_categories:
            return
        
        # Chart dimensions
        canvas_width = canvas.winfo_width() or 800
        chart_width = canvas_width - 100
        chart_height = 350
        margin_left = 80
        margin_bottom = 80
        
        max_amount = max(category_data.values())
        bar_width = min(60, (chart_width - margin_left) // len(sorted_categories))
        bar_spacing = 10
        total_bar_width = len(sorted_categories) * (bar_width + bar_spacing) - bar_spacing
        start_x = margin_left + max(0, (chart_width - margin_left - total_bar_width) // 2)
        
        colors = self.preferences.get('colors', {})
        
        # Draw grid lines
        for i in range(6):  # 5 horizontal grid lines
            y = chart_height - (i * chart_height // 5)
            canvas.create_line(margin_left, y, chart_width, y, fill='#E0E0E0', width=1)
            amount_label = (max_amount * i // 5) if max_amount > 0 else 0
            canvas.create_text(margin_left - 10, y, text=f"${amount_label:.0f}", 
                             font=("Arial", 8), anchor="e")
        
        # Draw bars with enhanced styling
        for i, (category, amount) in enumerate(sorted_categories):
            x = start_x + i * (bar_width + bar_spacing)
            bar_height = (amount / max_amount) * (chart_height - margin_bottom) if max_amount > 0 else 0
            y = chart_height - margin_bottom - bar_height
            
            # Get color for category
            color = colors.get(category, '#757575')
            
            # Create gradient effect by drawing multiple rectangles
            for j in range(int(bar_height)):
                shade = max(0, min(255, int(255 - (j * 0.3))))
                gradient_color = f"#{shade:02x}{shade:02x}{shade:02x}"
                if j % 2 == 0:  # Only draw every other line for performance
                    canvas.create_line(x, y + j, x + bar_width, y + j, fill=color, width=2)
            
            # Draw bar outline
            canvas.create_rectangle(x, y, x + bar_width, chart_height - margin_bottom, 
                                  fill=color, outline='black', width=2)
            
            # Draw amount label on top of bar
            canvas.create_text(x + bar_width/2, y - 15, text=f"${amount:.0f}", 
                             font=("Arial", 9, "bold"), anchor="s")
            
            # Draw category label at bottom (rotated)
            canvas.create_text(x + bar_width/2, chart_height - margin_bottom + 20, 
                             text=category.title()[:10], font=("Arial", 9), anchor="n")
        
        # Draw title
        canvas.create_text(chart_width/2, 20, text="Monthly Expenses by Category", 
                         font=("Arial", 16, "bold"), anchor="n")
        
        # Draw axes
        canvas.create_line(margin_left, chart_height - margin_bottom, chart_width, 
                         chart_height - margin_bottom, fill='black', width=2)  # X-axis
        canvas.create_line(margin_left, 0, margin_left, chart_height - margin_bottom, 
                         fill='black', width=2)  # Y-axis
    
    def create_pie_chart(self, parent, category_data):
        """Create a pie chart for expense categories"""
        canvas = tk.Canvas(parent, height=450, bg='white')
        canvas.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        if not category_data:
            return
        
        # Chart dimensions based on canvas size
        canvas.update_idletasks()
        canvas_width = canvas.winfo_width() or 500
        canvas_height = canvas.winfo_height() or 450
        center_x, center_y = canvas_width / 2, canvas_height / 2
        radius = min(center_x, center_y) - 150
        radius = max(80, radius)
        
        total_amount = sum(category_data.values())
        colors = self.preferences.get('colors', {})
        
        # Calculate angles for each slice
        start_angle = 0
        legend_y = 50
        legend_x = center_x + radius + 30
        
        sorted_categories = sorted(category_data.items(), key=lambda x: x[1], reverse=True)
        
        for i, (category, amount) in enumerate(sorted_categories):
            # Calculate slice angle
            slice_angle = (amount / total_amount) * 360 if total_amount > 0 else 0
            
            # Get color for category
            color = colors.get(category, '#757575')
            
            # Draw pie slice
            canvas.create_arc(center_x - radius, center_y - radius, 
                            center_x + radius, center_y + radius,
                            start=start_angle, extent=slice_angle,
                            fill=color, outline='black', width=2)
            
            # Calculate label position (middle of slice)
            label_angle = math.radians(start_angle + slice_angle/2)
            label_x = center_x + (radius * 0.7) * math.cos(label_angle)
            label_y = center_y + (radius * 0.7) * math.sin(label_angle)
            
            # Draw percentage label on slice
            percentage = (amount / total_amount) * 100 if total_amount > 0 else 0
            if percentage > 5:  # Only show label if slice is large enough
                canvas.create_text(label_x, label_y, text=f"{percentage:.1f}%", 
                                 font=("Arial", 9, "bold"), fill="white")
            
            # Draw legend
            adj_legend_x = min(legend_x, canvas_width - 160)
            canvas.create_rectangle(adj_legend_x, legend_y + i * 25, adj_legend_x + 15,
                                  legend_y + i * 25 + 15, fill=color, outline='black')
            canvas.create_text(adj_legend_x + 25, legend_y + i * 25 + 7,
                              text=f"{category.title()}: ${amount:.0f} ({percentage:.1f}%)",
                              font=("Arial", 10), anchor="w")
            
            start_angle += slice_angle
        
        # Draw title
        canvas.create_text(center_x, 30, text="Expense Distribution", 
                         font=("Arial", 16, "bold"), anchor="n")
        
        # Draw total in center
        canvas.create_text(center_x, center_y, text=f"Total\n${total_amount:.0f}", 
                         font=("Arial", 12, "bold"), anchor="center")
    
    def create_projections_chart(self):
        """Create future balance projections for next 12 months"""
        canvas = tk.Canvas(self.projections_frame, height=450, bg='white')
        canvas.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        canvas.update_idletasks()
        
        # Get current balance from main app
        current_balance = 0
        if self.main_app and hasattr(self.main_app, 'current_balance'):
            current_balance = self.main_app.current_balance
        
        # Calculate monthly net change
        income, expenses = self.calculate_monthly_totals()
        monthly_net = income - expenses
        
        # Generate 12-month projection
        projections = []
        balance = current_balance
        current_date = date(self.current_year, self.current_month, 1)
        
        for i in range(13):  # Include current month + 12 future months
            projections.append((current_date, balance))
            if i < 12:  # Don't add to the last month
                balance += monthly_net
                # Move to next month
                if current_date.month == 12:
                    current_date = date(current_date.year + 1, 1, 1)
                else:
                    current_date = date(current_date.year, current_date.month + 1, 1)
        
        # Chart dimensions
        chart_width = canvas.winfo_width() or 700
        chart_height = canvas.winfo_height() or 350
        margin = 80
        
        if len(projections) < 2:
            canvas.create_text(chart_width/2, chart_height/2, 
                             text="No projection data available", 
                             font=("Arial", 14), anchor="center")
            return
        
        min_balance = min(proj[1] for proj in projections)
        max_balance = max(proj[1] for proj in projections)
        balance_range = max_balance - min_balance if max_balance != min_balance else 1000
        
        # Ensure minimum range for visibility
        if balance_range < 1000:
            balance_range = 1000
            center = (max_balance + min_balance) / 2
            max_balance = center + 500
            min_balance = center - 500
        
        # Draw grid lines
        for i in range(6):
            y = margin + (i * (chart_height - margin) // 5)
            canvas.create_line(margin, y, chart_width - margin, y, fill='#E0E0E0', width=1)
            balance_label = max_balance - (i * balance_range // 5)
            canvas.create_text(margin - 10, y, text=f"${balance_label:,.0f}", 
                             font=("Arial", 8), anchor="e")
        
        # Draw projection line
        points = []
        for i, (proj_date, balance) in enumerate(projections):
            x = margin + (i * (chart_width - 2 * margin) // (len(projections) - 1))
            y = margin + ((max_balance - balance) / balance_range) * (chart_height - margin)
            points.extend([x, y])
            
            # Draw point
            color = 'green' if balance >= current_balance else 'red'
            canvas.create_oval(x - 4, y - 4, x + 4, y + 4, fill=color, outline='black')
            
            # Draw month label
            if i % 2 == 0:  # Show every other month to avoid crowding
                canvas.create_text(x, chart_height - margin + 20, 
                                 text=proj_date.strftime("%b\n%Y"), 
                                 font=("Arial", 8), anchor="n")
        
        # Draw the line
        if len(points) >= 4:
            canvas.create_line(points, fill='blue', width=3, smooth=True)
        
        # Draw zero line if applicable
        if min_balance < 0:
            zero_y = margin + ((max_balance - 0) / balance_range) * (chart_height - margin)
            canvas.create_line(margin, zero_y, chart_width - margin, zero_y, 
                             fill='red', width=2, dash=(5, 5))
            canvas.create_text(chart_width - margin + 10, zero_y, text="$0", 
                             font=("Arial", 8), anchor="w")
        
        # Draw title
        canvas.create_text(chart_width/2, 20, text="12-Month Balance Projection", 
                         font=("Arial", 16, "bold"), anchor="n")
        
        # Add projection info
        final_balance = projections[-1][1]
        change = final_balance - current_balance
        change_color = 'green' if change >= 0 else 'red'
        
        canvas.create_text(chart_width/2, 50, 
                         text=f"Projected 12-month change: ${change:+,.0f}", 
                         font=("Arial", 12, "bold"), fill=change_color, anchor="n")
        
        # Add monthly net info
        net_color = 'green' if monthly_net >= 0 else 'red'
        canvas.create_text(chart_width/2, 70, 
                         text=f"Monthly net: ${monthly_net:+,.0f}", 
                         font=("Arial", 11), fill=net_color, anchor="n")
    
    def create_5year_outlook(self):
        """Create 5-year financial outlook line graph"""
        canvas = tk.Canvas(self.outlook_frame, height=450, bg='white')
        canvas.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        canvas.update_idletasks()
        
        # Get current balance from main app
        current_balance = 0
        if self.main_app and hasattr(self.main_app, 'current_balance'):
            current_balance = self.main_app.current_balance
        
        # Calculate monthly net change
        income, expenses = self.calculate_monthly_totals()
        monthly_net = income - expenses
        
        # Generate 5-year projection (60 months)
        projections = []
        balance = current_balance
        current_date = date(self.current_year, self.current_month, 1)
        
        for i in range(61):  # 60 months + current
            projections.append((current_date, balance))
            if i < 60:
                balance += monthly_net
                # Move to next month
                if current_date.month == 12:
                    current_date = date(current_date.year + 1, 1, 1)
                else:
                    current_date = date(current_date.year, current_date.month + 1, 1)
        
        # Chart dimensions
        chart_width = canvas.winfo_width() or 800
        chart_height = canvas.winfo_height() or 350
        margin = 80
        
        if len(projections) < 2:
            canvas.create_text(chart_width/2, chart_height/2, 
                             text="No projection data available", 
                             font=("Arial", 14), anchor="center")
            return
        
        min_balance = min(proj[1] for proj in projections)
        max_balance = max(proj[1] for proj in projections)
        balance_range = max_balance - min_balance if max_balance != min_balance else 10000
        
        # Ensure minimum range for visibility
        if balance_range < 10000:
            balance_range = 10000
            center = (max_balance + min_balance) / 2
            max_balance = center + 5000
            min_balance = center - 5000
        
        # Draw grid lines (horizontal)
        for i in range(6):
            y = margin + (i * (chart_height - margin) // 5)
            canvas.create_line(margin, y, chart_width - margin, y, fill='#E0E0E0', width=1)
            balance_label = max_balance - (i * balance_range // 5)
            canvas.create_text(margin - 10, y, text=f"${balance_label:,.0f}", 
                             font=("Arial", 8), anchor="e")
        
        # Draw vertical grid lines (yearly)
        for year in range(6):
            x = margin + (year * (chart_width - 2 * margin) // 5)
            canvas.create_line(x, margin, x, chart_height - margin, fill='#E0E0E0', width=1)
            year_label = self.current_year + year
            canvas.create_text(x, chart_height - margin + 10, text=str(year_label), 
                             font=("Arial", 9), anchor="n")
        
        # Draw projection line
        points = []
        for i, (proj_date, balance) in enumerate(projections):
            x = margin + (i * (chart_width - 2 * margin) // (len(projections) - 1))
            y = margin + ((max_balance - balance) / balance_range) * (chart_height - margin)
            points.extend([x, y])
            
            # Draw yearly markers
            if proj_date.month == 1 and proj_date.day == 1:
                canvas.create_oval(x - 3, y - 3, x + 3, y + 3, fill='blue', outline='black')
        
        # Draw the line
        if len(points) >= 4:
            canvas.create_line(points, fill='navy', width=3, smooth=True)
        
        # Draw zero line if applicable
        if min_balance < 0:
            zero_y = margin + ((max_balance - 0) / balance_range) * (chart_height - margin)
            canvas.create_line(margin, zero_y, chart_width - margin, zero_y, 
                             fill='red', width=2, dash=(10, 5))
            canvas.create_text(chart_width - margin + 10, zero_y, text="Break Even", 
                             font=("Arial", 8), anchor="w")
        
        # Draw title
        canvas.create_text(chart_width/2, 20, text="5-Year Financial Outlook", 
                         font=("Arial", 16, "bold"), anchor="n")
        
        # Add key statistics
        final_balance = projections[-1][1]
        total_change = final_balance - current_balance
        change_color = 'green' if total_change >= 0 else 'red'
        
        canvas.create_text(chart_width/2, 50, 
                         text=f"5-Year Projected Change: ${total_change:+,.0f}", 
                         font=("Arial", 12, "bold"), fill=change_color, anchor="n")
        
        # Annual savings rate
        annual_savings = monthly_net * 12
        annual_color = 'green' if annual_savings >= 0 else 'red'
        canvas.create_text(chart_width/2, 70, 
                         text=f"Annual Net Change: ${annual_savings:+,.0f}", 
                         font=("Arial", 11), fill=annual_color, anchor="n")
        
        # Break-even analysis
        if monthly_net < 0:
            months_to_zero = abs(current_balance / monthly_net) if monthly_net != 0 else 0
            if months_to_zero <= 60:
                canvas.create_text(chart_width/2, 90, 
                                 text=f"⚠️ Funds depleted in {months_to_zero:.1f} months", 
                                 font=("Arial", 10, "bold"), fill='red', anchor="n")
    
    def create_overview_chart(self, income, expenses):
        """Create income vs expenses comparison chart"""
        canvas = tk.Canvas(self.overview_frame, height=400, bg='white')
        canvas.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        canvas.update_idletasks()
        
        # Chart dimensions
        chart_width = canvas.winfo_width() or 600
        chart_height = canvas.winfo_height() or 350
        margin = 100
        
        max_amount = max(income, expenses, 1)  # Avoid division by zero
        bar_width = 80
        spacing = 80
        income_x = chart_width/2 - bar_width - spacing/2
        expense_x = chart_width/2 + spacing/2
        
        # Income bar
        income_height = (income / max_amount) * (chart_height - margin) if max_amount > 0 else 0
        income_y = chart_height - income_height
        canvas.create_rectangle(income_x, income_y, income_x + bar_width, chart_height,
                              fill='#4CAF50', outline='black', width=2)
        canvas.create_text(income_x + bar_width/2, income_y - 10, text=f"${income:,.0f}",
                         font=("Arial", 12, "bold"), anchor="s")
        canvas.create_text(income_x + bar_width/2, chart_height + 20, text="Income",
                         font=("Arial", 12, "bold"), anchor="n")
        
        # Expenses bar
        expense_height = (expenses / max_amount) * (chart_height - margin) if max_amount > 0 else 0
        expense_y = chart_height - expense_height
        canvas.create_rectangle(expense_x, expense_y, expense_x + bar_width, chart_height,
                              fill='#F44336', outline='black', width=2)
        canvas.create_text(expense_x + bar_width/2, expense_y - 10, text=f"${expenses:,.0f}",
                         font=("Arial", 12, "bold"), anchor="s")
        canvas.create_text(expense_x + bar_width/2, chart_height + 20, text="Expenses",
                         font=("Arial", 12, "bold"), anchor="n")
        
        # Net amount
        net = income - expenses
        net_color = "green" if net >= 0 else "red"
        canvas.create_text(chart_width/2, 50, text=f"Net: ${net:,.2f}", 
                         font=("Arial", 16, "bold"), fill=net_color, anchor="n")
        
        # Title
        canvas.create_text(chart_width/2, 20, text="Income vs Expenses", 
                         font=("Arial", 14, "bold"), anchor="n")
    
    def create_summary(self, category_data, income, expenses):
        """Create summary statistics"""
        # Summary statistics
        ttk.Label(self.summary_frame, text="Monthly Financial Summary", 
                 font=("Arial", 16, "bold")).pack(pady=(0, 20))
        
        stats_frame = ttk.LabelFrame(self.summary_frame, text="Key Statistics", padding="15")
        stats_frame.pack(fill=tk.X, padx=20, pady=10)
        
        net = income - expenses
        
        stats = [
            ("Total Income", f"${income:,.2f}", "green"),
            ("Total Expenses", f"${expenses:,.2f}", "red"),
            ("Net Income", f"${net:,.2f}", "green" if net >= 0 else "red"),
            ("Number of Expense Categories", str(len(category_data)), "blue"),
            ("Average per Category", f"${(expenses / len(category_data) if category_data else 0):,.2f}", "blue"),
            ("Largest Expense Category", 
             f"{max(category_data.keys(), key=category_data.get).title() if category_data else 'None'}: ${max(category_data.values()) if category_data else 0:.2f}", 
             "orange")
        ]
        
        for i, (label, value, color) in enumerate(stats):
            ttk.Label(stats_frame, text=f"{label}:", font=("Arial", 10, "bold")).grid(row=i, column=0, sticky=tk.W, pady=5)
            ttk.Label(stats_frame, text=value, font=("Arial", 10), foreground=color).grid(row=i, column=1, sticky=tk.W, padx=(20, 0), pady=5)
        
        # Category breakdown list
        if category_data:
            category_frame = ttk.LabelFrame(self.summary_frame, text="Detailed Breakdown", padding="15")
            category_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
            
            # Create treeview for categories
            columns = ("Category", "Amount", "Percentage")
            tree = ttk.Treeview(category_frame, columns=columns, show="headings", height=10)
            
            for col in columns:
                tree.heading(col, text=col)
                tree.column(col, width=150)
            
            scrollbar = ttk.Scrollbar(category_frame, orient=tk.VERTICAL, command=tree.yview)
            tree.configure(yscrollcommand=scrollbar.set)
            
            tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
            scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
            
            # Add category data
            sorted_categories = sorted(category_data.items(), key=lambda x: x[1], reverse=True)
            for category, amount in sorted_categories:
                percentage = (amount / expenses * 100) if expenses > 0 else 0
                tree.insert("", "end", values=(
                    category.title(),
                    f"${amount:,.2f}",
                    f"{percentage:.1f}%"
                ))

def main():
    try:
        from dateutil.relativedelta import relativedelta
    except ImportError:
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror(
            "Missing Dependency", 
            "This application requires the 'python-dateutil' package.\n\n"
            "Please install it using:\npip install python-dateutil"
        )
        return
    
    root = tk.Tk()
    app = BudgieApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
