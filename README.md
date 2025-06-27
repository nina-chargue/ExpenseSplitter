# 💸 Expense Splitter App

A Django web application that allows users to create events (like trips, parties, or group activities) and track shared expenses among participants. The app calculates individual balances and suggests the minimal set of payments required to settle debts.

---

## 🚀 Features

- User authentication (register, login, logout)
- Create events for trips, parties, or activities
- Add participants (can be registered users or non-users)
- Log shared expenses with:
  - Description
  - Amount
  - Paid by (a participant)
  - Split among (select participants)
- Automatic calculation of:
  - How much each person owes or is owed
  - Simplified payments to settle debts efficiently
- Event summaries with expenses, balances, and payment suggestions
- Clean, user-friendly interface with Bootstrap/Tailwind

---

## 📜 Project Details

This app solves the real-world problem of splitting expenses among groups. Includes financial logic, dynamic participant handling, and a **debt simplification algorithm** that minimizes total payments between participants.

Key complexities:
- Dynamic balance calculation based on shared expenses.
- Debt simplification to reduce transactions.
- Many-to-many relationships (`Expense.shared_among`) and flexible handling of participants (not tied to user accounts).
- Real-time calculations with no redundant stored financial data.

This combines Django’s strengths with applied algorithmic problem-solving and dynamic relational data management.

---

## 🏃 How to Run This Application

### 🔧 Prerequisites
- Python 3.9 or higher
- pip (Python package installer)
- Virtual environment recommended

### 📥 Installation Steps

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/expense-splitter.git
cd expense-splitter
```
3. **Create and activate a virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```
4. **Install dependencies:**
```bash
pip install -r requirements.txt
```
5. **Apply migrations:**
```bash
python manage.py migrate
```
6. **Run the development server:**
```bash
python manage.py runserver
```
7. **Access the app:**
Visit http://127.0.0.1:8000/ in your browser.


