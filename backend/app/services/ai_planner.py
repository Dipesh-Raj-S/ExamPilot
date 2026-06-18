import os
import requests
import json
import logging

logger = logging.getLogger(__name__)

class AIPlanner:
    @staticmethod
    def generate_plans(exam_details, hotels, restaurants, transport, utilities):
        """Generate Budget, Balanced, and Comfort plans based on real nearby options using Gemini."""
        api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
        
        # Build prompt context
        exam_name = exam_details.get("exam_name", "Exam")
        exam_date = exam_details.get("exam_date", "TBD")
        exam_time = exam_details.get("exam_time", "TBD")
        home_city = exam_details.get("home_city", "Home City")
        center_city = exam_details.get("center_city", "Center City")
        center_name = exam_details.get("center_name", "Center Name")
        center_address = exam_details.get("center_address", "")
        travel_mode = exam_details.get("travel_mode", "Train")
        budget = float(exam_details.get("budget", 5000.0))
        arrival_pref = exam_details.get("arrival_preference", "1_day_before")
        
        # Prepare list descriptions
        hotel_list_str = "\n".join([
            f"- {h['hotel_name']} (Rating: {h['rating']}, Distance: {h['distance']}km, Price: ₹{h['estimated_price']}/night, Coordinates: {h['latitude']},{h['longitude']})"
            for h in hotels
        ])
        restaurant_list_str = "\n".join([
            f"- {r['restaurant_name']} (Rating: {r['rating']}, Distance: {r['distance']}km, Veg: {r['is_vegetarian']}, Student-Friendly: {r['is_budget_friendly']}, Coordinates: {r['latitude']},{r['longitude']})"
            for r in restaurants
        ])
        transport_list_str = "\n".join([
            f"- {t['station_name']} (Type: {t['transport_type']}, Distance: {t['distance']}km, Coordinates: {t['latitude']},{t['longitude']})"
            for t in transport
        ])
        utilities_list_str = "\n".join([
            f"- {u['name']} (Type: {u['type']}, Distance: {u['distance']}km, Coordinates: {u['latitude']},{u['longitude']})"
            for u in utilities
        ])

        prompt = f"""
You are an expert AI Travel Logistics Planner for ExamPilot, helper for students attending competitive examinations.
Generate exactly 3 distinct travel plans for a student based ON the context provided:
1. "budget": Optimize for lowest cost and acceptable quality.
2. "balanced": Optimize for value for money and convenience.
3. "comfort": Optimize for least stress and best rated options.

Exam Details:
- Exam Name: {exam_name}
- Date: {exam_date}
- Time: {exam_time}
- Home City: {home_city}
- Center City: {center_city}
- Center Name: {center_name}
- Center Address: {center_address}
- Preferred Travel Mode: {travel_mode}
- Budget: ₹{budget}
- Arrival Preference: {arrival_pref}

Available Options (ONLY recommend options from this list):
Hotels (Search radius limit: 3 km):
{hotel_list_str}

Restaurants (Search radius limit: 2 km):
{restaurant_list_str}

Transport Hubs (Search radius limit: 10 km - 20 km):
{transport_list_str}

Nearby Services (Hospitals, Pharmacies, ATMs):
{utilities_list_str}

For each plan, choose ONE recommended hotel (if accommodation required is True), ONE recommended restaurant, and ONE transport station from the list above.
Calculate estimated total cost (include travel mode, lodging, and meals). Keep it realistic.
Formulate an exam day strategy based on distance of the hotel/transit from the exam center.
Include coordinates (lat/lng) matching the exact choice from the list for the recommended hotel, restaurant, and transport option.

Return a JSON object with a single root key "plans" containing a list of exactly 3 plans.
Strictly follow this JSON schema structure:
{{
  "plans": [
    {{
      "plan_type": "budget",
      "title": "Title for Budget Plan",
      "summary": "Short overview summary of this budget plan.",
      "hotel_name": "Name of recommended hotel chosen from the list",
      "hotel_lat": 12.3456,
      "hotel_lng": 78.9012,
      "restaurant_name": "Name of recommended restaurant chosen from the list",
      "restaurant_lat": 12.3456,
      "restaurant_lng": 78.9012,
      "transport_mode": "Transport station recommended from the list",
      "transport_lat": 12.3456,
      "transport_lng": 78.9012,
      "estimated_cost": 1500.00,
      "reasoning": "Reasoning explaining why this hotel, restaurant, and transit fits budget student needs.",
      "checklist": ["Double check admit card printout", "Locate nearest ATM at [name]"]
    }},
    {{
      "plan_type": "balanced",
      "title": "Title for Balanced Plan",
      "summary": "Short overview summary...",
      ...
    }},
    {{
      "plan_type": "comfort",
      "title": "Title for Comfort Plan",
      "summary": "Short overview summary...",
      ...
    }}
  ]
}}
Ensure the output contains nothing but the raw valid JSON payload. No markdown ticks, no surrounding text.
"""
        
        if api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.2
                    }
                }
                
                logger.info("Calling Gemini API to generate travel plans...")
                response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=25)
                
                if response.status_code == 200:
                    resp_json = response.json()
                    candidate_text = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                    logger.info("Successfully received response from Gemini API.")
                    
                    # Parse and return JSON
                    parsed_plans = json.loads(candidate_text.strip())
                    if "plans" in parsed_plans and len(parsed_plans["plans"]) == 3:
                        return parsed_plans["plans"]
                else:
                    logger.error(f"Gemini API returned status code {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"Failed to generate plans using Gemini API: {str(e)}")
        
        # Fallback implementation
        logger.warning("Using local deterministic AI Planner fallback generator.")
        return AIPlanner._generate_fallback_plans(hotels, restaurants, transport, travel_mode, budget, arrival_pref)

    @staticmethod
    def _generate_fallback_plans(hotels, restaurants, transport, travel_mode, budget, arrival_pref):
        """Generates deterministic mock travel plans when Gemini API is unavailable."""
        plans = []
        
        # 1. Budget Plan
        # Pick cheapest hotel and student mess
        budget_hotel = min(hotels, key=lambda x: x["estimated_price"]) if hotels else None
        budget_restaurant = next((r for r in restaurants if r["is_budget_friendly"]), restaurants[0]) if restaurants else None
        budget_transport = transport[0] if transport else None
        
        hotel_cost = budget_hotel["estimated_price"] if budget_hotel else 0.0
        est_cost_budget = hotel_cost * 1.5 + 400.0  # lodging + food + local transit
        
        plans.append({
            "plan_type": "budget",
            "title": "Economical Smart Travel Plan",
            "summary": "A budget-friendly travel schedule designed to minimize costs while securing standard comforts.",
            "hotel_name": budget_hotel["hotel_name"] if budget_hotel else "Local Student PG",
            "hotel_lat": budget_hotel["latitude"] if budget_hotel else None,
            "hotel_lng": budget_hotel["longitude"] if budget_hotel else None,
            "restaurant_name": budget_restaurant["restaurant_name"] if budget_restaurant else "Local Student Mess",
            "restaurant_lat": budget_restaurant["latitude"] if budget_restaurant else None,
            "restaurant_lng": budget_restaurant["longitude"] if budget_restaurant else None,
            "transport_mode": budget_transport["station_name"] if budget_transport else "Local Bus Hub",
            "transport_lat": budget_transport["latitude"] if budget_transport else None,
            "transport_lng": budget_transport["longitude"] if budget_transport else None,
            "estimated_cost": float(round(est_cost_budget, 2)),
            "reasoning": f"This plan matches the budget criteria by staying at {budget_hotel['hotel_name'] if budget_hotel else 'hostelry'} with an estimated cost of ₹{budget_hotel['estimated_price'] if budget_hotel else 1000}/night and eating at local student mess joints.",
            "checklist": [
                "Locate exam center physical route a day prior",
                "Ensure local currency notes are available for transit",
                "Pack water bottle and black pens"
            ]
        })
        
        # 2. Balanced Plan
        # Pick middle rated / distance options
        bal_hotel = hotels[len(hotels)//2] if hotels else None
        bal_restaurant = restaurants[len(restaurants)//2] if restaurants else None
        bal_transport = transport[len(transport)//2] if transport else None
        
        hotel_cost_bal = bal_hotel["estimated_price"] if bal_hotel else 0.0
        est_cost_bal = hotel_cost_bal * 1.5 + 750.0
        
        plans.append({
            "plan_type": "balanced",
            "title": "Optimized Balanced Travel Plan",
            "summary": "Balances price and location proximity. Selected stays are within quick commuting distance to the exam hall.",
            "hotel_name": bal_hotel["hotel_name"] if bal_hotel else "Standard Study Inn",
            "hotel_lat": bal_hotel["latitude"] if bal_hotel else None,
            "hotel_lng": bal_hotel["longitude"] if bal_hotel else None,
            "restaurant_name": bal_restaurant["restaurant_name"] if bal_restaurant else "Veg Restaurant",
            "restaurant_lat": bal_restaurant["latitude"] if bal_restaurant else None,
            "restaurant_lng": bal_restaurant["longitude"] if bal_restaurant else None,
            "transport_mode": bal_transport["station_name"] if bal_transport else "Metro Station",
            "transport_lat": bal_transport["latitude"] if bal_transport else None,
            "transport_lng": bal_transport["longitude"] if bal_transport else None,
            "estimated_cost": float(round(est_cost_bal, 2)),
            "reasoning": f"Provides a solid trade-off by selecting {bal_hotel['hotel_name'] if bal_hotel else 'Hotel'} with 4.5+ star ratings, ensuring comfortable sleep and a brief commute to the center.",
            "checklist": [
                "Reserve cab in advance via local apps",
                "Check out recommended restaurants nearby for quick dinners",
                "Sleep early to stay fresh for morning exam"
            ]
        })
        
        # 3. Comfort Plan
        # Pick best rated options
        comfort_hotel = max(hotels, key=lambda x: x["rating"]) if hotels else None
        comfort_restaurant = max(restaurants, key=lambda x: x["rating"]) if restaurants else None
        comfort_transport = transport[-1] if transport else None
        
        hotel_cost_com = comfort_hotel["estimated_price"] if comfort_hotel else 0.0
        est_cost_com = hotel_cost_com * 2.0 + 1200.0
        
        plans.append({
            "plan_type": "comfort",
            "title": "Premium Comfort & Zero Stress Travel Plan",
            "summary": "Optimizes completely for peace of mind, high ratings, and shortest travel times.",
            "hotel_name": comfort_hotel["hotel_name"] if comfort_hotel else "Premium Scholars Retreat",
            "hotel_lat": comfort_hotel["latitude"] if comfort_hotel else None,
            "hotel_lng": comfort_hotel["longitude"] if comfort_hotel else None,
            "restaurant_name": comfort_restaurant["restaurant_name"] if comfort_restaurant else "Fine Dine Bistro",
            "restaurant_lat": comfort_restaurant["latitude"] if comfort_restaurant else None,
            "restaurant_lng": comfort_restaurant["longitude"] if comfort_restaurant else None,
            "transport_mode": comfort_transport["station_name"] if comfort_transport else "Railway Terminal",
            "transport_lat": comfort_transport["latitude"] if comfort_transport else None,
            "transport_lng": comfort_transport["longitude"] if comfort_transport else None,
            "estimated_cost": float(round(est_cost_com, 2)),
            "reasoning": f"Focuses on a stress-free environment by selecting {comfort_hotel['hotel_name'] if comfort_hotel else 'premium stay'} located just {comfort_hotel['distance'] if comfort_hotel else 0.5} km from the center, featuring excellent soundproofing and dining options.",
            "checklist": [
                "Confirm early check-in or luggage storage at hotel",
                "Request desk setup in hotel room for final prep",
                "Ensure premium taxi transit is booked"
            ]
        })
        
        return plans
