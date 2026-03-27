import sqlite3
import os

# Database will be created in the DB folder
DB_PATH = os.path.join(os.path.dirname(__file__), "vehicle_rental.db")


def create_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Enable foreign key enforcement
    cursor.execute("PRAGMA foreign_keys = ON;")

    # ─────────────────────────────────────────────
    # TABLE 1: users
    # Covers all roles: admin, customer, fleet_manager
    # ─────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id                 INTEGER PRIMARY KEY AUTOINCREMENT,
            name                    TEXT    NOT NULL,
            email                   TEXT    NOT NULL UNIQUE,
            password_hash           TEXT    NOT NULL,
            phone                   TEXT,
            role                    TEXT    NOT NULL CHECK(role IN ('admin', 'customer', 'fleet_manager')),
            driving_license_number  TEXT    UNIQUE,          -- customers only
            assigned_zone           TEXT,                    -- fleet_managers only (optional)
            is_active               INTEGER NOT NULL DEFAULT 1,  -- 1=active, 0=deactivated by admin
            created_at              DATETIME DEFAULT (datetime('now'))
        );
    """)

    # ─────────────────────────────────────────────
    # TABLE 2: vehicles
    # Full CRUD by admin; read by customers; status update by fleet manager
    # ─────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vehicles (
            vehicle_id              INTEGER PRIMARY KEY AUTOINCREMENT,
            type                    TEXT    NOT NULL CHECK(type IN ('car', 'bike', 'van')),
            brand                   TEXT    NOT NULL,
            model                   TEXT    NOT NULL,
            fuel_type               TEXT    NOT NULL CHECK(fuel_type IN ('petrol', 'diesel', 'electric', 'cng')),
            seating_capacity        INTEGER,
            price_per_hour          REAL    NOT NULL,
            price_per_day           REAL    NOT NULL,
            availability_status     TEXT    NOT NULL DEFAULT 'available'
                                        CHECK(availability_status IN ('available', 'rented', 'maintenance')),
            registration_number     TEXT    NOT NULL UNIQUE,
            fitness_expiry          DATE,
            insurance_expiry        DATE,
            photo_path              TEXT,                    -- path to static image file
            created_at              DATETIME DEFAULT (datetime('now'))
        );
    """)

    # ─────────────────────────────────────────────
    # TABLE 3: pricing_rules
    # Managed by admin; read by customers during booking
    # ─────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pricing_rules (
            rule_id                 INTEGER PRIMARY KEY AUTOINCREMENT,
            rule_name               TEXT    NOT NULL,
            rule_type               TEXT    NOT NULL CHECK(rule_type IN ('seasonal', 'weekend', 'late_fee', 'coupon')),
            multiplier              REAL    NOT NULL DEFAULT 1.0,   -- e.g. 1.5 = 50% surge
            flat_fee                REAL    NOT NULL DEFAULT 0.0,   -- e.g. fixed late return charge
            discount_code           TEXT    UNIQUE,                 -- coupon codes only
            discount_percent        REAL,                           -- e.g. 10.0 = 10% off
            valid_from              DATE,
            valid_to                DATE,
            is_active               INTEGER NOT NULL DEFAULT 1
        );
    """)

    # ─────────────────────────────────────────────
    # TABLE 4: rental_records
    # Created by customer; pickup & return confirmed by fleet manager; managed by admin
    # ─────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rental_records (
            rental_id               INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id             INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
            vehicle_id              INTEGER NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT,
            pricing_rule_id         INTEGER REFERENCES pricing_rules(rule_id) ON DELETE SET NULL,
            start_datetime          DATETIME NOT NULL,
            end_datetime            DATETIME NOT NULL,              -- expected return
            actual_return_datetime  DATETIME,                      -- set by fleet manager on return
            total_cost              REAL,                          -- calculated at booking; updated on late return
            payment_mode            TEXT    CHECK(payment_mode IN ('cash', 'card', 'upi')),
            payment_status          TEXT    NOT NULL DEFAULT 'pending'
                                        CHECK(payment_status IN ('pending', 'paid', 'refunded')),
            rental_status           TEXT    NOT NULL DEFAULT 'booked'
                                        CHECK(rental_status IN ('booked', 'picked_up', 'returned', 'cancelled')),
            created_at              DATETIME DEFAULT (datetime('now'))
        );
    """)

    # ─────────────────────────────────────────────
    # TABLE 5: fleet_vehicle_assignments
    # Admin assigns vehicles to fleet managers
    # Determines which vehicles a fleet manager can manage
    # ─────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS fleet_vehicle_assignments (
            assignment_id           INTEGER PRIMARY KEY AUTOINCREMENT,
            fleet_manager_id        INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            vehicle_id              INTEGER NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
            assigned_date           DATE    DEFAULT (date('now')),
            is_active               INTEGER NOT NULL DEFAULT 1,    -- 0 = unassigned by admin
            UNIQUE(fleet_manager_id, vehicle_id)                   -- no duplicate assignments
        );
    """)

    # ─────────────────────────────────────────────
    # TABLE 6: maintenance_logs
    # Logged by fleet manager for their assigned vehicles
    # ─────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS maintenance_logs (
            log_id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_id              INTEGER NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
            fleet_manager_id        INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
            maintenance_type        TEXT    NOT NULL CHECK(maintenance_type IN ('routine', 'repair', 'inspection', 'cleaning')),
            description             TEXT,
            cost                    REAL,
            maintenance_date        DATE    NOT NULL,
            next_due_date           DATE
        );
    """)

    # ─────────────────────────────────────────────
    # TABLE 7: notifications
    # Auto-generated alerts for all roles
    # ─────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            notification_id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id                 INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            message                 TEXT    NOT NULL,
            is_read                 INTEGER NOT NULL DEFAULT 0,     -- 0=unread, 1=read
            created_at              DATETIME DEFAULT (datetime('now'))
        );
    """)

    conn.commit()
    conn.close()
    print(f"[OK] Database created successfully at: {DB_PATH}")
    print("[OK] Tables created:")
    print("    1. users                      (admin, customer, fleet_manager)")
    print("    2. vehicles                   (fleet inventory)")
    print("    3. pricing_rules              (seasonal, weekend, late_fee, coupon)")
    print("    4. rental_records             (booking lifecycle)")
    print("    5. fleet_vehicle_assignments  (vehicle -> fleet manager mapping)")
    print("    6. maintenance_logs           (fleet manager logs)")
    print("    7. notifications              (alerts for all roles)")


def seed_sample_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Keep demo setup deterministic for hackathon testing.
    cursor.execute("DELETE FROM notifications;")
    cursor.execute("DELETE FROM maintenance_logs;")
    cursor.execute("DELETE FROM fleet_vehicle_assignments;")
    cursor.execute("DELETE FROM rental_records;")
    cursor.execute("DELETE FROM pricing_rules;")
    cursor.execute("DELETE FROM vehicles;")
    cursor.execute("DELETE FROM users;")

    users = [
        ("Admin User", "admin@rental.com", "admin123", "9999999999", "admin", None, "HQ"),
        ("Fleet Manager One", "fleet1@rental.com", "fleet123", "8888888888", "fleet_manager", None, "North Zone"),
        ("Fleet Manager Two", "fleet2@rental.com", "fleet234", "7777777777", "fleet_manager", None, "South Zone"),
        ("Customer One", "customer1@rental.com", "cust123", "6666666666", "customer", "DL1234567890", None),
        ("Customer Two", "customer2@rental.com", "cust234", "5555555555", "customer", "DL0987654321", None),
    ]
    cursor.executemany(
        """
        INSERT INTO users (
            name, email, password_hash, phone, role, driving_license_number, assigned_zone
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        users,
    )

    vehicles = [
        ("car", "Toyota", "Innova", "diesel", 7, 250.0, 2500.0, "available", "KA01AB1234", "2027-01-10", "2026-12-15", "/static/images/innova.jpg"),
        ("car", "Tesla", "Model 3", "electric", 5, 400.0, 3800.0, "available", "KA01EV2026", "2027-03-01", "2027-02-01", "/static/images/model3.jpg"),
        ("bike", "Yamaha", "FZ", "petrol", 2, 90.0, 700.0, "available", "KA02BI7777", "2026-11-20", "2026-10-15", "/static/images/fz.jpg"),
        ("van", "Force", "Traveller", "diesel", 12, 320.0, 3000.0, "maintenance", "KA03VN9001", "2026-09-30", "2026-09-30", "/static/images/traveller.jpg"),
    ]
    cursor.executemany(
        """
        INSERT INTO vehicles (
            type, brand, model, fuel_type, seating_capacity, price_per_hour, price_per_day,
            availability_status, registration_number, fitness_expiry, insurance_expiry, photo_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        vehicles,
    )

    rules = [
        ("Weekend Surge", "weekend", 1.2, 0.0, None, None, "2025-01-01", "2027-12-31", 1),
        ("Summer Seasonal", "seasonal", 1.1, 0.0, None, None, "2026-03-01", "2026-06-30", 1),
        ("Late Return Penalty", "late_fee", 1.0, 300.0, None, None, "2025-01-01", "2027-12-31", 1),
        ("HACK10 Coupon", "coupon", 1.0, 0.0, "HACK10", 10.0, "2025-01-01", "2027-12-31", 1),
    ]
    cursor.executemany(
        """
        INSERT INTO pricing_rules (
            rule_name, rule_type, multiplier, flat_fee, discount_code, discount_percent,
            valid_from, valid_to, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        rules,
    )

    assignments = [
        (2, 1, 1),
        (2, 3, 1),
        (3, 2, 1),
        (3, 4, 1),
    ]
    cursor.executemany(
        """
        INSERT INTO fleet_vehicle_assignments (fleet_manager_id, vehicle_id, is_active)
        VALUES (?, ?, ?)
        """,
        assignments,
    )

    rentals = [
        (4, 1, None, "2026-03-28T09:00:00", "2026-03-29T09:00:00", None, 2750.0, "cash", "pending", "booked"),
        (5, 2, None, "2026-03-25T10:00:00", "2026-03-26T18:00:00", "2026-03-26T17:30:00", 5800.0, "upi", "paid", "returned"),
        (4, 3, None, "2026-03-27T15:00:00", "2026-03-27T20:00:00", None, 540.0, "card", "pending", "picked_up"),
    ]
    cursor.executemany(
        """
        INSERT INTO rental_records (
            customer_id, vehicle_id, pricing_rule_id, start_datetime, end_datetime, actual_return_datetime,
            total_cost, payment_mode, payment_status, rental_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        rentals,
    )

    maintenance = [
        (4, 3, "routine", "Oil and brake check", 2200.0, "2026-03-20", "2026-06-20"),
        (1, 2, "inspection", "Post-trip inspection", 500.0, "2026-03-26", "2026-04-26"),
    ]
    cursor.executemany(
        """
        INSERT INTO maintenance_logs (
            vehicle_id, fleet_manager_id, maintenance_type, description, cost, maintenance_date, next_due_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        maintenance,
    )

    notifications = [
        (4, "Your booking #1 is confirmed."),
        (2, "Vehicle KA01AB1234 pickup scheduled at 09:00."),
        (1, "2 new bookings were created today."),
    ]
    cursor.executemany(
        """
        INSERT INTO notifications (user_id, message) VALUES (?, ?)
        """,
        notifications,
    )

    # Keep vehicle 3 in rented status due to active picked_up booking.
    cursor.execute("UPDATE vehicles SET availability_status = 'rented' WHERE vehicle_id = 3;")

    conn.commit()
    conn.close()
    print("[OK] Sample data seeded.")
    print("[TEST CREDENTIALS]")
    print("  Admin        -> admin@rental.com / admin123")
    print("  FleetManager -> fleet1@rental.com / fleet123")
    print("  Customer     -> customer1@rental.com / cust123")


if __name__ == "__main__":
    create_database()
    seed_sample_data()
