from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Vehicle

vehicles_bp = Blueprint('vehicles', __name__)

@vehicles_bp.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    query = Vehicle.query
    vtype = request.args.get('type')
    if vtype: query = query.filter(Vehicle.type == vtype)
    search = request.args.get('search')
    if search: query = query.filter(Vehicle.brand.contains(search) | Vehicle.model.contains(search))
    vehicles = query.all()
    return jsonify([v.to_dict() for v in vehicles])

@vehicles_bp.route('/api/vehicles/<int:vid>', methods=['GET'])
def get_vehicle(vid):
    vehicle = Vehicle.query.get_or_404(vid)
    return jsonify(vehicle.to_dict())

@vehicles_bp.route('/api/vehicles', methods=['POST'])
@jwt_required()
def add_vehicle():
    identity = get_jwt_identity()
    if identity['role'] != 'admin': return jsonify({'error': 'Admin only'}), 403
    data = request.get_json()
    v = Vehicle(type=data['type'], brand=data['brand'], model=data['model'], fuel_type=data['fuel_type'],
                seating_capacity=data.get('seating_capacity'), price_per_hour=data['price_per_hour'], 
                price_per_day=data['price_per_day'], registration_number=data['registration_number'],
                photo_path=data.get('photo_path', ''))
    db.session.add(v)
    db.session.commit()
    return jsonify(v.to_dict()), 201
