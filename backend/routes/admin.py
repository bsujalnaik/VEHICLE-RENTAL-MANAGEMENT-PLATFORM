from flask import Blueprint, request, jsonify
from models import db, User, Vehicle
admin_bp = Blueprint('admin', __name__)
@admin_bp.route('/api/admin/stats', methods=['GET'])
def stats(): return jsonify({'revenue': 50000, 'active_rentals': 12, 'total_vehicles': 45})
