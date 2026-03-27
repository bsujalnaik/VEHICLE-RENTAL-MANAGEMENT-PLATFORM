"""
Maintenance routes — log events, block vehicles.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import MaintenanceLog, Vehicle
from middleware.auth import require_role

maintenance_bp = Blueprint("maintenance", __name__, url_prefix="/maintenance")


# ── GET /maintenance ──────────────────────────
@maintenance_bp.route("", methods=["GET"])
@jwt_required()
@require_role("admin", "fleet")
def list_logs():
    """List all maintenance logs, optionally filtered by vehicle_id."""
    vehicle_id = request.args.get("vehicle_id", type=int)
    query = MaintenanceLog.query
    if vehicle_id:
        query = query.filter_by(vehicle_id=vehicle_id)
    logs = query.order_by(MaintenanceLog.date.desc()).all()
    return jsonify({"maintenance_logs": [l.to_dict() for l in logs]}), 200


# ── POST /maintenance ─────────────────────────
@maintenance_bp.route("", methods=["POST"])
@jwt_required()
@require_role("fleet")
def create_log():
    """
    Fleet manager logs a maintenance event and blocks the vehicle.
    Body: vehicle_id, type, description, cost, next_due
    """
    data = request.get_json()

    required = ["vehicle_id", "type"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"'{field}' is required"}), 400

    vehicle = Vehicle.query.get(data["vehicle_id"])
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404

    log = MaintenanceLog(
        vehicle_id=vehicle.id,
        type=data["type"],
        description=data.get("description", ""),
        cost=data.get("cost", 0.0),
        next_due=data.get("next_due"),
    )
    db.session.add(log)

    # Block vehicle while under maintenance
    vehicle.status = "maintenance"
    db.session.commit()

    return jsonify({
        "message": "Maintenance logged — vehicle blocked",
        "log": log.to_dict(),
    }), 201


# ── PATCH /maintenance/<id>/complete ──────────
@maintenance_bp.route("/<int:log_id>/complete", methods=["PATCH"])
@jwt_required()
@require_role("fleet")
def complete_maintenance(log_id):
    """Mark maintenance as done and unblock the vehicle."""
    log = MaintenanceLog.query.get(log_id)
    if not log:
        return jsonify({"error": "Log not found"}), 404

    vehicle = Vehicle.query.get(log.vehicle_id)
    if vehicle:
        vehicle.status = "available"

    db.session.commit()
    return jsonify({
        "message": "Maintenance complete — vehicle available",
        "vehicle": vehicle.to_dict() if vehicle else None,
    }), 200
