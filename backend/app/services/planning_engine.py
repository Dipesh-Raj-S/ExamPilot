import os
import requests
import datetime
import logging
from datetime import timedelta
from app.services.location_service import LocationService

logger = logging.getLogger(__name__)

def get_deterministic_distance(city1, city2):
    """Generates a deterministic distance in km between two cities."""
    import hashlib
    c1 = city1.strip().lower()
    c2 = city2.strip().lower()
    if c1 == c2:
        return 15.0 # Local distance
    
    combined = "".join(sorted([c1, c2])).encode('utf-8')
    hash_val = int(hashlib.md5(combined).hexdigest(), 16)
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
            
        # 2. Get Distance & Travel Duration using OpenRouteService
        ors_key = os.environ.get('ORS_API_KEY')
        distance = None
        travel_duration_str = None
        hours = None

        if ors_key:
            try:
                # Geocode home and center cities to get coordinates
                home_lat, home_lon = LocationService.get_coordinates(home_city)
                center_lat, center_lon = LocationService.get_coordinates(center_city)
                
                # Query ORS Directions API
                url = "https://api.openrouteservice.org/v2/directions/driving-car"
                headers = {
                    "Authorization": ors_key,
                    "Content-Type": "application/json"
                }
                # Coordinates order: [[lon, lat], [lon, lat]]
                payload = {
                    "coordinates": [[home_lon, home_lat], [center_lon, center_lat]]
                }
                
                logger.info(f"[ORS] Initiating ORS Directions request for route from {home_city} to {center_city}")
                response = requests.post(url, json=payload, headers=headers, timeout=12)
                
                logger.info(f"[ORS] Response status code: {response.status_code}")

                if response.status_code == 200:
                    data = response.json()
                    if "routes" in data and len(data["routes"]) > 0:
                        summary = data["routes"][0]["summary"]

                        route_distance_m = summary["distance"]
                        route_duration_s = summary["duration"]
                        
                        distance = float(route_distance_m / 1000.0)
                        
                        # Apply travel-mode specific duration logic
                        mode = travel_mode.lower()
                        if mode == 'flight':
                            speed = 600.0
                            overhead = 2.0
                            hours = (distance / speed) + overhead
                        elif mode == 'train':
                            speed = 65.0
                            overhead = 1.0
                            hours = (distance / speed) + overhead
                        elif mode == 'bus':
                            hours = float(route_duration_s / 3600.0)
                        else: # Car or other driving modes
                            hours = float(route_duration_s / 3600.0)
                        
                        h_val = int(hours)
                        m_val = int(round((hours - h_val) * 60))
                        if m_val == 60:
                            h_val += 1
                            m_val = 0
                            
                        if h_val > 0:
                            travel_duration_str = f"{h_val}h {m_val}m" if m_val > 0 else f"{h_val}h"
                        else:
                            travel_duration_str = f"{m_val}m"
                            
                        logger.info(f"[ORS] Successfully calculated route: distance = {distance:.2f} km, mode = {travel_mode}, duration = {travel_duration_str}")
                else:
                    logger.error(f"[ORS] Directions API returned status code {response.status_code}: {response.text}")
            except requests.RequestException as e:
                logger.error(f"[ORS] Request exception during ORS route calculation: {str(e)}")
            except Exception as e:
                logger.error(f"[ORS] Exception during ORS route calculation: {str(e)}")

        # Fallback to local deterministic estimates if ORS fails or key is missing
        if distance is None or travel_duration_str is None or hours is None:
            logger.warning("[ORS] Using local deterministic PlanningEngine fallbacks.")
            distance = get_deterministic_distance(home_city, center_city)
            if distance > 2000:
                distance = 2000.0
                
            mode = travel_mode.lower()
            if mode == 'flight':
                speed = 600.0
                overhead = 2.0
                hours = (distance / speed) + overhead
            elif mode == 'train':
                speed = 65.0
                overhead = 1.0
                hours = (distance / speed) + overhead
            elif mode == 'bus':
                speed = 50.0
                overhead = 1.5
                hours = (distance / speed) + overhead
            else: # Car
                speed = 75.0
                overhead = 0.5
                hours = (distance / speed) + overhead
                
            h_val = int(hours)
            m_val = int(round((hours - h_val) * 60))
            if m_val == 60:
                h_val += 1
                m_val = 0
            if h_val > 0:
                travel_duration_str = f"{h_val}h {m_val}m" if m_val > 0 else f"{h_val}h"
            else:
                travel_duration_str = f"{m_val}m"
            
        # 3. Determine Departure Date
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
