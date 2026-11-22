from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Property, User, VALID_LOCATIONS, PROPERTY_TYPES
import cloudinary
import cloudinary.uploader

property_bp = Blueprint('properties', __name__)

@property_bp.route('', methods=['GET'])
def get_properties():
    # Get query parameters for filtering
    location = request.args.get('location')
    property_type = request.args.get('property_type')
    min_price = request.args.get('min_price', type=int)
    max_price = request.args.get('max_price', type=int)
    bedrooms = request.args.get('bedrooms', type=int)
    is_vacant = request.args.get('is_vacant')
    
    query = Property.query.filter_by(is_active=True)
    
    if location:
        if location not in VALID_LOCATIONS:
            return jsonify({'error': f'Invalid location. Valid locations are: {", ".join(VALID_LOCATIONS)}'}), 400
        query = query.filter_by(location=location)
    
    if property_type:
        if property_type not in PROPERTY_TYPES:
            return jsonify({'error': f'Invalid property type. Valid types are: {", ".join(PROPERTY_TYPES)}'}), 400
        query = query.filter_by(property_type=property_type)
    
    if min_price:
        query = query.filter(Property.monthly_rent >= min_price)
    
    if max_price:
        query = query.filter(Property.monthly_rent <= max_price)
    
    if bedrooms:
        query = query.filter_by(bedrooms=bedrooms)
    
    if is_vacant is not None:
        query = query.filter_by(is_vacant=is_vacant.lower() == 'true')
    
    properties = query.order_by(Property.created_at.desc()).all()
    
    return jsonify({
        'properties': [property.to_dict() for property in properties],
        'count': len(properties)
    }), 200

@property_bp.route('/<int:property_id>', methods=['GET'])
def get_property(property_id):
    property = Property.query.get_or_404(property_id)
    
    if not property.is_active:
        return jsonify({'error': 'Property is not available'}), 404
    
    return jsonify({'property': property.to_dict()}), 200

@property_bp.route('', methods=['POST'])
@jwt_required()
def create_property():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.user_type != 'landlord':
        return jsonify({'error': 'Only landlords can create properties'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'description', 'property_type', 'location', 'address', 
                      'monthly_rent', 'deposit', 'bedrooms', 'bathrooms']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Validate location
    if data['location'] not in VALID_LOCATIONS:
        return jsonify({'error': f'Invalid location. Valid locations are: {", ".join(VALID_LOCATIONS)}'}), 400
    
    # Validate property_type
    if data['property_type'] not in PROPERTY_TYPES:
        return jsonify({'error': f'Invalid property type. Valid types are: {", ".join(PROPERTY_TYPES)}'}), 400
    
    # Create property
    property = Property(
        landlord_id=user_id,
        title=data['title'],
        description=data['description'],
        property_type=data['property_type'],
        location=data['location'],
        address=data['address'],
        monthly_rent=data['monthly_rent'],
        deposit=data['deposit'],
        bedrooms=data['bedrooms'],
        bathrooms=data['bathrooms'],
        is_vacant=data.get('is_vacant', True),
        images=data.get('images', []),
        amenities=data.get('amenities', [])
    )
    
    db.session.add(property)
    db.session.commit()
    
    return jsonify({
        'message': 'Property created successfully',
        'property': property.to_dict()
    }), 201

@property_bp.route('/<int:property_id>', methods=['PUT'])
@jwt_required()
def update_property(property_id):
    user_id = get_jwt_identity()
    property = Property.query.get_or_404(property_id)
    
    if property.landlord_id != user_id:
        return jsonify({'error': 'You can only update your own properties'}), 403
    
    data = request.get_json()
    
    # Update fields if provided
    updatable_fields = ['title', 'description', 'property_type', 'location', 'address',
                       'monthly_rent', 'deposit', 'bedrooms', 'bathrooms', 'is_vacant',
                       'is_active', 'images', 'amenities']
    
    for field in updatable_fields:
        if field in data:
            if field == 'location' and data[field] not in VALID_LOCATIONS:
                return jsonify({'error': f'Invalid location. Valid locations are: {", ".join(VALID_LOCATIONS)}'}), 400
            if field == 'property_type' and data[field] not in PROPERTY_TYPES:
                return jsonify({'error': f'Invalid property type. Valid types are: {", ".join(PROPERTY_TYPES)}'}), 400
            setattr(property, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Property updated successfully',
        'property': property.to_dict()
    }), 200

@property_bp.route('/<int:property_id>', methods=['DELETE'])
@jwt_required()
def delete_property(property_id):
    user_id = get_jwt_identity()
    property = Property.query.get_or_404(property_id)
    
    if property.landlord_id != user_id:
        return jsonify({'error': 'You can only delete your own properties'}), 403
    
    db.session.delete(property)
    db.session.commit()
    
    return jsonify({'message': 'Property deleted successfully'}), 200

@property_bp.route('/landlord', methods=['GET'])
@jwt_required()
def get_landlord_properties():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.user_type != 'landlord':
        return jsonify({'error': 'Only landlords can view their properties'}), 403
    
    properties = Property.query.filter_by(landlord_id=user_id).order_by(Property.created_at.desc()).all()
    
    return jsonify({
        'properties': [property.to_dict() for property in properties],
        'count': len(properties)
    }), 200

@property_bp.route('/upload-image', methods=['POST'])
@jwt_required()
def upload_image():
    # This endpoint handles image upload to Cloudinary
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(file)
        
        return jsonify({
            'message': 'Image uploaded successfully',
            'url': result['secure_url'],
            'public_id': result['public_id']
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
