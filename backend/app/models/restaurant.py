from app import db

class RestaurantRecommendation(db.Model):
    __tablename__ = 'restaurant_recommendations'
    
    id = db.Column(db.Integer, primary_key=True)
    exam_plan_id = db.Column(db.Integer, db.ForeignKey('exam_plans.id'), nullable=False)
    
    restaurant_name = db.Column(db.String(150), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    distance = db.Column(db.Float, nullable=False)  # in km
    is_vegetarian = db.Column(db.Boolean, default=False)
    is_budget_friendly = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "exam_plan_id": self.exam_plan_id,
            "restaurant_name": self.restaurant_name,
            "rating": self.rating,
            "distance": self.distance,
            "is_vegetarian": self.is_vegetarian,
            "is_budget_friendly": self.is_budget_friendly
        }
