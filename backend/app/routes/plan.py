from flask import Blueprint, request, jsonify
from app.models.plan import ExamPlan
from app.models.hotel import HotelRecommendation
from app.models.restaurant import RestaurantRecommendation
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.planning_engine import PlanningEngine
from app.services.hotel_engine import HotelEngine
from app.services.restaurant_engine import RestaurantEngine
import datetime

plan_bp = Blueprint('plan', __name__)

@plan_bp.route('', methods=['POST'])
@jwt_required()
def create_plan():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    # Required inputs
    exam_name = data.get('exam_name')
    exam_date_str = data.get('exam_date')
    exam_time_str = data.get('exam_time')
    home_city = data.get('home_city')
    center_name = data.get('center_name')
    center_city = data.get('center_city')
    center_address = data.get('center_address')
    travel_mode = data.get('travel_mode')
    budget = data.get('budget')
    arrival_preference = data.get('arrival_preference')
    accommodation_required = data.get('accommodation_required', True)
    
    if not all([exam_name, exam_date_str, exam_time_str, home_city, center_name, center_city, center_address, travel_mode, budget, arrival_preference]):
        return jsonify({"error": "Missing required fields"}), 400
        
    try:
        exam_date = datetime.datetime.strptime(exam_date_str, "%Y-%m-%d").date()
        exam_time = datetime.datetime.strptime(exam_time_str, "%H:%M").time()
    except ValueError as e:
        return jsonify({"error": f"Invalid date or time format: {str(e)}"}), 400
        
    # 1. Run Travel Planning Engine
    travel_info = PlanningEngine.generate_plan(
        exam_date=exam_date,
        exam_time=exam_time,
        home_city=home_city,
        center_city=center_city,
        travel_mode=travel_mode,
        arrival_preference=arrival_preference,
        accommodation_required=accommodation_required
    )
    
    # 2. Create Plan Model
    new_plan = ExamPlan(
        user_id=user_id,
        exam_name=exam_name,
        exam_date=exam_date,
        exam_time=exam_time,
        home_city=home_city,
        center_name=center_name,
        center_city=center_city,
        center_address=center_address,
        travel_mode=travel_mode,
        budget=budget,
        arrival_preference=arrival_preference,
        accommodation_required=accommodation_required,
        
        # Output from planning engine
        departure_date=travel_info['departure_date'],
        arrival_date=travel_info['arrival_date'],
        travel_duration=travel_info['travel_duration'],
        travel_checklist=travel_info['travel_checklist'],
        route_overview=travel_info['route_overview']
    )
    
    db.session.add(new_plan)
    db.session.flush() # Populate plan ID for recommendations
    
    # 3. Run Hotel recommendation engine if required
    if accommodation_required:
        hotels = HotelEngine.get_recommendations(
            center_city=center_city,
            center_name=center_name,
            budget=budget
        )
        for h in hotels:
            hotel_rec = HotelRecommendation(
                exam_plan_id=new_plan.id,
                hotel_name=h['hotel_name'],
                rating=h['rating'],
                distance=h['distance'],
                estimated_price=h['estimated_price']
            )
            db.session.add(hotel_rec)
            
    # 4. Run Food recommendation engine
    restaurants = RestaurantEngine.get_recommendations(
        center_city=center_city,
        center_name=center_name
    )
    for r in restaurants:
        rest_rec = RestaurantRecommendation(
            exam_plan_id=new_plan.id,
            restaurant_name=r['restaurant_name'],
            rating=r['rating'],
            distance=r['distance'],
            is_vegetarian=r['is_vegetarian'],
            is_budget_friendly=r['is_budget_friendly']
        )
        db.session.add(rest_rec)
        
    db.session.commit()
    
    return jsonify(new_plan.to_dict()), 201

@plan_bp.route('', methods=['GET'])
@jwt_required()
def get_plans():
    user_id = get_jwt_identity()
    plans = ExamPlan.query.filter_by(user_id=user_id).order_by(ExamPlan.created_at.desc()).all()
    return jsonify([p.to_dict() for p in plans]), 200

@plan_bp.route('/<int:plan_id>', methods=['GET'])
@jwt_required()
def get_plan(plan_id):
    user_id = get_jwt_identity()
    plan = ExamPlan.query.filter_by(id=plan_id, user_id=user_id).first()
    if not plan:
        return jsonify({"error": "Plan not found"}), 404
    return jsonify(plan.to_dict()), 200

@plan_bp.route('/<int:plan_id>', methods=['DELETE'])
@jwt_required()
def delete_plan(plan_id):
    user_id = get_jwt_identity()
    plan = ExamPlan.query.filter_by(id=plan_id, user_id=user_id).first()
    if not plan:
        return jsonify({"error": "Plan not found"}), 404
        
    db.session.delete(plan)
    db.session.commit()
    return jsonify({"message": "Plan deleted successfully"}), 200
