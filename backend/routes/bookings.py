from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, RentalRecord, Vehicle
from datetime import datetime

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/api/bookings', methods=['POST'])
@jwt_required()
def create_booking():
    identity = get_jwt_identity()
    data = request.get_json()
    v = Vehicle.query.get_or_404(data['vehicle_id'])
    booking = RentalRecord(customer_id=identity['user_id'], vehicle_id=v.vehicle_id,
                           start_datetime=datetime.fromisoformat(data['start_date']),
                           end_datetime=datetime.fromisoformat(data['end_date']),
                           total_cost=data['total_cost'], rental_status='booked')
    db.session.add(booking)
    db.session.commit()
    return jsonify(booking.to_dict()), 201

@bookings_bp.route('/api/bookings/my', methods=['GET'])
@jwt_required()
def my_bookings():
    identity = get_jwt_identity()
    bookings = RentalRecord.query.filter_by(customer_id=identity['user_id']).all()
    return jsonify([b.to_dict() for b in bookings])
