import os
from app import create_app
from extensions import db
from models import User, Vehicle, Booking, MaintenanceLog, PricingRule

app = create_app()

def seed_db():
    with app.app_context():
        print("Cleaning up Bookings, Maintenance Logs, Pricing Rules...")
        Booking.query.delete()
        MaintenanceLog.query.delete()
        PricingRule.query.delete()
        db.session.commit()
        
        print("Cleaning up Vehicles...")
        Vehicle.query.delete()
        db.session.commit()
        
        admin = User.query.filter_by(role='admin').first()
        fleet = User.query.filter_by(role='fleet').first()
        customer = User.query.filter_by(role='customer').first()
        
        keep_ids = []
        if admin: keep_ids.append(admin.id)
        if fleet: keep_ids.append(fleet.id)
        if customer: keep_ids.append(customer.id)
        
        print(f"Keeping User IDs: {keep_ids}")
        
        to_delete = User.query.filter(~User.id.in_(keep_ids)).all()
        for u in to_delete:
            db.session.delete(u)
        db.session.commit()
        print(f"Deleted {len(to_delete)} extra transient test users.")
        
        fleet_manager_id = fleet.id if fleet else None
        fleet_location = fleet.location if fleet else "Mumbai"
        
        premium_vehicles = [
            {
                "brand": "Mercedes-Benz",
                "model": "S-Class 2024",
                "type": "car",
                "fuel": "petrol",
                "seats": 4,
                "price_per_hour": 500,
                "price_per_day": 12000,
                "photo_url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop",
                "registration": "MH-01-AB-1001",
                "fleet_manager_id": fleet_manager_id,
                "status": "available"
            },
            {
                "brand": "BMW",
                "model": "M8 Competition",
                "type": "car",
                "fuel": "petrol",
                "seats": 2,
                "price_per_hour": 600,
                "price_per_day": 14000,
                "photo_url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070&auto=format&fit=crop",
                "registration": "MH-02-CD-2002",
                "fleet_manager_id": fleet_manager_id,
                "status": "available"
            },
            {
                "brand": "Audi",
                "model": "RS Q8",
                "type": "car",
                "fuel": "petrol",
                "seats": 5,
                "price_per_hour": 450,
                "price_per_day": 10500,
                "photo_url": "https://images.unsplash.com/photo-1603514652431-15fecc5bf598?q=80&w=2069&auto=format&fit=crop",
                "registration": "MH-03-EF-3003",
                "fleet_manager_id": fleet_manager_id,
                "status": "available"
            },
            {
                "brand": "Land Rover",
                "model": "Range Rover SV",
                "type": "car",
                "fuel": "diesel",
                "seats": 5,
                "price_per_hour": 700,
                "price_per_day": 16000,
                "photo_url": "https://images.unsplash.com/photo-1629897048514-3831d102e3dc?q=80&w=2070&auto=format&fit=crop",
                "registration": "KA-01-GH-4004",
                "fleet_manager_id": fleet_manager_id,
                "status": "available"
            },
            {
                "brand": "Porsche",
                "model": "911 Carrera S",
                "type": "car",
                "fuel": "petrol",
                "seats": 2,
                "price_per_hour": 800,
                "price_per_day": 18000,
                "photo_url": "https://images.unsplash.com/photo-1503376712351-4048ca33a778?q=80&w=2074&auto=format&fit=crop",
                "registration": "DL-01-JK-5005",
                "fleet_manager_id": fleet_manager_id,
                "status": "available"
            },
            {
                "brand": "Tesla",
                "model": "Model S Plaid",
                "type": "car",
                "fuel": "electric",
                "seats": 5,
                "price_per_hour": 550,
                "price_per_day": 13000,
                "photo_url": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop",
                "registration": "KA-05-MN-6006",
                "fleet_manager_id": fleet_manager_id,
                "status": "available"
            },
            {
                "brand": "Volvo",
                "model": "XC90 Recharge",
                "type": "car",
                "fuel": "hybrid",
                "seats": 7,
                "price_per_hour": 400,
                "price_per_day": 9500,
                "photo_url": "https://images.unsplash.com/photo-1620614138166-5e0f7e155bc8?q=80&w=2070&auto=format&fit=crop",
                "registration": "MH-12-PQ-7007",
                "fleet_manager_id": fleet_manager_id,
                "status": "available"
            },
            {
                "brand": "Aston Martin",
                "model": "DBX 707",
                "type": "car",
                "fuel": "petrol",
                "seats": 5,
                "price_per_hour": 900,
                "price_per_day": 21000,
                "photo_url": "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?q=80&w=2069&auto=format&fit=crop",
                "registration": "MH-14-RS-8008",
                "fleet_manager_id": fleet_manager_id,
                "status": "available"
            },
            {
                "brand": "Lexus",
                "model": "LC 500",
                "type": "car",
                "fuel": "petrol",
                "seats": 2,
                "price_per_hour": 500,
                "price_per_day": 11500,
                "photo_url": "https://images.unsplash.com/photo-1609520847970-0777ce22d308?q=80&w=2065&auto=format&fit=crop",
                "registration": "TS-09-UV-9009",
                "fleet_manager_id": fleet_manager_id,
                "status": "available"
            },
            {
                "brand": "Mercedes-AMG",
                "model": "G63",
                "type": "car",
                "fuel": "petrol",
                "seats": 5,
                "price_per_hour": 750,
                "price_per_day": 17000,
                "photo_url": "https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2069&auto=format&fit=crop",
                "registration": "HR-26-WX-1010",
                "fleet_manager_id": fleet_manager_id,
                "status": "available"
            }
        ]

        for v_data in premium_vehicles:
            v = Vehicle(**v_data)
            db.session.add(v)
            
        db.session.commit()
        print("10 Premium Vehicles have been securely added to the fleet!")

if __name__ == "__main__":
    seed_db()
