import datetime
from app import db

class AITravelPlan(db.Model):
    __tablename__ = 'ai_travel_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    exam_plan_id = db.Column(db.Integer, db.ForeignKey('exam_plans.id'), nullable=False)
    
    plan_type = db.Column(db.String(50), nullable=False)  # budget, balanced, comfort
    title = db.Column(db.String(150), nullable=False)
    summary = db.Column(db.Text, nullable=True)
    hotel_name = db.Column(db.String(150), nullable=True)
    restaurant_name = db.Column(db.String(150), nullable=True)
    transport_mode = db.Column(db.String(100), nullable=True)
    estimated_cost = db.Column(db.Numeric(10, 2), nullable=True)
    reasoning = db.Column(db.Text, nullable=True)
    checklist = db.Column(db.JSON, nullable=True)  # List of recommendations/checklist items
    hotel_lat = db.Column(db.Float, nullable=True)
    hotel_lng = db.Column(db.Float, nullable=True)
    restaurant_lat = db.Column(db.Float, nullable=True)
    restaurant_lng = db.Column(db.Float, nullable=True)
    transport_lat = db.Column(db.Float, nullable=True)
    transport_lng = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "exam_plan_id": self.exam_plan_id,
            "plan_type": self.plan_type,
            "title": self.title,
            "summary": self.summary,
            "hotel_name": self.hotel_name,
            "hotel_lat": self.hotel_lat,
            "hotel_lng": self.hotel_lng,
            "restaurant_name": self.restaurant_name,
            "restaurant_lat": self.restaurant_lat,
            "restaurant_lng": self.restaurant_lng,
            "transport_mode": self.transport_mode,
            "transport_lat": self.transport_lat,
            "transport_lng": self.transport_lng,
            "estimated_cost": float(self.estimated_cost) if self.estimated_cost else 0.0,
            "reasoning": self.reasoning,
            "checklist": self.checklist or [],
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
