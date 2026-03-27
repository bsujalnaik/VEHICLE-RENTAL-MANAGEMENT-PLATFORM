from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(20), db.CheckConstraint("role IN ('admin','customer','fleet_manager')"), nullable=False)
    driving_license_number = db.Column(db.String(50), unique=True, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'user_id': self.user_id, 'name': self.name, 'email': self.email, 'phone': self.phone,
            'role': self.role, 'driving_license_number': self.driving_license_number,
            'is_active': self.is_active, 'created_at': self.created_at.isoformat()
        }

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    vehicle_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    type = db.Column(db.String(20), db.CheckConstraint("type IN ('car','bike','van')"), nullable=False)
    brand = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    fuel_type = db.Column(db.String(20), db.CheckConstraint("fuel_type IN ('petrol','diesel','electric','cng')"), nullable=False)
    seating_capacity = db.Column(db.Integer)
    price_per_hour = db.Column(db.Float, nullable=False)
    price_per_day = db.Column(db.Float, nullable=False)
    availability_status = db.Column(db.String(20), db.CheckConstraint("availability_status IN ('available','rented','maintenance')"), default='available')
    registration_number = db.Column(db.String(50), unique=True, nullable=False)
    fitness_expiry = db.Column(db.Date)
    insurance_expiry = db.Column(db.Date)
    photo_path = db.Column(db.String(256))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'vehicle_id': self.vehicle_id, 'type': self.type, 'brand': self.brand, 'model': self.model,
            'fuel_type': self.fuel_type, 'seating_capacity': self.seating_capacity,
            'price_per_hour': self.price_per_hour, 'price_per_day': self.price_per_day,
            'availability_status': self.availability_status, 'registration_number': self.registration_number,
            'fitness_expiry': self.fitness_expiry.isoformat() if self.fitness_expiry else None,
            'insurance_expiry': self.insurance_expiry.isoformat() if self.insurance_expiry else None,
            'photo_path': self.photo_path, 'created_at': self.created_at.isoformat()
        }

class PricingRule(db.Model):
    __tablename__ = 'pricing_rules'
    rule_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    rule_name = db.Column(db.String(100), nullable=False)
    rule_type = db.Column(db.String(20), db.CheckConstraint("rule_type IN ('seasonal','weekend','late_fee','coupon')"), nullable=False)
    multiplier = db.Column(db.Float, default=1.0)
    flat_fee = db.Column(db.Float, default=0)
    discount_code = db.Column(db.String(50), unique=True, nullable=True)
    discount_percent = db.Column(db.Float, nullable=True)
    valid_from = db.Column(db.Date)
    valid_to = db.Column(db.Date)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'rule_id': self.rule_id, 'rule_name': self.rule_name, 'rule_type': self.rule_type,
            'multiplier': self.multiplier, 'flat_fee': self.flat_fee, 'discount_code': self.discount_code,
            'discount_percent': self.discount_percent, 'valid_from': self.valid_from.isoformat() if self.valid_from else None,
            'valid_to': self.valid_to.isoformat() if self.valid_to else None, 'is_active': self.is_active
        }

class RentalRecord(db.Model):
    __tablename__ = 'rental_records'
    rental_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.vehicle_id'), nullable=False)
    pricing_rule_id = db.Column(db.Integer, db.ForeignKey('pricing_rules.rule_id'), nullable=True)
    start_datetime = db.Column(db.DateTime, nullable=False)
    end_datetime = db.Column(db.DateTime, nullable=False)
    actual_return_datetime = db.Column(db.DateTime, nullable=True)
    total_cost = db.Column(db.Float)
    payment_mode = db.Column(db.String(20))
    payment_status = db.Column(db.String(20))
    rental_status = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    vehicle = db.relationship('Vehicle', backref='rentals')

    def to_dict(self):
        return {
            'rental_id': self.rental_id, 'customer_id': self.customer_id, 'vehicle_id': self.vehicle_id,
            'vehicle': self.vehicle.to_dict() if self.vehicle else None,
            'start_datetime': self.start_datetime.isoformat(), 'end_datetime': self.end_datetime.isoformat(),
            'total_cost': self.total_cost, 'rental_status': self.rental_status, 'created_at': self.created_at.isoformat()
        }

class MaintenanceLog(db.Model):
    __tablename__ = 'maintenance_logs'
    log_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.vehicle_id'), nullable=False)
    fleet_manager_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    maintenance_type = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text)
    cost = db.Column(db.Float)
    maintenance_date = db.Column(db.Date, nullable=False)
    next_due_date = db.Column(db.Date)

    def to_dict(self):
        return {'log_id': self.log_id, 'vehicle_id': self.vehicle_id, 'maintenance_type': self.maintenance_type, 'cost': self.cost}

class FleetVehicleAssignment(db.Model):
    __tablename__ = 'fleet_vehicle_assignments'
    assignment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fleet_manager_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.vehicle_id'), nullable=False)
    assigned_date = db.Column(db.Date, default=datetime.utcnow().date)
    is_active = db.Column(db.Boolean, default=True)

class Notification(db.Model):
    __tablename__ = 'notifications'
    notification_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
