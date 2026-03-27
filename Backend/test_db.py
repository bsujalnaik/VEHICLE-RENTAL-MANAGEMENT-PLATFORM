import sqlite3
import traceback

try:
    conn = sqlite3.connect('instance/vrmp.db')
    c = conn.cursor()
    c.execute("PRAGMA table_info(vehicles);")
    columns = c.fetchall()
    print("Vehicles columns:")
    for col in columns:
        print(col)
        
    c.execute("PRAGMA table_info(users);")
    columns = c.fetchall()
    print("Users columns:")
    for col in columns:
        print(col)
    
except Exception as e:
    traceback.print_exc()
