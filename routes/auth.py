"""
Auth routes — register and login.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db, bcrypt
from models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# ── POST /auth/register ──────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user. Body: name, email, password, role."""
    data = request.get_json()

    # Validation
    required = ["name", "email", "password", "role"]
    for field in required:
        if field not in data or not data[field]:
            return jsonify({"error": f"'{field}' is required"}), 400

    if data["role"] not in ("customer", "admin", "fleet"):
        return jsonify({"error": "Role must be 'customer', 'admin', or 'fleet'"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    # Hash password & save
    pw_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=pw_hash,
        role=data["role"],
    )
    db.session.add(user)
    db.session.commit()

    # Issue JWT
    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "email": user.email},
    )

    return jsonify({
        "message": "User registered successfully",
        "access_token": token,
        "user": user.to_dict(),
    }), 201


# ── POST /auth/login ─────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    """Login with email & password. Returns JWT."""
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "email": user.email},
    )

    return jsonify({
        "message": "Login successful",
        "access_token": token,
        "user": user.to_dict(),
    }), 200


# ── GET /auth/me ──────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_profile():
    """Return the current user profile from the JWT."""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200
