import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from routes.auth import auth_bp
from routes.vehicles import vehicles_bp
from routes.bookings import bookings_bp
from routes.maintenance import maintenance_bp
from routes.admin import admin_bp
from routes.notifications import notifications_bp

def create_app():
    app = Flask(__name__)
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'rentals.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'luxury-secret'
    db.init_app(app)
    CORS(app)
    JWTManager(app)
    app.register_blueprint(auth_bp)
    app.register_blueprint(vehicles_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(maintenance_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(notifications_bp)
    with app.app_context():
        db.create_all()
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
