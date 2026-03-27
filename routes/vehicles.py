"""
Vehicle routes — CRUD + filtering.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Vehicle
from middleware.auth import require_role

vehicles_bp = Blueprint("vehicles", __name__, url_prefix="/vehicles")


# ── GET /vehicles ─────────────────────────────
@vehicles_bp.route("", methods=["GET"])
def list_vehicles():
    """
    List vehicles with optional filters.
    Query params: type, fuel, seats, max_price, status
    """
    query = Vehicle.query

    # Filters
    v_type = request.args.get("type")
    if v_type:
        query = query.filter(Vehicle.type == v_type)

    fuel = request.args.get("fuel")
    if fuel:
        query = query.filter(Vehicle.fuel == fuel)

    seats = request.args.get("seats", type=int)
    if seats:
        query = query.filter(Vehicle.seats >= seats)

    max_price = request.args.get("max_price", type=float)
    if max_price:
        query = query.filter(Vehicle.price_per_day <= max_price)

    status = request.args.get("status", "available")
    query = query.filter(Vehicle.status == status)

    vehicles = query.all()
    return jsonify({"vehicles": [v.to_dict() for v in vehicles]}), 200


# ── GET /vehicles/<id> ────────────────────────
@vehicles_bp.route("/<int:vehicle_id>", methods=["GET"])
def get_vehicle(vehicle_id):
    """Get full detail of a single vehicle."""
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404
    return jsonify({"vehicle": vehicle.to_dict()}), 200


# ── POST /vehicles (Admin only) ──────────────
@vehicles_bp.route("", methods=["POST"])
@jwt_required()
@require_role("admin")
def create_vehicle():
    """Admin adds a new vehicle."""
    data = request.get_json()

    required = ["brand", "model", "type", "fuel", "seats",
                 "price_per_hour", "price_per_day", "registration"]
    for field in required:
        if field not in data or data[field] is None:
            return jsonify({"error": f"'{field}' is required"}), 400

    if Vehicle.query.filter_by(registration=data["registration"]).first():
        return jsonify({"error": "Vehicle with this registration already exists"}), 409

    vehicle = Vehicle(
        brand=data["brand"],
        model=data["model"],
        type=data["type"],
        fuel=data["fuel"],
        seats=data["seats"],
        price_per_hour=data["price_per_hour"],
        price_per_day=data["price_per_day"],
        registration=data["registration"],
        fitness_expiry=data.get("fitness_expiry"),
        insurance_expiry=data.get("insurance_expiry"),
        photo_url=data.get("photo_url"),
        status=data.get("status", "available"),
    )
    db.session.add(vehicle)
    db.session.commit()

    return jsonify({
        "message": "Vehicle added successfully",
        "vehicle": vehicle.to_dict(),
    }), 201


# ── PUT /vehicles/<id> (Admin only) ──────────
@vehicles_bp.route("/<int:vehicle_id>", methods=["PUT"])
@jwt_required()
@require_role("admin")
def update_vehicle(vehicle_id):
    """Admin updates vehicle details."""
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404

    data = request.get_json()
    updatable = ["brand", "model", "type", "fuel", "seats",
                 "price_per_hour", "price_per_day", "registration",
                 "fitness_expiry", "insurance_expiry", "photo_url", "status"]

    for field in updatable:
        if field in data:
            setattr(vehicle, field, data[field])

    db.session.commit()
    return jsonify({
        "message": "Vehicle updated",
        "vehicle": vehicle.to_dict(),
    }), 200


# ── DELETE /vehicles/<id> (Admin only) ────────
@vehicles_bp.route("/<int:vehicle_id>", methods=["DELETE"])
@jwt_required()
@require_role("admin")
def delete_vehicle(vehicle_id):
    """Admin removes a vehicle."""
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404

    db.session.delete(vehicle)
    db.session.commit()
    return jsonify({"message": "Vehicle deleted"}), 200
