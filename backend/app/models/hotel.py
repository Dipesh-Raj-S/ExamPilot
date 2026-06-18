from app import db

class HotelRecommendation(db.Model):
    __tablename__ = 'hotel_recommendations'
    
    id = db.Column(db.Integer, primary_key=True)
    exam_plan_id = db.Column(db.Integer, db.ForeignKey('exam_plans.id'), nullable=False)#Each HotelRecommendation belongs to one ExamPlan
    
    hotel_name = db.Column(db.String(150), nullable=False)
    rating = db.Column(db.Float, nullable=True) # Let's make it nullable just in case real OSM rating is missing
    distance = db.Column(db.Float, nullable=False)  # in km
    estimated_price = db.Column(db.Numeric(10, 2), nullable=False)  # per night
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    
    def to_dict(self): #converts an HotelRecommendation object into a Python dictionary.
        return {
            "id": self.id,
            "exam_plan_id": self.exam_plan_id,
            "hotel_name": self.hotel_name,
            "rating": self.rating,
            "distance": self.distance,
            "estimated_price": float(self.estimated_price) if self.estimated_price else 0.0,
            "latitude": self.latitude,
            "longitude": self.longitude
        }
