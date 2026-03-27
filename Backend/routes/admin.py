"""
Admin routes — pricing rules, coupons, reports.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import PricingRule, Coupon, Booking, Vehicle, User
from middleware.auth import require_role

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


# ────────────────────────────────────────────────
#  Pricing Rules
# ────────────────────────────────────────────────

@admin_bp.route("/pricing-rules", methods=["GET"])
@jwt_required()
@require_role("admin")
def list_pricing_rules():
    """List all pricing rules."""
    rules = PricingRule.query.all()
    return jsonify({"pricing_rules": [r.to_dict() for r in rules]}), 200


@admin_bp.route("/pricing-rules", methods=["POST"])
@jwt_required()
@require_role("admin")
def create_pricing_rule():
    """Create a new pricing rule."""
    data = request.get_json()
    required = ["name", "type", "multiplier"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"'{field}' is required"}), 400

    rule = PricingRule(
        name=data["name"],
        type=data["type"],
        multiplier=data["multiplier"],
        start_date=data.get("start_date"),
        end_date=data.get("end_date"),
        active=data.get("active", True),
    )
    db.session.add(rule)
    db.session.commit()
    return jsonify({"message": "Rule created", "rule": rule.to_dict()}), 201


@admin_bp.route("/pricing-rules/<int:rule_id>", methods=["PUT"])
@jwt_required()
@require_role("admin")
def update_pricing_rule(rule_id):
    """Update an existing pricing rule."""
    rule = PricingRule.query.get(rule_id)
    if not rule:
        return jsonify({"error": "Rule not found"}), 404

    data = request.get_json()
    for field in ["name", "type", "multiplier", "start_date", "end_date", "active"]:
        if field in data:
            setattr(rule, field, data[field])

    db.session.commit()
    return jsonify({"message": "Rule updated", "rule": rule.to_dict()}), 200


# ────────────────────────────────────────────────
#  Coupons
# ────────────────────────────────────────────────

@admin_bp.route("/coupons", methods=["GET"])
@jwt_required()
@require_role("admin")
def list_coupons():
    """List all coupons."""
    coupons = Coupon.query.all()
    return jsonify({"coupons": [c.to_dict() for c in coupons]}), 200


@admin_bp.route("/coupons", methods=["POST"])
@jwt_required()
@require_role("admin")
def create_coupon():
    """Create a coupon code."""
    data = request.get_json()
    required = ["code", "discount_percent"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"'{field}' is required"}), 400

    if Coupon.query.filter_by(code=data["code"]).first():
        return jsonify({"error": "Coupon code already exists"}), 409

    coupon = Coupon(
        code=data["code"],
        discount_percent=data["discount_percent"],
        expiry=data.get("expiry"),
        active=data.get("active", True),
    )
    db.session.add(coupon)
    db.session.commit()
    return jsonify({"message": "Coupon created", "coupon": coupon.to_dict()}), 201


# ────────────────────────────────────────────────
#  Users
# ────────────────────────────────────────────────

@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@require_role("admin")
def list_users():
    """List all registered users."""
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200

@admin_bp.route("/users", methods=["POST"])
@jwt_required()
@require_role("admin")
def create_user():
    """Create a new user (usually a fleet manager)."""
    data = request.get_json()
    if not data.get("name") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "name, email, password are required"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 409

    from extensions import bcrypt
    pw_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    
    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=pw_hash,
        role=data.get("role", "customer"),
        location=data.get("location")
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created", "user": user.to_dict()}), 201

@admin_bp.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
@require_role("admin")
def update_user(user_id):
    """Update an existing user (e.g. change role or location)."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    if "name" in data: user.name = data["name"]
    if "email" in data: user.email = data["email"]
    if "role" in data: user.role = data["role"]
    if "location" in data: user.location = data["location"]
    
    if data.get("password"):
        from extensions import bcrypt
        user.password_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    db.session.commit()
    return jsonify({"message": "User updated", "user": user.to_dict()}), 200


# ────────────────────────────────────────────────
#  Reports
# ────────────────────────────────────────────────

@admin_bp.route("/reports", methods=["GET"])
@jwt_required()
@require_role("admin")
def get_reports():
    """
    Dashboard report:
      - Total revenue
      - Active rentals (PICKED_UP)
      - Fleet utilisation %
      - Total users
    """
    total_revenue = db.session.query(
        db.func.coalesce(db.func.sum(Booking.total_cost), 0)
    ).filter(Booking.status.in_(["PAID", "PICKED_UP", "RETURNED", "CLOSED"])).scalar()

    active_rentals = Booking.query.filter_by(status="PICKED_UP").count()
    total_bookings = Booking.query.count()
    total_vehicles = Vehicle.query.count()
    available_vehicles = Vehicle.query.filter_by(status="available").count()
    total_users = User.query.count()

    utilisation = 0.0
    if total_vehicles > 0:
        utilisation = round(((total_vehicles - available_vehicles) / total_vehicles) * 100, 1)

    return jsonify({
        "reports": {
            "total_revenue": round(total_revenue, 2),
            "active_rentals": active_rentals,
            "total_bookings": total_bookings,
            "total_vehicles": total_vehicles,
            "available_vehicles": available_vehicles,
            "fleet_utilisation_percent": utilisation,
            "total_users": total_users,
        },
    }), 200
