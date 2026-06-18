# ExamPilot ✈️

ExamPilot is a full-stack study journey planner built with **Flask (REST API)** and **React (Vite + Tailwind CSS)**. It automates travel logistics, lodging, and packing checklists for competitive exam candidates (such as JEE, NEET, UPSC, SSC, Banking, and GATE aspirants) who are assigned to unfamiliar cities.

---

## Key Features

1. **User Auth & Social Sign-In**: Secure JWT-based password authentication, user profile management, and **Google Sign-in integration**.
2. **Exam Submission**: Quick reporting wizard collecting Exam Details, Home City, Center Location, Travel preference, Budget, and Hotel accommodations requirement.
3. **Logistics Engine**:
   - **Travel Schedule**: Computes exact departure/arrival dates, estimated duration, and route summaries capped at a maximum travel distance of 2000 km.
   - **Hotel Recommendations**: Generates quiet, study-ready guest houses, student hostelry, or hotel stays scaled dynamically to the user's budget.
   - **Food Recommendations**: Finds vegetarian messes and nearby restaurants close to the exam center.
4. **Interactive Packing Checklist**: Standard pre-exam item checklist (admit cards, stationery, water, tickets) that can be checked off by the student.
5. **Modern Glassmorphism UI**: Beautiful, dark-themed, responsive dashboard and planning screens with micro-animations.

---

## Folder Structure

```text
ExamPilot/
├── backend/                  # Flask REST API
│   ├── app/
│   │   ├── models/           # SQLAlchemy DB Models
│   │   ├── routes/           # REST endpoints blueprints
│   │   ├── services/         # Logistics mock engines (Travel, Hotel, Food)
│   │   └── config.py         # Configs (JWT keys, fallbacks)
│   ├── tests/                # pytest unit/integration tests
│   ├── requirements.txt      # python dependencies
│   ├── Dockerfile
│   └── run.py                # dev entrypoint
├── frontend/                 # React SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # reusable UI blocks (Navbar, Router guards)
│   │   ├── pages/            # Views (Dashboard, Wizards, Detail summaries)
│   │   ├── services/         # API hooks (Axios interceptors)
│   │   └── context/          # Auth Context (State & storage sync)
│   ├── Dockerfile
│   ├── nginx.conf            # SPA routing redirect rule config
│   └── package.json
├── docker-compose.yml        # container layout (db, api, web)
└── README.md
```

---

## How to Run

### Option A: Local Development (Fast Setup)

You can run the application directly on your local system using **SQLite** for the database.

#### 1. Start Flask API
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# Install requirements
pip install -r requirements.txt
# Run tests to verify setup
python -m pytest
# Start the API server
python run.py
```
*The API server will run on `http://localhost:5000` and automatically create `app.db` local SQLite database.*

#### 2. Start React App
*(Since Node is run inside Docker Compose in standard deployments, you can run locally if you have Node/NPM installed)*
```bash
cd frontend
npm install
npm run dev
```
*The React application will launch on `http://localhost:3000`.*

---

### Option B: Run in Docker (Production Stack)

This option spins up the full production architecture: **PostgreSQL** database, **Gunicorn** API container, and **Nginx** hosting the production-compiled React app.

```bash
# At the root directory (where docker-compose.yml resides):
docker-compose up --build
```
*Once built, visit `http://localhost` to view the application.*

---

## API Specifications

| Endpoint | Method | Auth | Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | None | `{ name, email, password }` | Create new account |
| `/api/auth/login` | `POST` | None | `{ email, password }` | Login returning JWT |
| `/api/auth/google` | `POST` | None | `{ email, name }` | Simulated Google SSO login |
| `/api/auth/profile` | `GET/PUT` | JWT | `{ name, password }` | View or edit profile details |
| `/api/plans` | `POST` | JWT | `{ exam_name, exam_date, exam_time, home_city, center_name, center_city, center_address, travel_mode, budget, arrival_preference, accommodation_required }` | Create exam plan & run planning engines |
| `/api/plans` | `GET` | JWT | None | List plans for active user |
| `/api/plans/<id>` | `GET` | JWT | None | Get specific plan with recommendations |
| `/api/plans/<id>` | `DELETE` | JWT | None | Cancel/delete plan |
