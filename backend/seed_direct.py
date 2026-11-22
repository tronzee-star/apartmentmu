import sqlite3
import random
import hashlib
from datetime import datetime

LOCATIONS = ['Mukuyu', 'Town', 'Pioneer', 'Catholic Area', 'Hill Top', 'Francfort', 'Prisons']
PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Bed-sitter']

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def seed_database():
    db_path = 'propertyconnect_seed.db'
    
    # Remove existing database
    import os
    if os.path.exists(db_path):
        os.remove(db_path)
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            user_type TEXT NOT NULL,
            is_verified BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            landlord_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            property_type TEXT NOT NULL,
            location TEXT NOT NULL,
            address TEXT NOT NULL,
            monthly_rent INTEGER NOT NULL,
            deposit INTEGER NOT NULL,
            bedrooms INTEGER NOT NULL,
            bathrooms INTEGER NOT NULL,
            is_vacant BOOLEAN DEFAULT 1,
            is_active BOOLEAN DEFAULT 1,
            images TEXT DEFAULT '[]',
            amenities TEXT DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (landlord_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE viewing_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_id INTEGER NOT NULL,
            tenant_id INTEGER NOT NULL,
            landlord_id INTEGER NOT NULL,
            preferred_date DATE NOT NULL,
            preferred_time TEXT NOT NULL,
            message TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (property_id) REFERENCES properties (id),
            FOREIGN KEY (tenant_id) REFERENCES users (id),
            FOREIGN KEY (landlord_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_id INTEGER,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (property_id) REFERENCES properties (id),
            FOREIGN KEY (sender_id) REFERENCES users (id),
            FOREIGN KEY (receiver_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE saved_properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenant_id INTEGER NOT NULL,
            property_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tenant_id) REFERENCES users (id),
            FOREIGN KEY (property_id) REFERENCES properties (id),
            UNIQUE(tenant_id, property_id)
        )
    ''')
    
    conn.commit()
    
    # Create landlord
    cursor.execute('''
        INSERT INTO users (email, password_hash, full_name, phone_number, user_type, is_verified)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', ('landlord@example.com', hash_password('password123'), 'John Landlord', '+254712345678', 'landlord', 1))
    landlord_id = cursor.lastrowid
    print("Created landlord user: landlord@example.com / password123")
    
    # Generate properties
    properties_to_create = []
    
    for location in LOCATIONS:
        num_properties = random.randint(3, 4)
        for i in range(num_properties):
            property_type = random.choice(PROPERTY_TYPES)
            bedrooms = random.randint(1, 4)
            bathrooms = random.randint(1, 3)
            
            base_price = {
                'Studio': 8000,
                'Bed-sitter': 10000,
                'Apartment': 15000,
                'House': 25000
            }[property_type]
            
            monthly_rent = base_price + (bedrooms * 5000) + random.randint(-2000, 5000)
            deposit = monthly_rent
            
            titles = [
                f"Modern {property_type} in {location}",
                f"Spacious {bedrooms} Bedroom {property_type}",
                f"{property_type} Near {location} Center",
                f"Beautiful {property_type} with Great Views",
                f"Cozy {property_type} in Quiet Area",
                f"Newly Renovated {property_type}"
            ]
            
            descriptions = [
                f"This beautiful {bedrooms} bedroom {property_type} is located in the heart of {location}. "
                f"Features include {bathrooms} bathrooms, modern kitchen, and ample parking. "
                f"Perfect for families or professionals looking for a comfortable home.",
                
                f"Spacious {property_type} offering {bedrooms} bedrooms and {bathrooms} bathrooms. "
                f"Located in a prime area of {location} with easy access to amenities. "
                f"The property features modern fittings and is in excellent condition.",
                
                f"Well-maintained {property_type} in {location}. This {bedrooms} bedroom unit comes with "
                f"{bathrooms} bathrooms, a functional kitchen, and reliable water and electricity supply. "
                f"Secure neighborhood with 24-hour security available."
            ]
            
            amenities_list = [
                '["Water", "Electricity", "Parking"]',
                '["Water", "Electricity", "Parking", "Security"]',
                '["Water", "Electricity", "Parking", "Security", "Balcony"]',
                '["Water", "Electricity", "Parking", "Security", "Balcony", "Built-in Wardrobes"]',
                '["Water", "Electricity", "Parking", "Security", "Balcony", "Built-in Wardrobes", "Modern Kitchen"]'
            ]
            
            streets = ['Main St', 'Muringa Rd', 'Kenyatta Ave', 'Makuyu Rd', 'Muranga Rd']
            
            property_data = (
                landlord_id,
                random.choice(titles),
                random.choice(descriptions),
                property_type,
                location,
                f"{random.randint(1, 100)} {random.choice(streets)}, {location}",
                monthly_rent,
                deposit,
                bedrooms,
                bathrooms,
                random.choice([1, 1, 1, 0]),  # 75% vacant
                1,  # active
                '[]',  # images
                random.choice(amenities_list)
            )
            
            properties_to_create.append(property_data)
    
    # Insert properties
    cursor.executemany('''
        INSERT INTO properties (landlord_id, title, description, property_type, location, address, 
                               monthly_rent, deposit, bedrooms, bathrooms, is_vacant, is_active, images, amenities)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', properties_to_create)
    
    conn.commit()
    
    # Print summary
    print(f"\nCreated {len(properties_to_create)} properties:")
    for location in LOCATIONS:
        cursor.execute('SELECT COUNT(*) FROM properties WHERE location = ? AND landlord_id = ?', (location, landlord_id))
        count = cursor.fetchone()[0]
        print(f"  {location}: {count} properties")
    
    cursor.execute('SELECT COUNT(*) FROM properties')
    total = cursor.fetchone()[0]
    cursor.execute('SELECT COUNT(*) FROM properties WHERE is_vacant = 1')
    vacant = cursor.fetchone()[0]
    cursor.execute('SELECT COUNT(*) FROM properties WHERE is_vacant = 0')
    occupied = cursor.fetchone()[0]
    
    print(f"\nTotal properties in database: {total}")
    print(f"Vacant properties: {vacant}")
    print(f"Occupied properties: {occupied}")
    
    conn.close()

if __name__ == '__main__':
    seed_database()
