import datetime
from app import db

class ExamPlan(db.Model):
    __tablename__ = 'exam_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Inputs
    exam_name = db.Column(db.String(100), nullable=False)
    exam_date = db.Column(db.Date, nullable=False)
    exam_time = db.Column(db.Time, nullable=False)
    home_city = db.Column(db.String(100), nullable=False)
    center_name = db.Column(db.String(150), nullable=False)
    center_city = db.Column(db.String(100), nullable=False)
    center_address = db.Column(db.Text, nullable=False)
    travel_mode = db.Column(db.String(50), nullable=False)  # Train, Flight, Bus, Car
    budget = db.Column(db.Numeric(10, 2), nullable=False)
    accommodation_required = db.Column(db.Boolean, default=True)
    arrival_preference = db.Column(db.String(50), nullable=False)  # same_day, 1_day_before, 2_days_before
    
    # Calculated Outputs
    departure_date = db.Column(db.Date, nullable=True)
    arrival_date = db.Column(db.Date, nullable=True)
    travel_duration = db.Column(db.String(100), nullable=True)
    travel_checklist = db.Column(db.JSON, nullable=True)  # List of items
    route_overview = db.Column(db.Text, nullable=True)
    
    center_lat = db.Column(db.Float, nullable=True)
    center_lng = db.Column(db.Float, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    hotels = db.relationship('HotelRecommendation', backref='exam_plan', lazy=True, cascade="all, delete-orphan")
    restaurants = db.relationship('RestaurantRecommendation', backref='exam_plan', lazy=True, cascade="all, delete-orphan")
    transport_recommendations = db.relationship('TransportRecommendation', backref='exam_plan', lazy=True, cascade="all, delete-orphan")
    ai_plans = db.relationship('AITravelPlan', backref='exam_plan', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "exam_name": self.exam_name,
            "exam_date": self.exam_date.isoformat() if self.exam_date else None,
            "exam_time": self.exam_time.strftime('%H:%M') if self.exam_time else None,
            "home_city": self.home_city,
            "center_name": self.center_name,
            "center_city": self.center_city,
            "center_address": self.center_address,
            "travel_mode": self.travel_mode,
            "budget": float(self.budget) if self.budget else 0.0,
            "accommodation_required": self.accommodation_required,
            "arrival_preference": self.arrival_preference,
            
            # Outputs
            "departure_date": self.departure_date.isoformat() if self.departure_date else None,
            "arrival_date": self.arrival_date.isoformat() if self.arrival_date else None,
            "travel_duration": self.travel_duration,
            "travel_checklist": self.travel_checklist or [],
            "route_overview": self.route_overview,
            "center_lat": self.center_lat,
            "center_lng": self.center_lng,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            
            # Sub-resources
            "hotels": [h.to_dict() for h in self.hotels],
            "restaurants": [r.to_dict() for r in self.restaurants],
            "transport": [t.to_dict() for t in self.transport_recommendations],
            "ai_plans": [a.to_dict() for a in self.ai_plans]
        }
