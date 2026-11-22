from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Message, User, Property

message_bp = Blueprint('messages', __name__)

@message_bp.route('', methods=['POST'])
@jwt_required()
def create_message():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['receiver_id', 'content']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if receiver exists
    receiver = User.query.get_or_404(data['receiver_id'])
    
    # Check if property exists (optional)
    if 'property_id' in data and data['property_id']:
        Property.query.get_or_404(data['property_id'])
    
    # Create message
    message = Message(
        sender_id=user_id,
        receiver_id=data['receiver_id'],
        property_id=data.get('property_id'),
        content=data['content']
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        'message': 'Message sent successfully',
        'message_data': message.to_dict()
    }), 201

@message_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()
    
    # Get all unique conversations for the user
    sent_messages = Message.query.filter_by(sender_id=user_id).all()
    received_messages = Message.query.filter_by(receiver_id=user_id).all()
    
    # Build list of unique conversation partners
    conversation_partners = {}
    
    for msg in sent_messages:
        if msg.receiver_id not in conversation_partners:
            conversation_partners[msg.receiver_id] = {
                'user_id': msg.receiver_id,
                'property_id': msg.property_id,
                'last_message': msg.content,
                'last_message_time': msg.created_at
            }
        else:
            if msg.created_at > conversation_partners[msg.receiver_id]['last_message_time']:
                conversation_partners[msg.receiver_id]['last_message'] = msg.content
                conversation_partners[msg.receiver_id]['last_message_time'] = msg.created_at
    
    for msg in received_messages:
        if msg.sender_id not in conversation_partners:
            conversation_partners[msg.sender_id] = {
                'user_id': msg.sender_id,
                'property_id': msg.property_id,
                'last_message': msg.content,
                'last_message_time': msg.created_at
            }
        else:
            if msg.created_at > conversation_partners[msg.sender_id]['last_message_time']:
                conversation_partners[msg.sender_id]['last_message'] = msg.content
                conversation_partners[msg.sender_id]['last_message_time'] = msg.created_at
    
    # Get user details for each partner
    conversations = []
    for partner_id, conv_data in conversation_partners.items():
        partner = User.query.get(partner_id)
        if partner:
            conversations.append({
                'user': partner.to_dict(),
                'property_id': conv_data['property_id'],
                'last_message': conv_data['last_message'],
                'last_message_time': conv_data['last_message_time'].isoformat()
            })
    
    # Sort by last message time
    conversations.sort(key=lambda x: x['last_message_time'], reverse=True)
    
    return jsonify({'conversations': conversations}), 200

@message_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_messages_with_user(user_id):
    current_user_id = get_jwt_identity()
    property_id = request.args.get('property_id', type=int)
    
    # Get messages between current user and specified user
    query = Message.query.filter(
        ((Message.sender_id == current_user_id) & (Message.receiver_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.receiver_id == current_user_id))
    )
    
    if property_id:
        query = query.filter_by(property_id=property_id)
    
    messages = query.order_by(Message.created_at.asc()).all()
    
    # Mark received messages as read
    for msg in messages:
        if msg.receiver_id == current_user_id and not msg.is_read:
            msg.is_read = True
    
    db.session.commit()
    
    return jsonify({
        'messages': [msg.to_dict() for msg in messages],
        'count': len(messages)
    }), 200

@message_bp.route('/<int:message_id>/read', methods=['PUT'])
@jwt_required()
def mark_message_as_read(message_id):
    user_id = get_jwt_identity()
    message = Message.query.get_or_404(message_id)
    
    if message.receiver_id != user_id:
        return jsonify({'error': 'You can only mark messages sent to you as read'}), 403
    
    message.is_read = True
    db.session.commit()
    
    return jsonify({'message': 'Message marked as read'}), 200

@message_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    user_id = get_jwt_identity()
    
    unread_count = Message.query.filter_by(receiver_id=user_id, is_read=False).count()
    
    return jsonify({'unread_count': unread_count}), 200
