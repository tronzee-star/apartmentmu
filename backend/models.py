from extensions import db
from flask_bcrypt import generate_password_hash, check_password_hash
from datetime import datetime

# Valid locations in Murang'a County
VALID_LOCATIONS = [
    'Mukuyu',
    'Town',
    'Pioneer',
    'Catholic Area',
    'Hill Top',
    'Francfort',
    'Prisons'
]

# Property types
PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Bed-sitter']

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # 'tenant' or 'landlord'
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    properties = db.relationship('Property', backref='landlord', lazy=True, cascade='all, delete-orphan')
    viewing_requests = db.relationship('ViewingRequest', foreign_keys='ViewingRequest.tenant_id', backref='tenant', lazy=True)
    received_viewing_requests = db.relationship('ViewingRequest', foreign_keys='ViewingRequest.landlord_id', backref='landlord', lazy=True)
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy=True)
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver', lazy=True)
    saved_properties = db.relationship('SavedProperty', backref='tenant', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'phone_number': self.phone_number,
            'user_type': self.user_type,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat()
        }

class Property(db.Model):
    __tablename__ = 'properties'
    
    id = db.Column(db.Integer, primary_key=True)
    landlord_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    property_type = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    monthly_rent = db.Column(db.Integer, nullable=False)
    deposit = db.Column(db.Integer, nullable=False)
    bedrooms = db.Column(db.Integer, nullable=False)
    bathrooms = db.Column(db.Integer, nullable=False)
    is_vacant = db.Column(db.Boolean, default=True)
    is_active = db.Column(db.Boolean, default=True)
    images = db.Column(db.JSON, default=list)  # List of Cloudinary image URLs
    amenities = db.Column(db.JSON, default=list)  # List of amenities
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    viewing_requests = db.relationship('ViewingRequest', backref='property', lazy=True, cascade='all, delete-orphan')
    messages = db.relationship('Message', backref='property', lazy=True)
    saved_by = db.relationship('SavedProperty', backref='property', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'landlord_id': self.landlord_id,
            'title': self.title,
            'description': self.description,
            'property_type': self.property_type,
            'location': self.location,
            'address': self.address,
            'monthly_rent': self.monthly_rent,
            'deposit': self.deposit,
            'bedrooms': self.bedrooms,
            'bathrooms': self.bathrooms,
            'is_vacant': self.is_vacant,
            'is_active': self.is_active,
            'images': self.images,
            'amenities': self.amenities,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ViewingRequest(db.Model):
    __tablename__ = 'viewing_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    tenant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    landlord_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    preferred_date = db.Column(db.Date, nullable=False)
    preferred_time = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'accepted', 'declined', 'rescheduled'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'tenant_id': self.tenant_id,
            'landlord_id': self.landlord_id,
            'preferred_date': self.preferred_date.isoformat() if self.preferred_date else None,
            'preferred_time': self.preferred_time,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'content': self.content,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }

class SavedProperty(db.Model):
    __tablename__ = 'saved_properties'
    
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('tenant_id', 'property_id', name='unique_saved_property'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'property_id': self.property_id,
            'created_at': self.created_at.isoformat()
        }
