import os
from app import create_app
from extensions import db, bcrypt
from models import User, Vehicle, PricingRule
from datetime import date, timedelta

app = create_app()

def seed_db():
    with app.app_context():
        # Clean up existing tables and recreate
        db.drop_all()
        db.create_all()

        print("Seeding Users...")
        admin = User(name="Admin User", email="admin@vrmp.com", password_hash=bcrypt.generate_password_hash("password").decode('utf-8'), role="admin")
        fleet = User(name="Fleet Manager", email="fleet@vrmp.com", password_hash=bcrypt.generate_password_hash("password").decode('utf-8'), role="fleet")
        customer = User(name="Jane Customer", email="customer@vrmp.com", password_hash=bcrypt.generate_password_hash("password").decode('utf-8'), role="customer")
        db.session.add_all([admin, fleet, customer])

        print("Seeding Vehicles...")
        v1 = Vehicle(brand="Tesla", model="Model 3", type="car", fuel="electric", seats=5, price_per_hour=25, price_per_day=150, registration="TS-01-EV-2024", photo_url="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80")
        v2 = Vehicle(brand="BMW", model="X5", type="car", fuel="diesel", seats=5, price_per_hour=35, price_per_day=200, registration="BW-02-SUV-2023", photo_url="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80")
        v3 = Vehicle(brand="Honda", model="CR-V", type="car", fuel="petrol", seats=5, price_per_hour=15, price_per_day=90, registration="HN-03-CRV-2022", photo_url="https://images.unsplash.com/photo-1568844293986-8d0400ba4724?w=800&q=80")
        v4 = Vehicle(brand="Mercedes", model="Sprinter", type="van", fuel="diesel", seats=12, price_per_hour=40, price_per_day=250, registration="MC-04-VAN-2023", photo_url="https://images.unsplash.com/photo-1616422285623-14ffbd9f491c?w=800&q=80")
        db.session.add_all([v1, v2, v3, v4])

        print("Seeding Pricing Rules...")
        r1 = PricingRule(name="Weekend Premium", type="weekend", multiplier=1.15, active=True)
        r2 = PricingRule(name="Summer Holiday", type="seasonal", multiplier=1.25, start_date=date(2025, 6, 1), end_date=date(2025, 8, 31), active=True)
        db.session.add_all([r1, r2])

        db.session.commit()
        print("Database seeded successfully with 3 users, 4 vehicles, and 2 pricing rules.")

if __name__ == "__main__":
    seed_db()
