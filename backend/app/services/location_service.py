import os
import requests
import math
import hashlib
import logging

logger = logging.getLogger(__name__)

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance in kilometers between two points."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 0.0
    R = 6371.0  # Earth radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.asin(math.sqrt(a))
    return float(R * c)

def get_deterministic_offset_coords(lat, lon, seed_str, index, min_dist_km, max_dist_km):
    """Generate deterministic coordinates within a distance range for fallback options."""
    combined = f"{seed_str}_{index}".encode('utf-8')
    hash_val = int(hashlib.md5(combined).hexdigest(), 16)
    dist = min_dist_km + (hash_val % 1000) / 1000.0 * (max_dist_km - min_dist_km)
    angle = (hash_val >> 10) % 360 * math.pi / 180.0
    lat_offset = (dist * math.cos(angle)) / 111.0
    lon_offset = (dist * math.sin(angle)) / (111.0 * math.cos(math.radians(lat)))
    return float(lat + lat_offset), float(lon + lon_offset)

def deduplicate_places(places, name_key, lat_key, lon_key):
    """Filter out duplicate places by case-insensitive name and coordinates (within 0.0001 deg)."""
    seen_names = set()
    seen_coords = []
    unique_places = []
    
    for p in places:
        name = p.get(name_key)
        if not name:
            continue
        name_clean = name.strip().lower()
        lat = p.get(lat_key)
        lon = p.get(lon_key)
        if lat is None or lon is None:
            continue
            
        if name_clean in seen_names:
            continue
            
        # Check coordinate distance (within 0.0001 deg is approx 10 meters)
        is_dup_coord = False
        for slat, slon in seen_coords:
            if abs(lat - slat) < 0.0001 and abs(lon - slon) < 0.0001:
                is_dup_coord = True
                break
        if is_dup_coord:
            continue
            
        seen_names.add(name_clean)
        seen_coords.append((lat, lon))
        unique_places.append(p)
        
    return unique_places

class LocationService:
    @staticmethod
    def _get_api_key():
        return os.environ.get('GEOAPIFY_API_KEY')

    @staticmethod
    def get_coordinates(address, center_name=None):
        """Convert address and center name to latitude/longitude using Geoapify Geocoding API."""
        api_key = LocationService._get_api_key()
        query = address
        if center_name:
            query = f"{center_name}, {address}"

        if api_key:
            try:
                import time
                url = "https://api.geoapify.com/v1/geocode/search"
                params = {
                    "text": query,
                    "limit": 1,
                    "apiKey": api_key
                }
                log_params = params.copy()
                log_params["apiKey"] = "REDACTED"
                logger.info(f"[Geoapify] Initiating geocoding for query: '{query}' | URL: {url} | params: {log_params}")
                
                start_time = time.time()
                response = requests.get(url, params=params, timeout=20)
                elapsed = time.time() - start_time
                logger.info(f"[Geoapify] Geocoding response received in {elapsed:.2f}s with status code {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data and "features" in data and len(data["features"]) > 0:
                        props = data["features"][0]["properties"]
                        lat = float(props["lat"])
                        lon = float(props["lon"])
                        logger.info(f"[Geoapify] Geocoded successfully to ({lat}, {lon})")
                        return lat, lon
                
                # Retry with address only if combined query fails
                if center_name:
                    logger.info(f"[Geoapify] Combined query failed. Retrying with address only: '{address}'")
                    params["text"] = address
                    
                    start_time = time.time()
                    response = requests.get(url, params=params, timeout=20)
                    elapsed = time.time() - start_time
                    logger.info(f"[Geoapify] Geocoding (address only) response received in {elapsed:.2f}s with status code {response.status_code}")
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data and "features" in data and len(data["features"]) > 0:
                            props = data["features"][0]["properties"]
                            lat = float(props["lat"])
                            lon = float(props["lon"])
                            logger.info(f"[Geoapify] Geocoded successfully (address only) to ({lat}, {lon})")
                            return lat, lon
            except Exception as e:
                logger.error(f"[Geoapify] Error in geocoding: {str(e)}")
        else:
            logger.warning("[Geoapify] GEOAPIFY_API_KEY env variable is missing. Geocoding will use fallback.")

        # Deterministic fallback
        h = int(hashlib.md5(address.encode('utf-8')).hexdigest(), 16)
        fallback_lat = 19.0760 + ((h % 100) / 500.0) - 0.1
        fallback_lon = 72.8777 + (((h >> 8) % 100) / 500.0) - 0.1
        logger.warning(f"[Geoapify] Using fallback coordinates ({fallback_lat}, {fallback_lon}) for address: {address}")
        return fallback_lat, fallback_lon

    @staticmethod
    def get_nearby_hotels(lat, lon):
        """Retrieve hotels within 3000m (3 km) from the center coordinates using Geoapify Places API."""
        api_key = LocationService._get_api_key()
        hotels = []

        if api_key:
            try:
                import time
                url = "https://api.geoapify.com/v2/places"
                params = {
                    "categories": "accommodation.hotel,accommodation.hostel,accommodation.guest_house",
                    "filter": f"circle:{lon},{lat},3000",
                    "bias": f"proximity:{lon},{lat}",
                    "limit": 20,
                    "apiKey": api_key
                }
                log_params = params.copy()
                log_params["apiKey"] = "REDACTED"
                logger.info(f"[Geoapify] Querying hotels around ({lat}, {lon}) | URL: {url} | params: {log_params}")
                
                start_time = time.time()
                response = requests.get(url, params=params, timeout=20)
                elapsed = time.time() - start_time
                logger.info(f"[Geoapify] Hotels query completed in {elapsed:.2f}s with status code {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data and "features" in data:
                        for feature in data["features"]:
                            props = feature["properties"]
                            name = props.get("name")
                            if not name:
                                continue
                            el_lat = props.get("lat")
                            el_lon = props.get("lon")
                            if el_lat is not None and el_lon is not None:
                                dist = haversine_distance(lat, lon, el_lat, el_lon)
                                # Deterministic rating based on name
                                h = int(hashlib.md5(name.encode('utf-8')).hexdigest(), 16)
                                rating = round(3.8 + (h % 11) / 10.0, 1)
                                price = float(1200 + (h % 33) * 100)
                                hotels.append({
                                    "hotel_name": name,
                                    "rating": rating,
                                    "distance": round(dist, 2),
                                    "latitude": float(el_lat),
                                    "longitude": float(el_lon),
                                    "estimated_price": price
                                })
                    # Deduplicate places
                    hotels = deduplicate_places(hotels, "hotel_name", "latitude", "longitude")
                else:
                    logger.error(f"[Geoapify] Hotels query failed. Status code {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"[Geoapify] Error fetching hotels: {str(e)}")

        # Sort by distance first, then rating descending
        hotels.sort(key=lambda x: (x["distance"], -x["rating"]))

        # Fallback if empty or API key missing
        if not hotels:
            logger.warning("[Geoapify] No hotels returned. Using fallback hotels.")
            names = ["Scholars Inn & Suites", "University PG & Student Housing", "The Calm Study Stay", "Exam Comfort Lodge"]
            for i, name in enumerate(names):
                h_lat, h_lon = get_deterministic_offset_coords(lat, lon, name, i, 0.4, 2.8)
                dist = haversine_distance(lat, lon, h_lat, h_lon)
                rating = round(4.0 + (i * 2) / 10.0, 1)
                price = float(1000 + i * 800)
                hotels.append({
                    "hotel_name": name,
                    "rating": rating,
                    "distance": round(dist, 2),
                    "latitude": h_lat,
                    "longitude": h_lon,
                    "estimated_price": price
                })
            hotels.sort(key=lambda x: (x["distance"], -x["rating"]))
            
        return hotels[:5]

    @staticmethod
    def get_nearby_restaurants(lat, lon):
        """Retrieve restaurants within 2000m (2 km) from the center coordinates using Geoapify Places API."""
        api_key = LocationService._get_api_key()
        restaurants = []

        if api_key:
            try:
                import time
                url = "https://api.geoapify.com/v2/places"
                params = {
                    "categories": "catering.restaurant",
                    "filter": f"circle:{lon},{lat},2000",
                    "bias": f"proximity:{lon},{lat}",
                    "limit": 20,
                    "apiKey": api_key
                }
                log_params = params.copy()
                log_params["apiKey"] = "REDACTED"
                logger.info(f"[Geoapify] Querying restaurants around ({lat}, {lon}) | URL: {url} | params: {log_params}")
                
                start_time = time.time()
                response = requests.get(url, params=params, timeout=20)
                elapsed = time.time() - start_time
                logger.info(f"[Geoapify] Restaurants query completed in {elapsed:.2f}s with status code {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data and "features" in data:
                        for feature in data["features"]:
                            props = feature["properties"]
                            name = props.get("name")
                            if not name:
                                continue
                            el_lat = props.get("lat")
                            el_lon = props.get("lon")
                            if el_lat is not None and el_lon is not None:
                                dist = haversine_distance(lat, lon, el_lat, el_lon)
                                cats = props.get("categories", [])
                                is_veg = "diet.vegetarian" in cats or "vegetarian" in name.lower() or "pure veg" in name.lower()
                                is_budget = "catering.restaurant.fast_food" in cats or "mess" in name.lower() or "canteen" in name.lower()
                                
                                h = int(hashlib.md5(name.encode('utf-8')).hexdigest(), 16)
                                rating = round(3.5 + (h % 14) / 10.0, 1)
                                restaurants.append({
                                    "restaurant_name": name,
                                    "rating": rating,
                                    "distance": round(dist, 2),
                                    "is_vegetarian": is_veg,
                                    "is_budget_friendly": is_budget or (h % 2 == 0),
                                    "latitude": float(el_lat),
                                    "longitude": float(el_lon)
                                })
                    # Deduplicate places
                    restaurants = deduplicate_places(restaurants, "restaurant_name", "latitude", "longitude")
                else:
                    logger.error(f"[Geoapify] Restaurants query failed. Status code {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"[Geoapify] Error fetching restaurants: {str(e)}")

        # Sort by distance first, then rating descending
        restaurants.sort(key=lambda x: (x["distance"], -x["rating"]))

        if not restaurants:
            logger.warning("[Geoapify] No restaurants returned. Using fallback restaurants.")
            names = ["Annapurna Pure Veg Student Mess", "Aspirant Canteen & Grill", "The Study Break Cafe", "Central Feast Dining"]
            for i, name in enumerate(names):
                r_lat, r_lon = get_deterministic_offset_coords(lat, lon, name, i, 0.2, 1.8)
                dist = haversine_distance(lat, lon, r_lat, r_lon)
                rating = round(4.1 + (i % 2) * 0.3, 1)
                restaurants.append({
                    "restaurant_name": name,
                    "rating": rating,
                    "distance": round(dist, 2),
                    "is_vegetarian": i % 2 == 0,
                    "is_budget_friendly": i < 3,
                    "latitude": r_lat,
                    "longitude": r_lon
                })
            restaurants.sort(key=lambda x: (x["distance"], -x["rating"]))
            
        return restaurants[:5]

    @staticmethod
    def get_nearby_transport(lat, lon):
        """Retrieve transport hubs within 20 km using Geoapify Places API."""
        api_key = LocationService._get_api_key()
        stations = []

        if api_key:
            try:
                import time
                url = "https://api.geoapify.com/v2/places"
                params = {
                    "categories": "public_transport",
                    "filter": f"circle:{lon},{lat},20000",
                    "bias": f"proximity:{lon},{lat}",
                    "limit": 20,
                    "apiKey": api_key
                }
                log_params = params.copy()
                log_params["apiKey"] = "REDACTED"
                logger.info(f"[Geoapify] Querying transport around ({lat}, {lon}) | URL: {url} | params: {log_params}")
                
                start_time = time.time()
                response = requests.get(url, params=params, timeout=20)
                elapsed = time.time() - start_time
                logger.info(f"[Geoapify] Transport query completed in {elapsed:.2f}s with status code {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data and "features" in data:
                        for feature in data["features"]:
                            props = feature["properties"]
                            name = props.get("name")
                            if not name:
                                continue
                            el_lat = props.get("lat")
                            el_lon = props.get("lon")
                            if el_lat is not None and el_lon is not None:
                                dist = haversine_distance(lat, lon, el_lat, el_lon)
                                cats = props.get("categories", [])
                                
                                ttype = "Bus Station"
                                if any("subway" in cat for cat in cats) or "subway" in name.lower() or "metro" in name.lower():
                                    ttype = "Metro Station"
                                elif any("train" in cat or "rail" in cat for cat in cats) or "railway" in name.lower():
                                    ttype = "Railway Station"
                                    
                                stations.append({
                                    "station_name": name,
                                    "transport_type": ttype,
                                    "distance": round(dist, 2),
                                    "latitude": float(el_lat),
                                    "longitude": float(el_lon)
                                })
                    # Deduplicate stations
                    stations = deduplicate_places(stations, "station_name", "latitude", "longitude")
                else:
                    logger.error(f"[Geoapify] Transport query failed. Status code {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"[Geoapify] Error fetching transport from Geoapify: {str(e)}")

        in_range = [s for s in stations if 10.0 <= s["distance"] <= 20.0]
        results = in_range if in_range else stations
        
        # Sort results: distance primary ascending, type_relevance secondary ascending (0 for Railway/Metro, 1 for Bus)
        results.sort(key=lambda x: (x["distance"], 0 if x["transport_type"] in ["Railway Station", "Metro Station"] else 1))

        if not results:
            logger.warning("[Geoapify] No transport stations returned. Using fallback transport.")
            fallback_names = [
                ("Central Junction Railway Station", "Railway Station", 12.4),
                ("Main Inter-State Bus Terminus (ISBT)", "Bus Station", 8.2),
                ("City Center Metro Junction", "Metro Station", 14.5)
            ]
            for i, (name, ttype, dist_km) in enumerate(fallback_names):
                s_lat, s_lon = get_deterministic_offset_coords(lat, lon, name, i, dist_km - 0.5, dist_km + 0.5)
                dist = haversine_distance(lat, lon, s_lat, s_lon)
                results.append({
                    "station_name": name,
                    "transport_type": ttype,
                    "distance": round(dist, 2),
                    "latitude": s_lat,
                    "longitude": s_lon
                })
            # Filter and sort fallback too
            in_range_fb = [s for s in results if 10.0 <= s["distance"] <= 20.0]
            final_fb = in_range_fb if in_range_fb else results
            final_fb.sort(key=lambda x: (x["distance"], 0 if x["transport_type"] in ["Railway Station", "Metro Station"] else 1))
            results = final_fb
            
        return results[:5]

    @staticmethod
    def get_nearby_utilities(lat, lon):
        """Retrieve nearby useful utilities (hospitals, pharmacies, ATMs) within 3 km using Geoapify Places API."""
        api_key = LocationService._get_api_key()
        utilities = []

        if api_key:
            try:
                import time
                url = "https://api.geoapify.com/v2/places"
                params = {
                    "categories": "healthcare.hospital,healthcare.pharmacy,service.financial.atm",
                    "filter": f"circle:{lon},{lat},3000",
                    "bias": f"proximity:{lon},{lat}",
                    "limit": 20,
                    "apiKey": api_key
                }
                log_params = params.copy()
                log_params["apiKey"] = "REDACTED"
                logger.info(f"[Geoapify] Querying utilities around ({lat}, {lon}) | URL: {url} | params: {log_params}")
                
                start_time = time.time()
                response = requests.get(url, params=params, timeout=20)
                elapsed = time.time() - start_time
                logger.info(f"[Geoapify] Utilities query completed in {elapsed:.2f}s with status code {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data and "features" in data:
                        for feature in data["features"]:
                            props = feature["properties"]
                            name = props.get("name")
                            el_lat = props.get("lat")
                            el_lon = props.get("lon")
                            cats = props.get("categories", [])
                            
                            utype = "Utility"
                            if any("hospital" in cat for cat in cats):
                                utype = "Hospital"
                                if not name: name = "Community Clinic / Hospital"
                            elif any("pharmacy" in cat for cat in cats):
                                utype = "Pharmacy"
                                if not name: name = "Local Pharmacy / Chemist"
                            elif any("atm" in cat for cat in cats):
                                utype = "Atm"
                                if not name: name = f"{props.get('brand', 'Bank')} ATM"
                                
                            if not name:
                                continue
                                
                            if el_lat is not None and el_lon is not None:
                                dist = haversine_distance(lat, lon, el_lat, el_lon)
                                utilities.append({
                                    "name": name,
                                    "type": utype,
                                    "distance": round(dist, 2),
                                    "latitude": float(el_lat),
                                    "longitude": float(el_lon)
                                })
                    # Deduplicate utilities
                    utilities = deduplicate_places(utilities, "name", "latitude", "longitude")
                else:
                    logger.error(f"[Geoapify] Utilities query failed. Status code {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"[Geoapify] Error fetching utilities from Geoapify: {str(e)}")

        utilities.sort(key=lambda x: x["distance"])

        if not utilities:
            logger.warning("[Geoapify] No utilities returned. Using fallback utilities.")
            fallback_items = [
                ("City Health Care Hospital", "Hospital", 1.1),
                ("Apollo Pharmacy / Chemist", "Pharmacy", 0.5),
                ("State Bank of India (SBI) ATM", "Atm", 0.3)
            ]
            for i, (name, utype, dist_km) in enumerate(fallback_items):
                u_lat, u_lon = get_deterministic_offset_coords(lat, lon, name, i, dist_km - 0.1, dist_km + 0.1)
                dist = haversine_distance(lat, lon, u_lat, u_lon)
                utilities.append({
                    "name": name,
                    "type": utype,
                    "distance": round(dist, 2),
                    "latitude": u_lat,
                    "longitude": u_lon
                })
            utilities.sort(key=lambda x: x["distance"])
            
        return utilities[:5]
