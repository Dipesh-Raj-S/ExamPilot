import datetime
import hashlib
from datetime import timedelta

def get_deterministic_distance(city1, city2):
    """Generates a deterministic distance in km between two cities."""
    c1 = city1.strip().lower()
    c2 = city2.strip().lower()
    if c1 == c2:
        return 15.0 # Local distance
    
    # Generate a deterministic hash from the sorted city names
    combined = "".join(sorted([c1, c2])).encode('utf-8')
    hash_val = int(hashlib.md5(combined).hexdigest(), 16)
    
    # Distance range: 100 km to 2000 km
    # Capped strictly at 2000 km
    distance = 100 + (hash_val % 1900)
    return float(distance)

class PlanningEngine:
    @staticmethod
    def generate_plan(exam_date, exam_time, home_city, center_city, travel_mode, arrival_preference, accommodation_required):
        # Convert exam_date if it is string
        if isinstance(exam_date, str):
            exam_date = datetime.datetime.strptime(exam_date, "%Y-%m-%d").date()
            
        # 1. Determine Arrival Date
        if arrival_preference == "same_day":
            arrival_date = exam_date
        elif arrival_preference == "1_day_before":
            arrival_date = exam_date - timedelta(days=1)
        elif arrival_preference == "2_days_before":
            arrival_date = exam_date - timedelta(days=2)
        else:
            arrival_date = exam_date - timedelta(days=1) # Default
            
        # 2. Get Distance & Travel Duration
        distance = get_deterministic_distance(home_city, center_city)
        
        # Speed and overhead constants
        # Cap distance to make sure durations are always realistic
        if distance > 2000:
            distance = 2000.0
            
        if travel_mode.lower() == 'flight':
            speed = 600.0
            overhead = 2.0  # airport check-in & boarding
            hours = (distance / speed) + overhead
        elif travel_mode.lower() == 'train':
            speed = 65.0
            overhead = 1.0
            hours = (distance / speed) + overhead
        elif travel_mode.lower() == 'bus':
            speed = 50.0
            overhead = 1.5
            hours = (distance / speed) + overhead
        else: # Car
            speed = 75.0
            overhead = 0.5
            hours = (distance / speed) + overhead
            
        # Format travel duration
        h = int(hours)
        m = int((hours - h) * 60)
        if h > 0:
            travel_duration_str = f"{h} hours {m} mins" if m > 0 else f"{h} hours"
        else:
            travel_duration_str = f"{m} mins"
            
        # 3. Determine Departure Date
        # If travel time is more than 8 hours, assume overnight travel and set departure a day before arrival
        if hours >= 8.0:
            departure_date = arrival_date - timedelta(days=1)
        else:
            departure_date = arrival_date
            
        # 4. Generate Checklist
        checklist = [
            "Admit Card / Hall Ticket (2 printed copies)",
            "Valid Government Photo ID (Aadhaar Card, PAN Card, etc.)",
            "Blue/Black Ballpoint Pens (if offline exam)",
            "Transparent Water Bottle",
            "Analog Wristwatch (Smartwatches are not allowed)",
            "Passport-size photographs (matching admit card)"
        ]
        
        if travel_mode.lower() == 'flight':
            checklist.append("Flight Web Check-In & Boarding Pass")
        elif travel_mode.lower() == 'train':
            checklist.append("Train Ticket (IRCTC ticket on mobile or printed)")
        elif travel_mode.lower() == 'bus':
            checklist.append("Bus e-Ticket")
            
        if accommodation_required:
            checklist.append("Hotel Reservation Slip & ID proofs for check-in")
            
        # 5. Route Overview
        route_overview = (
            f"Departure scheduled from {home_city} via {travel_mode.capitalize()} on {departure_date.strftime('%d %b %Y')}. "
            f"Expected arrival in {center_city} on {arrival_date.strftime('%d %b %Y')} after an estimated travel duration of {travel_duration_str}. "
            f"Travel route covers approximately {distance:.0f} km. Local transit (auto/cab) recommended to reach the center from your place of arrival."
        )
        
        return {
            "departure_date": departure_date,
            "arrival_date": arrival_date,
            "travel_duration": travel_duration_str,
            "travel_checklist": checklist,
            "route_overview": route_overview,
            "distance": distance
        }
