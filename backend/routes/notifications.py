from flask import Blueprint, request, jsonify
notifications_bp = Blueprint('notifications', __name__)
@notifications_bp.route('/api/notifications', methods=['GET'])
def get_notifications(): return jsonify([])
