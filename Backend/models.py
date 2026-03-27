"""
SQLAlchemy models for VRMP.
Defines table schemas — the actual database is configured via config.py.
"""
from datetime import datetime
from extensions import db


# ──────────────────────────────────────────────
#  User
# ──────────────────────────────────────────────
class User(db.Model):
    __tablename__ = "users"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(120), nullable=False)
    email      = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role       = db.Column(db.String(20), nullable=False, default="customer")  # customer | admin | fleet
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    bookings = db.relationship("Booking", backref="user", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat(),
        }


# ──────────────────────────────────────────────
#  Vehicle
# ──────────────────────────────────────────────
class Vehicle(db.Model):
    __tablename__ = "vehicles"

    id               = db.Column(db.Integer, primary_key=True)
    brand            = db.Column(db.String(80), nullable=False)
    model            = db.Column(db.String(80), nullable=False)
    type             = db.Column(db.String(20), nullable=False)         # car | bike | van
    fuel             = db.Column(db.String(20), nullable=False)         # petrol | diesel | electric
    seats            = db.Column(db.Integer, nullable=False)
    price_per_hour   = db.Column(db.Float, nullable=False)
    price_per_day    = db.Column(db.Float, nullable=False)
    registration     = db.Column(db.String(30), unique=True, nullable=False)
    fitness_expiry   = db.Column(db.Date, nullable=True)
    insurance_expiry = db.Column(db.Date, nullable=True)
    photo_url        = db.Column(db.String(256), nullable=True)
    status           = db.Column(db.String(20), nullable=False, default="available")  # available | maintenance | unavailable

    bookings         = db.relationship("Booking", backref="vehicle", lazy=True)
    maintenance_logs = db.relationship("MaintenanceLog", backref="vehicle", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "brand": self.brand,
            "model": self.model,
            "type": self.type,
            "fuel": self.fuel,
            "seats": self.seats,
            "price_per_hour": self.price_per_hour,
            "price_per_day": self.price_per_day,
            "registration": self.registration,
            "fitness_expiry": self.fitness_expiry.isoformat() if self.fitness_expiry else None,
            "insurance_expiry": self.insurance_expiry.isoformat() if self.insurance_expiry else None,
            "photo_url": self.photo_url,
            "status": self.status,
        }


# ──────────────────────────────────────────────
#  Booking
# ──────────────────────────────────────────────
class Booking(db.Model):
    __tablename__ = "bookings"

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    vehicle_id   = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=False)
    start_date   = db.Column(db.DateTime, nullable=False)
    end_date     = db.Column(db.DateTime, nullable=False)
    status       = db.Column(db.String(20), nullable=False, default="BOOKED")  # BOOKED | PAID | PICKED_UP | RETURNED | CLOSED
    total_cost   = db.Column(db.Float, nullable=False, default=0.0)
    payment_mode = db.Column(db.String(30), nullable=True)  # card | upi | cash
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "vehicle_id": self.vehicle_id,
            "vehicle_name": f"{self.vehicle.brand} {self.vehicle.model}" if self.vehicle else "Unknown Vehicle",
            "vehicle_image": self.vehicle.photo_url if self.vehicle else "https://images.unsplash.com/photo-1549399542-7e3f8b79c341",
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "status": self.status,
            "total_cost": self.total_cost,
            "payment_mode": self.payment_mode,
            "created_at": self.created_at.isoformat(),
        }


# ──────────────────────────────────────────────
#  MaintenanceLog
# ──────────────────────────────────────────────
class MaintenanceLog(db.Model):
    __tablename__ = "maintenance_logs"

    id          = db.Column(db.Integer, primary_key=True)
    vehicle_id  = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=False)
    type        = db.Column(db.String(50), nullable=False)     # oil_change | tire | service …
    description = db.Column(db.Text, nullable=True)
    cost        = db.Column(db.Float, nullable=False, default=0.0)
    date        = db.Column(db.DateTime, default=datetime.utcnow)
    next_due    = db.Column(db.Date, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "vehicle_id": self.vehicle_id,
            "type": self.type,
            "description": self.description,
            "cost": self.cost,
            "date": self.date.isoformat(),
            "next_due": self.next_due.isoformat() if self.next_due else None,
        }


# ──────────────────────────────────────────────
#  PricingRule
# ──────────────────────────────────────────────
class PricingRule(db.Model):
    __tablename__ = "pricing_rules"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(80), nullable=False)
    type       = db.Column(db.String(20), nullable=False)  # seasonal | weekend | late
    multiplier = db.Column(db.Float, nullable=False, default=1.0)
    start_date = db.Column(db.Date, nullable=True)
    end_date   = db.Column(db.Date, nullable=True)
    active     = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "multiplier": self.multiplier,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "active": self.active,
        }


# ──────────────────────────────────────────────
#  Coupon
# ──────────────────────────────────────────────
class Coupon(db.Model):
    __tablename__ = "coupons"

    id               = db.Column(db.Integer, primary_key=True)
    code             = db.Column(db.String(30), unique=True, nullable=False)
    discount_percent = db.Column(db.Float, nullable=False)
    expiry           = db.Column(db.Date, nullable=True)
    active           = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "discount_percent": self.discount_percent,
            "expiry": self.expiry.isoformat() if self.expiry else None,
            "active": self.active,
        }
