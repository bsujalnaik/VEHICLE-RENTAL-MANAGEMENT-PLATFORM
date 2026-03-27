"""
Vehicle routes — CRUD + filtering + image upload.
"""
import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from werkzeug.utils import secure_filename
from extensions import db
from models import Vehicle
from middleware.auth import require_role

vehicles_bp = Blueprint("vehicles", __name__, url_prefix="/vehicles")

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ── POST /vehicles/upload-image ──────────────
@vehicles_bp.route("/upload-image", methods=["POST"])
@jwt_required()
@require_role("admin")
def upload_image():
    """Upload a vehicle image. Returns the URL."""
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed. Use png, jpg, jpeg, gif, or webp"}), 400

    # Generate unique filename
    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"

    upload_folder = current_app.config.get("UPLOAD_FOLDER", "static/uploads")
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, unique_name)
    file.save(filepath)

    # Return URL relative to static serving
    photo_url = f"/static/uploads/{unique_name}"
    return jsonify({"photo_url": photo_url}), 200


# ── GET /vehicles ─────────────────────────────
@vehicles_bp.route("", methods=["GET"])
@jwt_required(optional=True)
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

    # Role-based status filtering
    identity = get_jwt_identity()
    role = "customer"
    if identity:
        claims = get_jwt()
        role = claims.get("role", "customer")

    status = request.args.get("status")
    if role in ("admin", "fleet"):
        if status:
            query = query.filter(Vehicle.status == status)
        if role == "fleet":
            query = query.filter(Vehicle.fleet_manager_id == int(identity))
    else:
        # Customers can ONLY see available vehicles
        query = query.filter(Vehicle.status == "available")

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
        fleet_manager_id=data.get("fleet_manager_id"),
    )
    db.session.add(vehicle)
    db.session.commit()

    return jsonify({
        "message": "Vehicle added successfully",
        "vehicle": vehicle.to_dict(),
    }), 201


# ── PUT /vehicles/<id> (Admin + Fleet) ──────────
@vehicles_bp.route("/<int:vehicle_id>", methods=["PUT"])
@jwt_required()
@require_role("admin", "fleet")
def update_vehicle(vehicle_id):
    """Admin updates any field; Fleet manager can only toggle status on their own vehicles."""
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    role = claims.get("role", "customer")
    user_id = int(get_jwt_identity())

    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404

    # Fleet managers can only update their own vehicles' status
    if role == "fleet":
        if vehicle.fleet_manager_id != user_id:
            return jsonify({"error": "You can only update vehicles assigned to you"}), 403
        data = request.get_json()
        if "status" in data:
            vehicle.status = data["status"]
        db.session.commit()
        return jsonify({"message": "Vehicle updated", "vehicle": vehicle.to_dict()}), 200

    # Admin — full update
    data = request.get_json()
    updatable = ["brand", "model", "type", "fuel", "seats",
                 "price_per_hour", "price_per_day", "registration",
                 "fitness_expiry", "insurance_expiry", "photo_url", "status", "fleet_manager_id"]

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
