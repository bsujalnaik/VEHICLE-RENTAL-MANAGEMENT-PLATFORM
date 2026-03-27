# Vehicle Rental Management Platform (Flask + React)

## 1) Setup backend

```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 2) Create + seed database

```bash
cd ..\DB
python createdb.py
```

## 3) Run backend API

```bash
cd ..\Backend
python backend.py
```

Backend runs at `http://127.0.0.1:5050`.

## 4) Run frontend

```bash
cd ..\Frontend
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173`.

---

## Test credentials

- Admin: `admin@rental.com` / `admin123`
- Fleet Manager: `fleet1@rental.com` / `fleet123`
- Customer: `customer1@rental.com` / `cust123`

---

## Supported flows

- Login for all 3 roles.
- Customer can browse vehicles, estimate amount, and create booking.
- Booking shows payable amount only (no payment gateway).
- Fleet manager can update rental status and payment status (`pending` / `paid` / `refunded`).
- Admin can view all users and bookings.
