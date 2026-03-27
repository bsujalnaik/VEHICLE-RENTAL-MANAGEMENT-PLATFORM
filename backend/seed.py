import os
from flask import Flask
from models import db, User, Vehicle, PricingRule
from werkzeug.security import generate_password_hash
from datetime import date

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'rentals.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def seed_data():
    with app.app_context():
        db.drop_all()
        db.create_all()
        u1 = User(name='Admin', email='admin@test.com', password_hash=generate_password_hash('admin123'), role='admin')
        u2 = User(name='Fleet', email='fleet@test.com', password_hash=generate_password_hash('fleet123'), role='fleet_manager')
        u3 = User(name='John', email='john@test.com', password_hash=generate_password_hash('john123'), role='customer')
        db.session.add_all([u1, u2, u3])
        v1 = Vehicle(type='car', brand='Mercedes', model='S-Class', fuel_type='petrol', price_per_hour=200, price_per_day=4000, 
                    registration_number='REG001', photo_path='https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800')
        v2 = Vehicle(type='bike', brand='Ducati', model='V4', fuel_type='petrol', price_per_hour=100, price_per_day=2000, 
                    registration_number='REG002', photo_path='https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800')
        db.session.add_all([v1, v2])
        db.session.commit()
        print("Seeded!")

if __name__ == '__main__':
    seed_data()
