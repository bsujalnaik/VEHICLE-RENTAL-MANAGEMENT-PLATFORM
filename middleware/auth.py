"""
JWT authentication middleware and role-based access control.
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request


def require_role(*allowed_roles):
    """
    Decorator that restricts access to users whose JWT 'role' claim
    matches one of the allowed roles.

    Usage:
        @require_role("admin")
        @require_role("admin", "fleet")
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role", "")
            if user_role not in allowed_roles:
                return jsonify({"error": "Forbidden — insufficient permissions"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
