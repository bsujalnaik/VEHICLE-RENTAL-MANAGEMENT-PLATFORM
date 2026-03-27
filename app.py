"""
VRMP — Vehicle Rental Management Platform
Main Flask application.
"""
import os
from flask import Flask, jsonify
from config import config_by_name
from extensions import db, jwt, bcrypt, cors


def create_app(config_name=None):
    """Application factory."""
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__, static_folder="static")
    app.config.from_object(config_by_name[config_name])

    # ── Init extensions ───────────────────────
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "*"}})

    # ── Register blueprints ───────────────────
    from routes.auth import auth_bp
    from routes.vehicles import vehicles_bp
    from routes.bookings import bookings_bp
    from routes.payments import payments_bp
    from routes.maintenance import maintenance_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(vehicles_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(maintenance_bp)
    app.register_blueprint(admin_bp)

    # ── Create tables (auto) ──────────────────
    with app.app_context():
        import models  # noqa: F401 — registers models with SQLAlchemy
        db.create_all()

    # ── Error handlers ────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error"}), 500

    # ── Health check ──────────────────────────
    @app.route("/", methods=["GET"])
    def health():
        return jsonify({
            "status": "running",
            "app": "VRMP API",
            "version": "1.0.0",
        }), 200

    return app


# ── Run ───────────────────────────────────────
if __name__ == "__main__":
    app = create_app()
    os.makedirs(app.config.get("UPLOAD_FOLDER", "static/uploads"), exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=True)
