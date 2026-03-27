# Vehicle Rental Management Platform

A premium full-stack platform for luxury vehicle rentals.

## 🏗️ Architecture
- **Backend**: Flask + SQLAlchemy (SQLite)
- **Frontend**: Vite + React
- **Design System**: Dark Luxury (Pure CSS)

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python seed.py  # Initialize & Seed Database
python main.py  # Run API (Port 5000)
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --port 5175     # Run UI (Port 5175)
```

## 🛡️ Role Switching (Demo Mode)
To test different features without logging in, use the **Role Switcher** in the top-right corner of the Navbar:
- **Customer**: Browse, Book, Track Rentals
- **Admin**: Revenue Stats, Fleet CRUD, Registering Vehicles
- **Fleet Manager**: Operational Board, Availability Toggling

## 📄 API Documentation
- `GET /api/vehicles`: Browse all vehicles
- `POST /api/bookings/calculate`: Live price breakdown
- `POST /api/auth/login`: Identity management
