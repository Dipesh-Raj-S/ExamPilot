from flask import Blueprint, request, jsonify
from app.models.user import User
from app import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import secrets

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name') #here u can do data["name"] but if name is not there it will give u error,THEN app crashes
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400
        
    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "User registered successfully",
        "access_token": access_token,
        "user": user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401
        
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict() #converts a User object into a Python dictionary. 
    }), 200

@auth_bp.route('/google', methods=['POST'])
def google_login():
    data = request.get_json() or {}
    email = data.get('email')
    name = data.get('name') or "Google User"
    
    if not email:
        return jsonify({"error": "Google email missing"}), 400
        
    # Check if user already exists
    user = User.query.filter_by(email=email).first()
    
    if not user:
        # Sign up user automatically
        user = User(name=name, email=email)
        # Set a secure random password since we're using external auth
        user.set_password(secrets.token_hex(16))
        db.session.add(user)
        db.session.commit()
        
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Google Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200

#to get our profile, to update our profile

@auth_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 444
        
    if request.method == 'GET':
        return jsonify(user.to_dict()), 200
        
    elif request.method == 'PUT':
        data = request.get_json() or {}
        name = data.get('name')
        password = data.get('password')
        
        if name:
            user.name = name
        if password:
            user.set_password(password)
            
        db.session.commit()
        return jsonify({
            "message": "Profile updated successfully",
            "user": user.to_dict()
        }), 200
