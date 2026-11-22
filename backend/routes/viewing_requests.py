from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import ViewingRequest, Property, User
from datetime import datetime

viewing_bp = Blueprint('viewing_requests', __name__)

@viewing_bp.route('', methods=['POST'])
@jwt_required()
def create_viewing_request():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.user_type != 'tenant':
        return jsonify({'error': 'Only tenants can create viewing requests'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['property_id', 'preferred_date', 'preferred_time']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if property exists and is vacant
    property = Property.query.get_or_404(data['property_id'])
    
    if not property.is_vacant:
        return jsonify({'error': 'Property is not available for viewing'}), 400
    
    # Parse date
    try:
        preferred_date = datetime.strptime(data['preferred_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Create viewing request
    viewing_request = ViewingRequest(
        property_id=data['property_id'],
        tenant_id=user_id,
        landlord_id=property.landlord_id,
        preferred_date=preferred_date,
        preferred_time=data['preferred_time'],
        message=data.get('message', ''),
        status='pending'
    )
    
    db.session.add(viewing_request)
    db.session.commit()
    
    return jsonify({
        'message': 'Viewing request created successfully',
        'viewing_request': viewing_request.to_dict()
    }), 201

@viewing_bp.route('/<int:request_id>', methods=['PUT'])
@jwt_required()
def update_viewing_request(request_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    viewing_request = ViewingRequest.query.get_or_404(request_id)
    
    # Only landlords can update viewing request status
    if user.user_type != 'landlord' or viewing_request.landlord_id != user_id:
        return jsonify({'error': 'Only the property landlord can update viewing requests'}), 403
    
    data = request.get_json()
    
    # Update status if provided
    if 'status' in data:
        valid_statuses = ['pending', 'accepted', 'declined', 'rescheduled']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Invalid status. Valid statuses are: {", ".join(valid_statuses)}'}), 400
        viewing_request.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Viewing request updated successfully',
        'viewing_request': viewing_request.to_dict()
    }), 200

@viewing_bp.route('/tenant', methods=['GET'])
@jwt_required()
def get_tenant_viewing_requests():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.user_type != 'tenant':
        return jsonify({'error': 'Only tenants can view their viewing requests'}), 403
    
    viewing_requests = ViewingRequest.query.filter_by(tenant_id=user_id).order_by(ViewingRequest.created_at.desc()).all()
    
    return jsonify({
        'viewing_requests': [vr.to_dict() for vr in viewing_requests],
        'count': len(viewing_requests)
    }), 200

@viewing_bp.route('/landlord', methods=['GET'])
@jwt_required()
def get_landlord_viewing_requests():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.user_type != 'landlord':
        return jsonify({'error': 'Only landlords can view their viewing requests'}), 403
    
    viewing_requests = ViewingRequest.query.filter_by(landlord_id=user_id).order_by(ViewingRequest.created_at.desc()).all()
    
    return jsonify({
        'viewing_requests': [vr.to_dict() for vr in viewing_requests],
        'count': len(viewing_requests)
    }), 200

@viewing_bp.route('/<int:request_id>', methods=['DELETE'])
@jwt_required()
def delete_viewing_request(request_id):
    user_id = get_jwt_identity()
    viewing_request = ViewingRequest.query.get_or_404(request_id)
    
    # Only tenant who created the request can delete it
    if viewing_request.tenant_id != user_id:
        return jsonify({'error': 'You can only delete your own viewing requests'}), 403
    
    db.session.delete(viewing_request)
    db.session.commit()
    
    return jsonify({'message': 'Viewing request deleted successfully'}), 200
