import random
from app import app, db
from models import User, Property

LOCATIONS = ['Mukuyu', 'Town', 'Pioneer', 'Catholic Area', 'Hill Top', 'Francfort', 'Prisons']
PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Bed-sitter']

def seed_database():
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create landlord
        landlord = User(
            email='landlord@example.com',
            full_name='John Landlord',
            phone_number='+254712345678',
            user_type='landlord',
            is_verified=True
        )
        landlord.set_password('password123')
        db.session.add(landlord)
        db.session.commit()
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
                    ["Water", "Electricity", "Parking"],
                    ["Water", "Electricity", "Parking", "Security"],
                    ["Water", "Electricity", "Parking", "Security", "Balcony"],
                    ["Water", "Electricity", "Parking", "Security", "Balcony", "Built-in Wardrobes"],
                    ["Water", "Electricity", "Parking", "Security", "Balcony", "Built-in Wardrobes", "Modern Kitchen"]
                ]
                
                streets = ['Main St', 'Muringa Rd', 'Kenyatta Ave', 'Makuyu Rd', 'Muranga Rd']
                
                property_obj = Property(
                    landlord_id=landlord.id,
                    title=random.choice(titles),
                    description=random.choice(descriptions),
                    property_type=property_type,
                    location=location,
                    address=f"{random.randint(1, 100)} {random.choice(streets)}, {location}",
                    monthly_rent=monthly_rent,
                    deposit=deposit,
                    bedrooms=bedrooms,
                    bathrooms=bathrooms,
                    is_vacant=random.choice([True, True, True, False]),
                    is_active=True,
                    images=[],
                    amenities=random.choice(amenities_list)
                )
                
                properties_to_create.append(property_obj)
        
        db.session.add_all(properties_to_create)
        db.session.commit()
        
        print(f"\nCreated {len(properties_to_create)} properties:")
        for location in LOCATIONS:
            count = Property.query.filter_by(location=location, landlord_id=landlord.id).count()
            print(f"  {location}: {count} properties")
        
        print(f"\nTotal properties in database: {Property.query.count()}")
        print(f"Vacant properties: {Property.query.filter_by(is_vacant=True).count()}")
        print(f"Occupied properties: {Property.query.filter_by(is_vacant=False).count()}")

if __name__ == '__main__':
    seed_database()
