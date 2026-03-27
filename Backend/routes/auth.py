"""
Auth routes — register, login, token refresh.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from extensions import db, bcrypt
from models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# ── POST /auth/register ──────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new CUSTOMER user. Body: name, email, password."""
    data = request.get_json()

    # Validation
    required = ["name", "email", "password"]
    for field in required:
        if field not in data or not data[field]:
            return jsonify({"error": f"'{field}' is required"}), 400

    # Public registration is only for customers
    # Admin and Fleet accounts are pre-created by the system
    role = "customer"

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    # Hash password & save
    pw_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=pw_hash,
        role=role,
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
    """
    Login with email, password, and selected role.
    The selected role must match the user's actual database role.
    This prevents customers from accessing admin/fleet dashboards.
    """
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    selected_role = data.get("role", "customer")

    user = User.query.filter_by(email=data["email"]).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    # Enforce role match — customers cannot log into admin/fleet panels
    if selected_role != user.role:
        role_labels = {"admin": "Admin", "fleet": "Fleet Manager", "customer": "Customer"}
        return jsonify({
            "error": f"Access denied. This account is registered as '{role_labels.get(user.role, user.role)}'. "
                     f"Please select the correct role to continue."
        }), 403

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "email": user.email},
    )

    return jsonify({
        "message": "Login successful",
        "access_token": token,
        "user": user.to_dict(),
    }), 200


# ── POST /auth/refresh ────────────────────────
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required()
def refresh_token():
    """Issue a fresh access token using the current valid JWT."""
    user_id = get_jwt_identity()
    claims = get_jwt()

    new_token = create_access_token(
        identity=user_id,
        additional_claims={"role": claims.get("role"), "email": claims.get("email")},
    )

    return jsonify({
        "message": "Token refreshed",
        "access_token": new_token,
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
