from flask import Blueprint, request, jsonify
from app.models.plan import ExamPlan
from app.models.hotel import HotelRecommendation
from app.models.restaurant import RestaurantRecommendation
from app.models.transport import TransportRecommendation
from app.models.ai_plan import AITravelPlan
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.planning_engine import PlanningEngine
from app.services.location_service import LocationService
from app.services.ai_planner import AIPlanner
import datetime

plan_bp = Blueprint('plan', __name__)

def format_plan_response(plan):
    plan_dict = plan.to_dict()
    hotels = plan_dict.pop("hotels", [])
    restaurants = plan_dict.pop("restaurants", [])
    transport = plan_dict.pop("transport", [])
    ai_plans = plan_dict.pop("ai_plans", [])
    
    return {
        "exam_plan": plan_dict,
        "hotels": hotels,
        "restaurants": restaurants,
        "transport": transport,
        "ai_plans": ai_plans
    }

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
        
    # 1. Run Travel Timings Planning Engine
    travel_info = PlanningEngine.generate_plan(
        exam_date=exam_date,
        exam_time=exam_time,
        home_city=home_city,
        center_city=center_city,
        travel_mode=travel_mode,
        arrival_preference=arrival_preference,
        accommodation_required=accommodation_required
    )
    
    # 2. Geocode Exam Center address & name
    lat, lon = LocationService.get_coordinates(center_address, center_name)
    
    # 3. Retrieve POIs with separate search radii: Hotels = 3km, Restaurants = 2km, Transport = 10km-20km, Utilities = 3km
    hotels_list = LocationService.get_nearby_hotels(lat, lon)
    restaurants_list = LocationService.get_nearby_restaurants(lat, lon)
    transport_list = LocationService.get_nearby_transport(lat, lon)
    utilities_list = LocationService.get_nearby_utilities(lat, lon)
    
    # 4. Create Plan Model
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
        route_overview=travel_info['route_overview'],
        
        # Center coordinates
        center_lat=lat,
        center_lng=lon
    )
    
    db.session.add(new_plan)
    db.session.flush() # Populate plan ID for recommendations
    
    # 5. Save hotel recommendations (with coordinates)
    for h in hotels_list:
        hotel_rec = HotelRecommendation(
            exam_plan_id=new_plan.id,
            hotel_name=h['hotel_name'],
            rating=h['rating'],
            distance=h['distance'],
            estimated_price=h['estimated_price'],
            latitude=h['latitude'],
            longitude=h['longitude']
        )
        db.session.add(hotel_rec)
            
    # 6. Save restaurant recommendations (with coordinates)
    for r in restaurants_list:
        rest_rec = RestaurantRecommendation(
            exam_plan_id=new_plan.id,
            restaurant_name=r['restaurant_name'],
            rating=r['rating'],
            distance=r['distance'],
            is_vegetarian=r['is_vegetarian'],
            is_budget_friendly=r['is_budget_friendly'],
            latitude=r['latitude'],
            longitude=r['longitude']
        )
        db.session.add(rest_rec)
        
    # 7. Save transport recommendations (with coordinates)
    for t in transport_list:
        trans_rec = TransportRecommendation(
            exam_plan_id=new_plan.id,
            station_name=t['station_name'],
            transport_type=t['transport_type'],
            distance=t['distance'],
            latitude=t['latitude'],
            longitude=t['longitude']
        )
        db.session.add(trans_rec)
        
    # 8. Generate Gemini AI plans
    exam_details = {
        "exam_name": exam_name,
        "exam_date": exam_date_str,
        "exam_time": exam_time_str,
        "home_city": home_city,
        "center_city": center_city,
        "center_name": center_name,
        "center_address": center_address,
        "travel_mode": travel_mode,
        "budget": budget,
        "arrival_preference": arrival_preference
    }
    
    ai_plans = AIPlanner.generate_plans(
        exam_details=exam_details,
        hotels=hotels_list,
        restaurants=restaurants_list,
        transport=transport_list,
        utilities=utilities_list
    )
    
    # 9. Save AITravelPlans
    for p in ai_plans:
        ai_plan_rec = AITravelPlan(
            exam_plan_id=new_plan.id,
            plan_type=p['plan_type'],
            title=p['title'],
            summary=p.get('summary'),
            hotel_name=p.get('hotel_name'),
            hotel_lat=p.get('hotel_lat'),
            hotel_lng=p.get('hotel_lng'),
            restaurant_name=p.get('restaurant_name'),
            restaurant_lat=p.get('restaurant_lat'),
            restaurant_lng=p.get('restaurant_lng'),
            transport_mode=p.get('transport_mode'),
            transport_lat=p.get('transport_lat'),
            transport_lng=p.get('transport_lng'),
            estimated_cost=p.get('estimated_cost'),
            reasoning=p.get('reasoning'),
            checklist=p.get('checklist')
        )
        db.session.add(ai_plan_rec)
        
    db.session.commit()
    
    return jsonify(format_plan_response(new_plan)), 201

@plan_bp.route('', methods=['GET'])
@jwt_required()
def get_plans():
    user_id = get_jwt_identity()
    plans = ExamPlan.query.filter_by(user_id=user_id).order_by(ExamPlan.created_at.desc()).all()
    return jsonify([format_plan_response(p) for p in plans]), 200

@plan_bp.route('/<int:plan_id>', methods=['GET'])
@jwt_required()
def get_plan(plan_id):
    user_id = get_jwt_identity()
    plan = ExamPlan.query.filter_by(id=plan_id, user_id=user_id).first()
    if not plan:
        return jsonify({"error": "Plan not found"}), 404
    return jsonify(format_plan_response(plan)), 200

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
