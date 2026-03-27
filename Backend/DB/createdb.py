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


if __name__ == "__main__":
    create_database()
