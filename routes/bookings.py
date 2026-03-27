"""
Booking routes — create, pickup, return, list.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Booking, Vehicle
from middleware.auth import require_role
from services.availability import check_availability
from services.pricing_engine import calculate_price
from services.booking_engine import transition_status

bookings_bp = Blueprint("bookings", __name__, url_prefix="/bookings")


# ── GET /bookings ─────────────────────────────
@bookings_bp.route("", methods=["GET"])
@jwt_required()
def list_bookings():
    """
    Customer sees their bookings.
    Admin / Fleet see all bookings.
    """
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    role = claims.get("role", "customer")
    user_id = int(get_jwt_identity())

    if role in ("admin", "fleet"):
        bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    else:
        bookings = Booking.query.filter_by(user_id=user_id)\
                                .order_by(Booking.created_at.desc()).all()

    return jsonify({"bookings": [b.to_dict() for b in bookings]}), 200


# ── GET /bookings/<id> ────────────────────────
@bookings_bp.route("/<int:booking_id>", methods=["GET"])
@jwt_required()
def get_booking(booking_id):
    """Get a single booking."""
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    return jsonify({"booking": booking.to_dict()}), 200


# ── POST /bookings ────────────────────────────
@bookings_bp.route("", methods=["POST"])
@jwt_required()
@require_role("customer")
def create_booking():
    """
    Customer creates a booking.
    Body: vehicle_id, start_date, end_date
    """
    data = request.get_json()
    user_id = int(get_jwt_identity())

    required = ["vehicle_id", "start_date", "end_date"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"'{field}' is required"}), 400

    vehicle = Vehicle.query.get(data["vehicle_id"])
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404

    if vehicle.status != "available":
        return jsonify({"error": "Vehicle is not available"}), 400

    # Check date conflict
    from datetime import datetime
    try:
        start = datetime.fromisoformat(data["start_date"])
        end = datetime.fromisoformat(data["end_date"])
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format — use ISO-8601"}), 400

    if end <= start:
        return jsonify({"error": "end_date must be after start_date"}), 400

    conflict = check_availability(vehicle.id, start, end)
    if conflict:
        return jsonify({"error": "Vehicle is already booked for the selected dates"}), 409

    # Calculate price
    total_cost = calculate_price(vehicle, start, end)

    booking = Booking(
        user_id=user_id,
        vehicle_id=vehicle.id,
        start_date=start,
        end_date=end,
        total_cost=total_cost,
        status="BOOKED",
    )
    db.session.add(booking)
    db.session.commit()

    return jsonify({
        "message": "Booking created",
        "booking": booking.to_dict(),
    }), 201


# ── PATCH /bookings/<id>/pickup ───────────────
@bookings_bp.route("/<int:booking_id>/pickup", methods=["PATCH"])
@jwt_required()
@require_role("fleet")
def pickup_booking(booking_id):
    """Fleet manager marks vehicle as picked up."""
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    ok, error = transition_status(booking, "PICKED_UP")
    if not ok:
        return jsonify({"error": error}), 400

    db.session.commit()
    return jsonify({
        "message": "Vehicle picked up",
        "booking": booking.to_dict(),
    }), 200


# ── PATCH /bookings/<id>/return ───────────────
@bookings_bp.route("/<int:booking_id>/return", methods=["PATCH"])
@jwt_required()
@require_role("fleet")
def return_booking(booking_id):
    """
    Fleet manager processes vehicle return.
    Compares actual return time vs planned — calculates late fee if any.
    """
    from datetime import datetime

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    ok, error = transition_status(booking, "RETURNED")
    if not ok:
        return jsonify({"error": error}), 400

    # Calculate late fee
    actual_return = datetime.utcnow()
    late_fee = 0.0
    if actual_return > booking.end_date:
        extra_hours = (actual_return - booking.end_date).total_seconds() / 3600
        vehicle = Vehicle.query.get(booking.vehicle_id)
        late_fee = extra_hours * vehicle.price_per_hour if vehicle else 0.0
        booking.total_cost += late_fee

    # Free the vehicle
    vehicle = Vehicle.query.get(booking.vehicle_id)
    if vehicle:
        vehicle.status = "available"

    db.session.commit()

    return jsonify({
        "message": "Vehicle returned",
        "late_fee": round(late_fee, 2),
        "booking": booking.to_dict(),
    }), 200
