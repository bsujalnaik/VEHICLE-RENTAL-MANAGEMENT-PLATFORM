"""
Payment routes — simulate payment, apply coupons.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Booking, Coupon
from middleware.auth import require_role
from services.booking_engine import transition_status

payments_bp = Blueprint("payments", __name__, url_prefix="/payments")


# ── POST /payments ────────────────────────────
@payments_bp.route("", methods=["POST"])
@jwt_required()
@require_role("customer")
def make_payment():
    """
    Simulate payment for a booking.
    Body: booking_id, mode (card | upi | cash), coupon_code (optional)
    """
    data = request.get_json()

    if not data or not data.get("booking_id") or not data.get("mode"):
        return jsonify({"error": "'booking_id' and 'mode' are required"}), 400

    booking = Booking.query.get(data["booking_id"])
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.status != "BOOKED":
        return jsonify({"error": f"Cannot pay — booking status is '{booking.status}'"}), 400

    # Apply coupon discount if provided
    discount = 0.0
    if data.get("coupon_code"):
        from datetime import date
        coupon = Coupon.query.filter_by(code=data["coupon_code"], active=True).first()
        if not coupon:
            return jsonify({"error": "Invalid or expired coupon code"}), 400
        if coupon.expiry and coupon.expiry < date.today():
            return jsonify({"error": "Coupon has expired"}), 400
        discount = booking.total_cost * (coupon.discount_percent / 100)

    final_amount = round(booking.total_cost - discount, 2)

    # Transition state to PAID
    ok, error = transition_status(booking, "PAID")
    if not ok:
        return jsonify({"error": error}), 400

    booking.total_cost = final_amount
    booking.payment_mode = data["mode"]
    db.session.commit()

    return jsonify({
        "message": "Payment successful",
        "receipt": {
            "booking_id": booking.id,
            "original_amount": round(final_amount + discount, 2),
            "discount": round(discount, 2),
            "final_amount": final_amount,
            "payment_mode": booking.payment_mode,
            "status": booking.status,
        },
    }), 200
