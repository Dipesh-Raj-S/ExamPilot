import decimal

class HotelEngine:
    @staticmethod
    def get_recommendations(center_city, center_name, budget):
        # Convert budget to float if it is a decimal/string
        budget_val = float(budget)
        
        # Scale prices reasonably to budget
        # Cap prices to keep them realistic
        price_budget = max(500.0, min(1000.0, budget_val * 0.15))
        price_mid = max(1000.0, min(2200.0, budget_val * 0.30))
        price_premium = max(1800.0, min(4500.0, budget_val * 0.50))
        
        return [
            {
                "hotel_name": f"{center_city} Student Hostel & PG",
                "rating": 4.2,
                "distance": 1.2,
                "estimated_price": float(price_budget)
            },
            {
                "hotel_name": f"StudyStay Inn & Suites (Near {center_name})",
                "rating": 4.6,
                "distance": 0.6,
                "estimated_price": float(price_mid)
            },
            {
                "hotel_name": f"The Scholars Retreat & Spa",
                "rating": 4.8,
                "distance": 2.2,
                "estimated_price": float(price_premium)
            }
        ]
