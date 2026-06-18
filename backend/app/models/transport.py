from app import db

class TransportRecommendation(db.Model):
    __tablename__ = 'transport_recommendations'
    
    id = db.Column(db.Integer, primary_key=True)
    exam_plan_id = db.Column(db.Integer, db.ForeignKey('exam_plans.id'), nullable=False)
    
    station_name = db.Column(db.String(150), nullable=False)
    transport_type = db.Column(db.String(55), nullable=False)  # bus, railway, metro
    distance = db.Column(db.Float, nullable=False)  # in km
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "exam_plan_id": self.exam_plan_id,
            "station_name": self.station_name,
            "transport_type": self.transport_type,
            "distance": self.distance,
            "latitude": self.latitude,
            "longitude": self.longitude
        }
