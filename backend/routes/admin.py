from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, Property

admin_bp = Blueprint('admin', __name__)

def is_admin(user_id):
    """Check if user is an admin"""
    user = User.query.get(user_id)
    return user and user.user_type == 'admin'

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    user_id = get_jwt_identity()
    
    if not is_admin(user_id):
        return jsonify({'error': 'Admin access required'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    user_type = request.args.get('user_type')
    
    query = User.query
    
    if user_type:
        query = query.filter_by(user_type=user_type)
    
    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'users': [user.to_dict() for user in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@admin_bp.route('/users/<int:user_id>/verify', methods=['PUT'])
@jwt_required()
def verify_landlord(user_id):
    admin_id = get_jwt_identity()
    
    if not is_admin(admin_id):
        return jsonify({'error': 'Admin access required'}), 403
    
    user = User.query.get_or_404(user_id)
    
    if user.user_type != 'landlord':
        return jsonify({'error': 'Only landlords can be verified'}), 400
    
    data = request.get_json()
    user.is_verified = data.get('is_verified', True)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Landlord verification status updated',
        'user': user.to_dict()
    }), 200

@admin_bp.route('/properties', methods=['GET'])
@jwt_required()
def get_all_properties():
    admin_id = get_jwt_identity()
    
    if not is_admin(admin_id):
        return jsonify({'error': 'Admin access required'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    is_active = request.args.get('is_active')
    
    query = Property.query
    
    if is_active is not None:
        query = query.filter_by(is_active=is_active.lower() == 'true')
    
    pagination = query.order_by(Property.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'properties': [property.to_dict() for property in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@admin_bp.route('/properties/<int:property_id>/toggle-active', methods=['PUT'])
@jwt_required()
def toggle_property_active(property_id):
    admin_id = get_jwt_identity()
    
    if not is_admin(admin_id):
        return jsonify({'error': 'Admin access required'}), 403
    
    property = Property.query.get_or_404(property_id)
    property.is_active = not property.is_active
    
    db.session.commit()
    
    return jsonify({
        'message': 'Property active status toggled',
        'property': property.to_dict()
    }), 200

@admin_bp.route('/properties/<int:property_id>', methods=['DELETE'])
@jwt_required()
def delete_property_admin(property_id):
    admin_id = get_jwt_identity()
    
    if not is_admin(admin_id):
        return jsonify({'error': 'Admin access required'}), 403
    
    property = Property.query.get_or_404(property_id)
    
    db.session.delete(property)
    db.session.commit()
    
    return jsonify({'message': 'Property deleted successfully'}), 200

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    admin_id = get_jwt_identity()
    
    if not is_admin(admin_id):
        return jsonify({'error': 'Admin access required'}), 403
    
    total_users = User.query.count()
    total_tenants = User.query.filter_by(user_type='tenant').count()
    total_landlords = User.query.filter_by(user_type='landlord').count()
    verified_landlords = User.query.filter_by(user_type='landlord', is_verified=True).count()
    total_properties = Property.query.count()
    active_properties = Property.query.filter_by(is_active=True).count()
    vacant_properties = Property.query.filter_by(is_vacant=True).count()
    
    return jsonify({
        'total_users': total_users,
        'total_tenants': total_tenants,
        'total_landlords': total_landlords,
        'verified_landlords': verified_landlords,
        'total_properties': total_properties,
        'active_properties': active_properties,
        'vacant_properties': vacant_properties
    }), 200
