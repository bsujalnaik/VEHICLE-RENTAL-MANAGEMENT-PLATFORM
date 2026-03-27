"""
Maintenance service — helpers for maintenance workflows.
"""
from datetime import date
from models import MaintenanceLog, Vehicle
from extensions import db


def get_overdue_vehicles():
    """Return vehicles whose maintenance next_due date has passed."""
    overdue_logs = MaintenanceLog.query.filter(
        MaintenanceLog.next_due <= date.today()
    ).all()

    vehicle_ids = list(set(log.vehicle_id for log in overdue_logs))
    vehicles = Vehicle.query.filter(Vehicle.id.in_(vehicle_ids)).all()
    return vehicles


def block_vehicle(vehicle_id: int):
    """Set a vehicle's status to 'maintenance'."""
    vehicle = Vehicle.query.get(vehicle_id)
    if vehicle:
        vehicle.status = "maintenance"
        db.session.commit()
    return vehicle


def unblock_vehicle(vehicle_id: int):
    """Set a vehicle's status back to 'available'."""
    vehicle = Vehicle.query.get(vehicle_id)
    if vehicle:
        vehicle.status = "available"
        db.session.commit()
    return vehicle
