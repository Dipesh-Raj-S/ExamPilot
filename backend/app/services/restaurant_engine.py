class RestaurantEngine:
    @staticmethod
    def get_recommendations(center_city, center_name):
        return [
            {
                "restaurant_name": f"Annapurna Pure Veg Student Mess",
                "rating": 4.1,
                "distance": 0.3,
                "is_vegetarian": True,
                "is_budget_friendly": True
            },
            {
                "restaurant_name": f"Royal Choice Veg & Non-Veg Diner",
                "rating": 4.4,
                "distance": 0.8,
                "is_vegetarian": False,
                "is_budget_friendly": True
            },
            {
                "restaurant_name": f"The Reading Room Cafe & Bistro",
                "rating": 4.5,
                "distance": 1.3,
                "is_vegetarian": False,
                "is_budget_friendly": False
            }
        ]
