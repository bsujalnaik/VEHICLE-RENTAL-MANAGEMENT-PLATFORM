from __future__ import annotations

import os
import re
import sqlite3
from datetime import datetime
from functools import wraps
from uuid import uuid4

from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "DB", "vehicle_rental.db"))

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ALLOWED_VEHICLE_TYPES = {"car", "bike", "van"}
ALLOWED_FUEL_TYPES = {"petrol", "diesel", "electric", "cng"}
ALLOWED_AVAILABILITY = {"available", "rented", "maintenance"}
ALLOWED_PAYMENT = {"pending", "paid", "refunded"}
ALLOWED_RENTAL = {"booked", "picked_up", "returned", "cancelled"}
ALLOWED_MAINTENANCE = {"routine", "repair", "inspection", "cleaning"}
ALLOWED_PAYMENT_MODE = {"cash", "card", "upi"}

app = Flask(__name__)
CORS(app)

SESSIONS: dict[str, dict] = {}


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def parse_dt(value: str) -> datetime:
    for fmt in ("%Y-%m-%dT%H:%M", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    raise ValueError("Invalid datetime format. Use YYYY-MM-DDTHH:MM")


def auth_required(roles: list[str] | None = None):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing auth token"}), 401
            token = auth_header.split(" ", 1)[1]
            user = SESSIONS.get(token)
            if not user:
                return jsonify({"error": "Invalid or expired token"}), 401
            if roles and user["role"] not in roles:
                return jsonify({"error": "Forbidden"}), 403
            request.current_user = user
            request.current_token = token
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def valid_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email or ""))


def sanitize_user(row: sqlite3.Row) -> dict:
    result = dict(row)
    result.pop("password_hash", None)
    return result


def refresh_session_user(user_id: int) -> None:
    conn = get_db()
    row = conn.execute(
        "SELECT user_id, name, email, role, is_active, driving_license_number, assigned_zone FROM users WHERE user_id = ?",
        (user_id,),
    ).fetchone()
    conn.close()
    if not row:
        return
    safe_user = dict(row)
    for token, session_user in list(SESSIONS.items()):
        if session_user["user_id"] == user_id:
            SESSIONS[token] = safe_user


def is_vehicle_available(conn: sqlite3.Connection, vehicle_id: int, start_dt: datetime, end_dt: datetime, ignore_rental_id: int | None = None) -> tuple[bool, list[dict]]:
    query = """
    SELECT rental_id, start_datetime, end_datetime, rental_status
    FROM rental_records
    WHERE vehicle_id = ?
      AND rental_status IN ('booked', 'picked_up')
      AND NOT (end_datetime <= ? OR start_datetime >= ?)
    """
    params = [vehicle_id, start_dt.isoformat(), end_dt.isoformat()]
    if ignore_rental_id:
        query += " AND rental_id != ?"
        params.append(ignore_rental_id)
    conflicts = [dict(r) for r in conn.execute(query, params).fetchall()]
    return len(conflicts) == 0, conflicts


def _fetch_active_rule(rule_type: str, when: datetime) -> dict | None:
    conn = get_db()
    row = conn.execute(
        """
        SELECT * FROM pricing_rules
        WHERE rule_type = ?
          AND is_active = 1
          AND (valid_from IS NULL OR valid_from <= date(?))
          AND (valid_to IS NULL OR valid_to >= date(?))
        ORDER BY rule_id DESC
        LIMIT 1
        """,
        (rule_type, when.isoformat(), when.isoformat()),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def _fetch_coupon(code: str, when: datetime) -> dict | None:
    conn = get_db()
    row = conn.execute(
        """
        SELECT * FROM pricing_rules
        WHERE rule_type = 'coupon'
          AND discount_code = ?
          AND is_active = 1
          AND (valid_from IS NULL OR valid_from <= date(?))
          AND (valid_to IS NULL OR valid_to >= date(?))
        LIMIT 1
        """,
        (code, when.isoformat(), when.isoformat()),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def calculate_price(vehicle: dict, start_dt: datetime, end_dt: datetime, coupon_code: str | None = None) -> tuple[float, dict]:
    hours = max((end_dt - start_dt).total_seconds() / 3600.0, 1.0)
    base = (hours / 24.0) * vehicle["price_per_day"] if hours >= 24 else hours * vehicle["price_per_hour"]
    breakdown = {"hours": round(hours, 2), "base_cost": round(base, 2), "weekend_multiplier": 1.0, "seasonal_multiplier": 1.0, "coupon_discount_percent": 0.0}

    if start_dt.weekday() >= 5:
        weekend = _fetch_active_rule("weekend", start_dt)
        if weekend:
            breakdown["weekend_multiplier"] = float(weekend["multiplier"] or 1.0)
            base *= breakdown["weekend_multiplier"]

    seasonal = _fetch_active_rule("seasonal", start_dt)
    if seasonal:
        breakdown["seasonal_multiplier"] = float(seasonal["multiplier"] or 1.0)
        base *= breakdown["seasonal_multiplier"]

    if coupon_code:
        coupon = _fetch_coupon(coupon_code.strip(), start_dt)
        if coupon and coupon["discount_percent"]:
            breakdown["coupon_discount_percent"] = float(coupon["discount_percent"])
            base *= max(0.0, (100.0 - breakdown["coupon_discount_percent"]) / 100.0)
    return round(base, 2), breakdown


def _can_manage_booking(conn: sqlite3.Connection, user: dict, booking: sqlite3.Row) -> bool:
    if user["role"] == "admin":
        return True
    assigned = conn.execute(
        """
        SELECT 1 FROM fleet_vehicle_assignments
        WHERE fleet_manager_id = ? AND vehicle_id = ? AND is_active = 1
        """,
        (user["user_id"], booking["vehicle_id"]),
    ).fetchone()
    return bool(assigned)


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "database": DB_PATH})


@app.post("/api/auth/register")
def register_customer():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    license_no = (data.get("driving_license_number") or "").strip()
    phone = (data.get("phone") or "").strip()

    if not all([name, email, password, license_no]):
        return jsonify({"error": "name, email, password, driving_license_number are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if not valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    conn = get_db()
    exists = conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone()
    if exists:
        conn.close()
        return jsonify({"error": "Email already in use"}), 409
    try:
        conn.execute(
            """
            INSERT INTO users(name, email, password_hash, phone, role, driving_license_number, is_active)
            VALUES (?, ?, ?, ?, 'customer', ?, 1)
            """,
            (name, email, password, phone, license_no),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Driving license already exists"}), 409
    user_id = conn.execute("SELECT last_insert_rowid() AS id").fetchone()["id"]
    user = conn.execute(
        "SELECT user_id, name, email, role, is_active, driving_license_number, assigned_zone FROM users WHERE user_id = ?",
        (user_id,),
    ).fetchone()
    conn.close()
    return jsonify({"message": "Registration successful", "user": dict(user)}), 201


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    conn = get_db()
    user = conn.execute(
        """
        SELECT user_id, name, email, role, is_active, driving_license_number, assigned_zone, password_hash
        FROM users WHERE email = ?
        """,
        (email,),
    ).fetchone()
    conn.close()
    if not user or user["password_hash"] != password:
        return jsonify({"error": "Invalid credentials"}), 401
    if not user["is_active"]:
        return jsonify({"error": "Account inactive"}), 403

    token = str(uuid4())
    safe_user = sanitize_user(user)
    SESSIONS[token] = safe_user
    return jsonify({"token": token, "user": safe_user})


@app.post("/api/auth/logout")
@auth_required()
def logout():
    SESSIONS.pop(request.current_token, None)
    return jsonify({"message": "Logged out"})


@app.get("/api/users/me")
@auth_required()
def me():
    return jsonify(request.current_user)


@app.get("/api/vehicles")
@auth_required()
def list_vehicles():
    query = """
    SELECT vehicle_id, type, brand, model, fuel_type, seating_capacity, price_per_hour, price_per_day,
           availability_status, registration_number, fitness_expiry, insurance_expiry, photo_path
    FROM vehicles WHERE 1=1
    """
    params = []
    v_type = request.args.get("type")
    if v_type:
        query += " AND type = ?"
        params.append(v_type)
    seats = request.args.get("seats")
    if seats:
        query += " AND seating_capacity >= ?"
        params.append(int(seats))
    max_day_price = request.args.get("max_day_price")
    if max_day_price:
        query += " AND price_per_day <= ?"
        params.append(float(max_day_price))
    query += " ORDER BY vehicle_id DESC"
    conn = get_db()
    rows = [dict(r) for r in conn.execute(query, params).fetchall()]
    conn.close()
    return jsonify(rows)


@app.get("/api/vehicles/<int:vehicle_id>/availability")
@auth_required()
def vehicle_availability(vehicle_id: int):
    start = request.args.get("start_datetime", "")
    end = request.args.get("end_datetime", "")
    if not start or not end:
        return jsonify({"error": "start_datetime and end_datetime are required"}), 400
    try:
        start_dt = parse_dt(start)
        end_dt = parse_dt(end)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    if end_dt <= start_dt:
        return jsonify({"error": "End time must be after start time"}), 400

    conn = get_db()
    vehicle = conn.execute("SELECT * FROM vehicles WHERE vehicle_id = ?", (vehicle_id,)).fetchone()
    if not vehicle:
        conn.close()
        return jsonify({"error": "Vehicle not found"}), 404
    available, conflicts = is_vehicle_available(conn, vehicle_id, start_dt, end_dt)
    conn.close()
    return jsonify({"vehicle_id": vehicle_id, "available": available, "conflicts": conflicts})


@app.post("/api/bookings/estimate")
@auth_required(["customer"])
def estimate_booking():
    data = request.get_json(silent=True) or {}
    try:
        vehicle_id = int(data.get("vehicle_id"))
        start_dt = parse_dt(data.get("start_datetime", ""))
        end_dt = parse_dt(data.get("end_datetime", ""))
    except (TypeError, ValueError):
        return jsonify({"error": "vehicle_id, start_datetime and end_datetime are required with valid formats"}), 400
    if end_dt <= start_dt:
        return jsonify({"error": "End time must be after start time"}), 400
    conn = get_db()
    vehicle = conn.execute("SELECT * FROM vehicles WHERE vehicle_id = ?", (vehicle_id,)).fetchone()
    if not vehicle:
        conn.close()
        return jsonify({"error": "Vehicle not found"}), 404
    available, conflicts = is_vehicle_available(conn, vehicle_id, start_dt, end_dt)
    conn.close()
    if not available:
        return jsonify({"error": "Vehicle not available in requested slot", "conflicts": conflicts}), 409
    total, breakdown = calculate_price(dict(vehicle), start_dt, end_dt, data.get("coupon_code"))
    return jsonify({"estimated_total": total, "breakdown": breakdown})


@app.post("/api/bookings")
@auth_required(["customer"])
def create_booking():
    data = request.get_json(silent=True) or {}
    try:
        vehicle_id = int(data.get("vehicle_id"))
        start_dt = parse_dt(data.get("start_datetime", ""))
        end_dt = parse_dt(data.get("end_datetime", ""))
    except (TypeError, ValueError):
        return jsonify({"error": "vehicle_id, start_datetime and end_datetime are required with valid formats"}), 400
    payment_mode = (data.get("payment_mode") or "cash").strip().lower()
    if payment_mode not in ALLOWED_PAYMENT_MODE:
        return jsonify({"error": "Invalid payment_mode"}), 400
    if end_dt <= start_dt:
        return jsonify({"error": "End time must be after start time"}), 400
    if start_dt < datetime.now():
        return jsonify({"error": "Cannot create booking in the past"}), 400

    conn = get_db()
    vehicle = conn.execute("SELECT * FROM vehicles WHERE vehicle_id = ?", (vehicle_id,)).fetchone()
    if not vehicle:
        conn.close()
        return jsonify({"error": "Vehicle not found"}), 404
    if vehicle["availability_status"] == "maintenance":
        conn.close()
        return jsonify({"error": "Vehicle under maintenance"}), 400

    available, conflicts = is_vehicle_available(conn, vehicle_id, start_dt, end_dt)
    if not available:
        conn.close()
        return jsonify({"error": "Vehicle already booked in requested slot", "conflicts": conflicts}), 409

    total_cost, _ = calculate_price(dict(vehicle), start_dt, end_dt, data.get("coupon_code"))
    conn.execute(
        """
        INSERT INTO rental_records(customer_id, vehicle_id, start_datetime, end_datetime, total_cost, payment_mode, payment_status, rental_status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', 'booked')
        """,
        (request.current_user["user_id"], vehicle_id, start_dt.isoformat(), end_dt.isoformat(), total_cost, payment_mode),
    )
    conn.commit()
    rental_id = conn.execute("SELECT last_insert_rowid() AS id").fetchone()["id"]
    conn.close()
    return jsonify({"message": "Booking created", "rental_id": rental_id, "total_cost": total_cost}), 201


@app.patch("/api/bookings/<int:rental_id>/cancel")
@auth_required(["customer"])
def cancel_booking(rental_id: int):
    conn = get_db()
    booking = conn.execute("SELECT * FROM rental_records WHERE rental_id = ? AND customer_id = ?", (rental_id, request.current_user["user_id"])).fetchone()
    if not booking:
        conn.close()
        return jsonify({"error": "Booking not found"}), 404
    if booking["rental_status"] != "booked":
        conn.close()
        return jsonify({"error": "Only booked rentals can be cancelled"}), 409
    conn.execute("UPDATE rental_records SET rental_status = 'cancelled' WHERE rental_id = ?", (rental_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Booking cancelled"})


@app.get("/api/bookings/me")
@auth_required(["customer"])
def my_bookings():
    conn = get_db()
    rows = conn.execute(
        """
        SELECT rr.*, v.brand, v.model, v.type, v.registration_number
        FROM rental_records rr
        JOIN vehicles v ON v.vehicle_id = rr.vehicle_id
        WHERE rr.customer_id = ?
        ORDER BY rr.rental_id DESC
        """,
        (request.current_user["user_id"],),
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.get("/api/bookings/assigned")
@auth_required(["fleet_manager", "admin"])
def assigned_bookings():
    conn = get_db()
    if request.current_user["role"] == "admin":
        rows = conn.execute(
            """
            SELECT rr.*, u.name AS customer_name, u.email AS customer_email, v.brand, v.model, v.registration_number
            FROM rental_records rr
            JOIN users u ON u.user_id = rr.customer_id
            JOIN vehicles v ON v.vehicle_id = rr.vehicle_id
            ORDER BY rr.rental_id DESC
            """
        ).fetchall()
    else:
        rows = conn.execute(
            """
            SELECT rr.*, u.name AS customer_name, u.email AS customer_email, v.brand, v.model, v.registration_number
            FROM rental_records rr
            JOIN users u ON u.user_id = rr.customer_id
            JOIN vehicles v ON v.vehicle_id = rr.vehicle_id
            JOIN fleet_vehicle_assignments fva
              ON fva.vehicle_id = rr.vehicle_id
             AND fva.fleet_manager_id = ?
             AND fva.is_active = 1
            ORDER BY rr.rental_id DESC
            """,
            (request.current_user["user_id"],),
        ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.patch("/api/bookings/<int:rental_id>/status")
@auth_required(["fleet_manager", "admin"])
def update_booking_status(rental_id: int):
    data = request.get_json(silent=True) or {}
    rental_status = data.get("rental_status")
    payment_status = data.get("payment_status")
    if rental_status and rental_status not in ALLOWED_RENTAL:
        return jsonify({"error": "Invalid rental_status"}), 400
    if payment_status and payment_status not in ALLOWED_PAYMENT:
        return jsonify({"error": "Invalid payment_status"}), 400
    if not rental_status and not payment_status:
        return jsonify({"error": "No fields provided"}), 400

    conn = get_db()
    booking = conn.execute("SELECT * FROM rental_records WHERE rental_id = ?", (rental_id,)).fetchone()
    if not booking:
        conn.close()
        return jsonify({"error": "Booking not found"}), 404
    if not _can_manage_booking(conn, request.current_user, booking):
        conn.close()
        return jsonify({"error": "Not allowed for this vehicle"}), 403

    updates = []
    params: list = []
    if rental_status:
        old = booking["rental_status"]
        allowed_transitions = {
            "booked": {"picked_up", "cancelled"},
            "picked_up": {"returned"},
            "returned": set(),
            "cancelled": set(),
        }
        if rental_status != old and rental_status not in allowed_transitions.get(old, set()):
            conn.close()
            return jsonify({"error": f"Invalid status transition: {old} -> {rental_status}"}), 409
        updates.append("rental_status = ?")
        params.append(rental_status)
        if rental_status == "picked_up":
            conn.execute("UPDATE vehicles SET availability_status = 'rented' WHERE vehicle_id = ?", (booking["vehicle_id"],))
        if rental_status in {"returned", "cancelled"}:
            conn.execute("UPDATE vehicles SET availability_status = 'available' WHERE vehicle_id = ?", (booking["vehicle_id"],))
        if rental_status == "returned":
            updates.append("actual_return_datetime = ?")
            params.append(datetime.now().isoformat(timespec="seconds"))
    if payment_status:
        updates.append("payment_status = ?")
        params.append(payment_status)

    params.append(rental_id)
    conn.execute(f"UPDATE rental_records SET {', '.join(updates)} WHERE rental_id = ?", params)
    conn.commit()
    updated = dict(conn.execute("SELECT * FROM rental_records WHERE rental_id = ?", (rental_id,)).fetchone())
    conn.close()
    return jsonify({"message": "Booking updated", "booking": updated})


@app.get("/api/admin/users")
@auth_required(["admin"])
def admin_list_users():
    conn = get_db()
    rows = conn.execute(
        "SELECT user_id, name, email, role, is_active, driving_license_number, assigned_zone FROM users ORDER BY user_id DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.post("/api/admin/users")
@auth_required(["admin"])
def admin_create_user():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    role = (data.get("role") or "").strip()
    phone = (data.get("phone") or "").strip()
    dl = (data.get("driving_license_number") or "").strip() or None
    zone = (data.get("assigned_zone") or "").strip() or None
    if role not in {"admin", "customer", "fleet_manager"}:
        return jsonify({"error": "Invalid role"}), 400
    if not all([name, email, password]):
        return jsonify({"error": "name, email, password are required"}), 400
    if not valid_email(email):
        return jsonify({"error": "Invalid email"}), 400
    if role == "customer" and not dl:
        return jsonify({"error": "Customer requires driving_license_number"}), 400
    conn = get_db()
    if conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
        conn.close()
        return jsonify({"error": "Email already exists"}), 409
    try:
        conn.execute(
            """
            INSERT INTO users(name, email, password_hash, phone, role, driving_license_number, assigned_zone, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            """,
            (name, email, password, phone, role, dl if role == "customer" else None, zone if role == "fleet_manager" else None),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Duplicate driving license"}), 409
    user_id = conn.execute("SELECT last_insert_rowid() AS id").fetchone()["id"]
    user = conn.execute("SELECT user_id, name, email, role, is_active, driving_license_number, assigned_zone FROM users WHERE user_id = ?", (user_id,)).fetchone()
    conn.close()
    return jsonify({"message": "User created", "user": dict(user)}), 201


@app.delete("/api/admin/users/<int:user_id>")
@auth_required(["admin"])
def admin_delete_user(user_id: int):
    if user_id == request.current_user["user_id"]:
        return jsonify({"error": "Admin cannot delete own account"}), 409
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404
    if user["role"] == "admin":
        conn.close()
        return jsonify({"error": "Delete of admin is blocked"}), 409
    has_records = conn.execute("SELECT 1 FROM rental_records WHERE customer_id = ? LIMIT 1", (user_id,)).fetchone()
    if has_records and user["role"] == "customer":
        conn.close()
        return jsonify({"error": "Cannot delete customer with bookings. Deactivate instead."}), 409
    conn.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "User deleted"})


@app.get("/api/admin/vehicles")
@auth_required(["admin"])
def admin_list_vehicles():
    conn = get_db()
    rows = conn.execute("SELECT * FROM vehicles ORDER BY vehicle_id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.post("/api/admin/vehicles")
@auth_required(["admin"])
def admin_create_vehicle():
    data = request.get_json(silent=True) or {}
    try:
        payload = {
            "type": (data.get("type") or "").strip(),
            "brand": (data.get("brand") or "").strip(),
            "model": (data.get("model") or "").strip(),
            "fuel_type": (data.get("fuel_type") or "").strip(),
            "seating_capacity": int(data.get("seating_capacity")),
            "price_per_hour": float(data.get("price_per_hour")),
            "price_per_day": float(data.get("price_per_day")),
            "availability_status": (data.get("availability_status") or "available").strip(),
            "registration_number": (data.get("registration_number") or "").strip(),
            "fitness_expiry": data.get("fitness_expiry"),
            "insurance_expiry": data.get("insurance_expiry"),
            "photo_path": data.get("photo_path"),
        }
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid vehicle payload"}), 400
    if payload["type"] not in ALLOWED_VEHICLE_TYPES or payload["fuel_type"] not in ALLOWED_FUEL_TYPES:
        return jsonify({"error": "Invalid vehicle type or fuel_type"}), 400
    if payload["availability_status"] not in ALLOWED_AVAILABILITY:
        return jsonify({"error": "Invalid availability_status"}), 400
    if not all([payload["brand"], payload["model"], payload["registration_number"]]):
        return jsonify({"error": "brand, model, registration_number are required"}), 400
    if payload["price_per_hour"] <= 0 or payload["price_per_day"] <= 0:
        return jsonify({"error": "Prices must be > 0"}), 400
    conn = get_db()
    try:
        conn.execute(
            """
            INSERT INTO vehicles(type, brand, model, fuel_type, seating_capacity, price_per_hour, price_per_day, availability_status, registration_number, fitness_expiry, insurance_expiry, photo_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload["type"],
                payload["brand"],
                payload["model"],
                payload["fuel_type"],
                payload["seating_capacity"],
                payload["price_per_hour"],
                payload["price_per_day"],
                payload["availability_status"],
                payload["registration_number"],
                payload["fitness_expiry"],
                payload["insurance_expiry"],
                payload["photo_path"],
            ),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "registration_number already exists"}), 409
    vehicle_id = conn.execute("SELECT last_insert_rowid() AS id").fetchone()["id"]
    vehicle = conn.execute("SELECT * FROM vehicles WHERE vehicle_id = ?", (vehicle_id,)).fetchone()
    conn.close()
    return jsonify({"message": "Vehicle created", "vehicle": dict(vehicle)}), 201


@app.put("/api/admin/vehicles/<int:vehicle_id>")
@auth_required(["admin"])
def admin_update_vehicle(vehicle_id: int):
    data = request.get_json(silent=True) or {}
    allowed = {"type", "brand", "model", "fuel_type", "seating_capacity", "price_per_hour", "price_per_day", "availability_status", "registration_number", "fitness_expiry", "insurance_expiry", "photo_path"}
    updates = []
    params: list = []
    for key, value in data.items():
        if key not in allowed:
            continue
        if key in {"type"} and value not in ALLOWED_VEHICLE_TYPES:
            return jsonify({"error": "Invalid vehicle type"}), 400
        if key in {"fuel_type"} and value not in ALLOWED_FUEL_TYPES:
            return jsonify({"error": "Invalid fuel_type"}), 400
        if key in {"availability_status"} and value not in ALLOWED_AVAILABILITY:
            return jsonify({"error": "Invalid availability_status"}), 400
        updates.append(f"{key} = ?")
        params.append(value)
    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400
    conn = get_db()
    exists = conn.execute("SELECT * FROM vehicles WHERE vehicle_id = ?", (vehicle_id,)).fetchone()
    if not exists:
        conn.close()
        return jsonify({"error": "Vehicle not found"}), 404
    try:
        params.append(vehicle_id)
        conn.execute(f"UPDATE vehicles SET {', '.join(updates)} WHERE vehicle_id = ?", params)
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "registration_number already exists"}), 409
    updated = dict(conn.execute("SELECT * FROM vehicles WHERE vehicle_id = ?", (vehicle_id,)).fetchone())
    conn.close()
    return jsonify({"message": "Vehicle updated", "vehicle": updated})


@app.delete("/api/admin/vehicles/<int:vehicle_id>")
@auth_required(["admin"])
def admin_delete_vehicle(vehicle_id: int):
    conn = get_db()
    exists = conn.execute("SELECT * FROM vehicles WHERE vehicle_id = ?", (vehicle_id,)).fetchone()
    if not exists:
        conn.close()
        return jsonify({"error": "Vehicle not found"}), 404
    active = conn.execute(
        "SELECT 1 FROM rental_records WHERE vehicle_id = ? AND rental_status IN ('booked','picked_up') LIMIT 1",
        (vehicle_id,),
    ).fetchone()
    if active:
        conn.close()
        return jsonify({"error": "Cannot delete vehicle with active booking"}), 409
    conn.execute("DELETE FROM vehicles WHERE vehicle_id = ?", (vehicle_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Vehicle deleted"})


@app.get("/api/admin/fleet-assignments")
@auth_required(["admin"])
def admin_list_assignments():
    conn = get_db()
    rows = conn.execute(
        """
        SELECT fva.assignment_id, fva.fleet_manager_id, fva.vehicle_id, fva.is_active, fva.assigned_date,
               u.name AS fleet_manager_name, v.brand, v.model, v.registration_number
        FROM fleet_vehicle_assignments fva
        JOIN users u ON u.user_id = fva.fleet_manager_id
        JOIN vehicles v ON v.vehicle_id = fva.vehicle_id
        ORDER BY fva.assignment_id DESC
        """
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.post("/api/admin/fleet-assignments")
@auth_required(["admin"])
def admin_assign_vehicle():
    data = request.get_json(silent=True) or {}
    try:
        fleet_manager_id = int(data.get("fleet_manager_id"))
        vehicle_id = int(data.get("vehicle_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "fleet_manager_id and vehicle_id are required"}), 400
    conn = get_db()
    manager = conn.execute("SELECT * FROM users WHERE user_id = ? AND role = 'fleet_manager' AND is_active = 1", (fleet_manager_id,)).fetchone()
    vehicle = conn.execute("SELECT * FROM vehicles WHERE vehicle_id = ?", (vehicle_id,)).fetchone()
    if not manager or not vehicle:
        conn.close()
        return jsonify({"error": "Fleet manager or vehicle not found"}), 404
    existing = conn.execute(
        "SELECT * FROM fleet_vehicle_assignments WHERE fleet_manager_id = ? AND vehicle_id = ?",
        (fleet_manager_id, vehicle_id),
    ).fetchone()
    if existing:
        conn.execute("UPDATE fleet_vehicle_assignments SET is_active = 1 WHERE assignment_id = ?", (existing["assignment_id"],))
        assignment_id = existing["assignment_id"]
    else:
        conn.execute(
            "INSERT INTO fleet_vehicle_assignments(fleet_manager_id, vehicle_id, is_active) VALUES (?, ?, 1)",
            (fleet_manager_id, vehicle_id),
        )
        assignment_id = conn.execute("SELECT last_insert_rowid() AS id").fetchone()["id"]
    conn.commit()
    assignment = conn.execute("SELECT * FROM fleet_vehicle_assignments WHERE assignment_id = ?", (assignment_id,)).fetchone()
    conn.close()
    return jsonify({"message": "Vehicle assigned", "assignment": dict(assignment)})


@app.delete("/api/admin/fleet-assignments/<int:assignment_id>")
@auth_required(["admin"])
def admin_unassign_vehicle(assignment_id: int):
    conn = get_db()
    exists = conn.execute("SELECT * FROM fleet_vehicle_assignments WHERE assignment_id = ?", (assignment_id,)).fetchone()
    if not exists:
        conn.close()
        return jsonify({"error": "Assignment not found"}), 404
    conn.execute("UPDATE fleet_vehicle_assignments SET is_active = 0 WHERE assignment_id = ?", (assignment_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Assignment deactivated"})


@app.get("/api/maintenance")
@auth_required(["fleet_manager", "admin"])
def list_maintenance():
    conn = get_db()
    if request.current_user["role"] == "admin":
        rows = conn.execute(
            """
            SELECT ml.*, u.name AS fleet_manager_name, v.brand, v.model, v.registration_number
            FROM maintenance_logs ml
            JOIN users u ON u.user_id = ml.fleet_manager_id
            JOIN vehicles v ON v.vehicle_id = ml.vehicle_id
            ORDER BY ml.log_id DESC
            """
        ).fetchall()
    else:
        rows = conn.execute(
            """
            SELECT ml.*, u.name AS fleet_manager_name, v.brand, v.model, v.registration_number
            FROM maintenance_logs ml
            JOIN users u ON u.user_id = ml.fleet_manager_id
            JOIN vehicles v ON v.vehicle_id = ml.vehicle_id
            JOIN fleet_vehicle_assignments fva
              ON fva.vehicle_id = ml.vehicle_id
             AND fva.fleet_manager_id = ?
             AND fva.is_active = 1
            ORDER BY ml.log_id DESC
            """,
            (request.current_user["user_id"],),
        ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.post("/api/maintenance")
@auth_required(["fleet_manager", "admin"])
def create_maintenance():
    data = request.get_json(silent=True) or {}
    try:
        vehicle_id = int(data.get("vehicle_id"))
        cost = float(data.get("cost", 0) or 0)
    except (TypeError, ValueError):
        return jsonify({"error": "vehicle_id/cost invalid"}), 400
    maintenance_type = (data.get("maintenance_type") or "").strip()
    description = (data.get("description") or "").strip()
    maintenance_date = data.get("maintenance_date")
    next_due_date = data.get("next_due_date")
    if maintenance_type not in ALLOWED_MAINTENANCE:
        return jsonify({"error": "Invalid maintenance_type"}), 400
    if not maintenance_date:
        return jsonify({"error": "maintenance_date required"}), 400
    manager_id = request.current_user["user_id"] if request.current_user["role"] == "fleet_manager" else int(data.get("fleet_manager_id") or 0)
    if request.current_user["role"] == "admin" and manager_id <= 0:
        return jsonify({"error": "Admin must supply fleet_manager_id"}), 400
    conn = get_db()
    if request.current_user["role"] == "fleet_manager":
        assigned = conn.execute(
            "SELECT 1 FROM fleet_vehicle_assignments WHERE fleet_manager_id = ? AND vehicle_id = ? AND is_active = 1",
            (manager_id, vehicle_id),
        ).fetchone()
        if not assigned:
            conn.close()
            return jsonify({"error": "Vehicle not assigned to you"}), 403
    conn.execute(
        """
        INSERT INTO maintenance_logs(vehicle_id, fleet_manager_id, maintenance_type, description, cost, maintenance_date, next_due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (vehicle_id, manager_id, maintenance_type, description, cost, maintenance_date, next_due_date),
    )
    conn.execute("UPDATE vehicles SET availability_status = 'maintenance' WHERE vehicle_id = ?", (vehicle_id,))
    conn.commit()
    log_id = conn.execute("SELECT last_insert_rowid() AS id").fetchone()["id"]
    row = conn.execute("SELECT * FROM maintenance_logs WHERE log_id = ?", (log_id,)).fetchone()
    conn.close()
    return jsonify({"message": "Maintenance log created", "log": dict(row)}), 201


@app.put("/api/maintenance/<int:log_id>")
@auth_required(["fleet_manager", "admin"])
def update_maintenance(log_id: int):
    data = request.get_json(silent=True) or {}
    conn = get_db()
    log = conn.execute("SELECT * FROM maintenance_logs WHERE log_id = ?", (log_id,)).fetchone()
    if not log:
        conn.close()
        return jsonify({"error": "Log not found"}), 404
    if request.current_user["role"] == "fleet_manager" and log["fleet_manager_id"] != request.current_user["user_id"]:
        conn.close()
        return jsonify({"error": "Cannot edit another manager log"}), 403
    updates = []
    params: list = []
    for key in ["maintenance_type", "description", "cost", "maintenance_date", "next_due_date"]:
        if key not in data:
            continue
        if key == "maintenance_type" and data[key] not in ALLOWED_MAINTENANCE:
            conn.close()
            return jsonify({"error": "Invalid maintenance_type"}), 400
        updates.append(f"{key} = ?")
        params.append(data[key])
    if not updates:
        conn.close()
        return jsonify({"error": "No fields to update"}), 400
    params.append(log_id)
    conn.execute(f"UPDATE maintenance_logs SET {', '.join(updates)} WHERE log_id = ?", params)
    conn.commit()
    updated = dict(conn.execute("SELECT * FROM maintenance_logs WHERE log_id = ?", (log_id,)).fetchone())
    conn.close()
    return jsonify({"message": "Maintenance updated", "log": updated})


@app.delete("/api/maintenance/<int:log_id>")
@auth_required(["fleet_manager", "admin"])
def delete_maintenance(log_id: int):
    conn = get_db()
    log = conn.execute("SELECT * FROM maintenance_logs WHERE log_id = ?", (log_id,)).fetchone()
    if not log:
        conn.close()
        return jsonify({"error": "Log not found"}), 404
    if request.current_user["role"] == "fleet_manager" and log["fleet_manager_id"] != request.current_user["user_id"]:
        conn.close()
        return jsonify({"error": "Cannot delete another manager log"}), 403
    conn.execute("DELETE FROM maintenance_logs WHERE log_id = ?", (log_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Maintenance log deleted"})


@app.get("/api/test-credentials")
def test_credentials():
    return jsonify({"admin": {"email": "admin@rental.com", "password": "admin123"}, "fleet_manager": {"email": "fleet1@rental.com", "password": "fleet123"}, "customer": {"email": "customer1@rental.com", "password": "cust123"}})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
