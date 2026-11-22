from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import SavedProperty, Property, User

saved_bp = Blueprint('saved_properties', __name__)

@saved_bp.route('', methods=['POST'])
@jwt_required()
def save_property():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.user_type != 'tenant':
        return jsonify({'error': 'Only tenants can save properties'}), 403
    
    data = request.get_json()
    
    if 'property_id' not in data:
        return jsonify({'error': 'property_id is required'}), 400
    
    # Check if property exists
    property = Property.query.get_or_404(data['property_id'])
    
    # Check if already saved
    existing = SavedProperty.query.filter_by(tenant_id=user_id, property_id=data['property_id']).first()
    if existing:
        return jsonify({'error': 'Property already saved'}), 400
    
    # Save property
    saved_property = SavedProperty(
        tenant_id=user_id,
        property_id=data['property_id']
    )
    
    db.session.add(saved_property)
    db.session.commit()
    
    return jsonify({
        'message': 'Property saved successfully',
        'saved_property': saved_property.to_dict()
    }), 201

@saved_bp.route('/<int:property_id>', methods=['DELETE'])
@jwt_required()
def unsave_property(property_id):
    user_id = get_jwt_identity()
    
    saved_property = SavedProperty.query.filter_by(tenant_id=user_id, property_id=property_id).first()
    
    if not saved_property:
        return jsonify({'error': 'Property not in saved list'}), 404
    
    db.session.delete(saved_property)
    db.session.commit()
    
    return jsonify({'message': 'Property removed from saved list'}), 200

@saved_bp.route('', methods=['GET'])
@jwt_required()
def get_saved_properties():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.user_type != 'tenant':
        return jsonify({'error': 'Only tenants can view saved properties'}), 403
    
    saved_properties = SavedProperty.query.filter_by(tenant_id=user_id).order_by(SavedProperty.created_at.desc()).all()
    
    # Get full property details
    properties = []
    for sp in saved_properties:
        property = Property.query.get(sp.property_id)
        if property and property.is_active:
            properties.append(property.to_dict())
    
    return jsonify({
        'properties': properties,
        'count': len(properties)
    }), 200

@saved_bp.route('/<int:property_id>/check', methods=['GET'])
@jwt_required()
def check_if_saved(property_id):
    user_id = get_jwt_identity()
    
    saved_property = SavedProperty.query.filter_by(tenant_id=user_id, property_id=property_id).first()
    
    return jsonify({'is_saved': saved_property is not None}), 200
