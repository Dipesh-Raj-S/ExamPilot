import json

def test_health(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json == {"status": "healthy"}

def test_auth_flow(client):
    # 1. Register a user
    reg_data = {
        "name": "Test Student",
        "email": "test@student.com",
        "password": "securepassword123"
    }
    response = client.post('/api/auth/register', json=reg_data)
    assert response.status_code == 201
    assert "access_token" in response.json
    assert response.json["user"]["email"] == "test@student.com"
    
    # 2. Login user
    login_data = {
        "email": "test@student.com",
        "password": "securepassword123"
    }
    response = client.post('/api/auth/login', json=login_data)
    assert response.status_code == 200
    token = response.json["access_token"]
    
    # 3. Get profile
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get('/api/auth/profile', headers=headers)
    assert response.status_code == 200
    assert response.json["name"] == "Test Student"

def test_google_login(client):
    google_data = {
        "email": "google@student.com",
        "name": "Google Student"
    }
    response = client.post('/api/auth/google', json=google_data)
    assert response.status_code == 200
    assert "access_token" in response.json
    assert response.json["user"]["email"] == "google@student.com"

def test_exam_plan_flow(client):
    # Register & Login
    reg_data = {"name": "Aspirant", "email": "aspirant@test.com", "password": "pass"}
    client.post('/api/auth/register', json=reg_data)
    login_res = client.post('/api/auth/login', json={"email": "aspirant@test.com", "password": "pass"})
    token = login_res.json["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Exam Plan
    plan_data = {
        "exam_name": "JEE Advanced",
        "exam_date": "2027-05-30",
        "exam_time": "09:00",
        "home_city": "Nagpur",
        "center_name": "IIT Bombay Center",
        "center_city": "Mumbai",
        "center_address": "IIT Powai, Mumbai",
        "travel_mode": "Train",
        "budget": 6000.0,
        "arrival_preference": "1_day_before",
        "accommodation_required": True
    }
    
    response = client.post('/api/plans', json=plan_data, headers=headers)
    assert response.status_code == 201
    plan = response.json
    
    assert plan["exam_name"] == "JEE Advanced"
    assert plan["arrival_preference"] == "1_day_before"
    assert plan["arrival_date"] == "2027-05-29" # 1 day before May 30
    assert len(plan["travel_checklist"]) > 0
    assert len(plan["hotels"]) == 3
    assert len(plan["restaurants"]) == 3
    
    plan_id = plan["id"]
    
    # List Exam Plans
    response = client.get('/api/plans', headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 1
    
    # Get Individual Plan
    response = client.get(f'/api/plans/{plan_id}', headers=headers)
    assert response.status_code == 200
    assert response.json["id"] == plan_id
    
    # Delete Exam Plan
    response = client.delete(f'/api/plans/{plan_id}', headers=headers)
    assert response.status_code == 200
    
    # Verify deleted
    response = client.get(f'/api/plans/{plan_id}', headers=headers)
    assert response.status_code == 404
