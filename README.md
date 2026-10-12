# 🚦 TrafficSense — AI Traffic Prediction & Route Optimization Platform

> **Predict Traffic. Compare Routes. Verify Incidents. Travel Smarter.**

TrafficSense is an enterprise-ready full-stack platform combining the MERN stack (MongoDB, Express, React 19, Node.js) with a Python FastAPI Machine Learning microservice and Tesseract.js OCR verification. It provides real-time traffic prediction, intelligent multi-route optimization, news fact-checking, and interactive OpenStreetMap spatial visualization.

---

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [📦 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🐳 Docker Setup](#-docker-setup)
- [🔑 Environment Variables](#-environment-variables)
- [🎭 Demo Mode](#-demo-mode)
- [🔐 Demo Accounts](#-demo-accounts)
- [🔍 OCR & AI Fact-Checking Engine](#-ocr--ai-fact-checking-engine)
- [🤖 Machine Learning Service](#-machine-learning-service)
- [🧮 Route Optimization Algorithm](#-route-optimization-algorithm)
- [📡 API Reference](#-api-reference)
- [🖥️ UI Pages & Routing](#️-ui-pages--routing)
- [🗺️ Free External APIs](#️-free-external-apis)
- [⚠️ Limitations & Roadmap](#️-limitations--roadmap)
- [📄 License](#-license)

---

## ✨ Key Features

- 🗺️ **Interactive OpenStreetMap Visualization** — Full Leaflet map with CartoDB/OSM tile switching, traffic heatmaps, active incident markers, and detour route overlays.
- ⚡ **AI Multi-Route Optimization** — Computes and compares side-by-side alternative routes (A/B/C) with natural language recommendation rationales.
- 🔍 **OCR Incident Fact-Checking Engine** — Client-side Tesseract.js OCR + NLP verification server endpoint to analyze traffic news, classify real vs. hoax reports, and calculate detour paths.
- 🔮 **Machine Learning Traffic Predictor** — FastAPI microservice running trained Scikit-Learn models (RandomForest & GradientBoosting) to evaluate 4-level congestion severity (Low, Moderate, High, Severe).
- 📰 **News Intelligence Feed** — Geotagged traffic news aggregated across cities with real/fake categorization and spatial mapping.
- 🌦️ **Weather Integration** — Weather-aware risk calculation factoring rain, visibility, temperature, and severe weather conditions into route scoring.
- 📊 **Analytics Dashboard** — Dynamic charts (Recharts) detailing traffic trends, peak hours, incident distributions, and score metrics.
- 🛡️ **Role-Based Auth & Admin Panel** — JWT authentication with Admin dashboard for managing users and handling real-time incident CRUD operations.
- 🎭 **Zero-Config Demo Mode** — 100% operational out of the box without requiring external API keys.

---

## 🏗️ Architecture

```
                                 ┌─────────────────────────┐
                                 │   React 19 Frontend     │
                                 │   (Vite + Tailwind)     │
                                 └────────────┬────────────┘
                                              │ REST API (Axios + JWT)
                                              ▼
                                 ┌─────────────────────────┐
                                 │   Express.js Backend    │
                                 │    (Node.js Server)     │
                                 └──────┬───────────┬──────┘
                                        │           │
                   ┌────────────────────┘           └────────────────────┐
                   ▼                                                     ▼
    ┌─────────────────────────┐                           ┌─────────────────────────┐
    │     MongoDB Database    │                           │  Python FastAPI Service │
    │   (Mongoose Schemas)    │                           │ (Scikit-Learn ML Models)│
    └─────────────────────────┘                           └─────────────────────────┘
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 3, React-Leaflet, Recharts, Tesseract.js, Lucide Icons |
| **Backend API** | Node.js, Express 4, MongoDB, Mongoose 8, JWT, bcrypt, Helmet, Morgan, Node-Cache |
| **ML Microservice** | Python 3.11, FastAPI, Uvicorn, Scikit-Learn, Pandas, NumPy, Joblib, Pydantic |
| **Maps & Routing** | OpenStreetMap, CartoDB tiles, Nominatim Geocoding, OpenRouteService |
| **OCR & NLP** | Tesseract.js in-browser engine, NLP classification heuristic engine |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Project Structure

```
TrafficSense/
├── backend/                  # Express.js REST API
│   ├── config/               # Database & server configuration
│   ├── controllers/          # Request handlers (Auth, Routes, Traffic, News, ML, Admin)
│   ├── middleware/           # Auth, rate limiting, error handling middleware
│   ├── models/               # Mongoose data models (User, Incident, News, Weather, Prediction)
│   ├── routes/               # API endpoints (/auth, /routes, /traffic, /news, /weather, /predictions, /admin)
│   ├── services/             # Core business logic (Geocoding, OpenRouteService, News, Optimization, ML integration)
│   ├── utils/                # In-memory DemoStore & fallback generators
│   ├── seed.js               # Database seeder script
│   └── server.js             # Express entry point
├── frontend/                 # React 19 + Vite Web Application
│   ├── src/
│   │   ├── api/              # Axios HTTP client configuration
│   │   ├── components/       # UI components, MapView (Leaflet), IncidentOCRVerifier, NewsCards, WeatherWidget
│   │   ├── context/          # React AuthContext & ThemeContext
│   │   ├── layouts/          # DashboardLayout & Navigation sidebar/header
│   │   ├── pages/            # Landing, Dashboard, RoutePlanner, TrafficMap, News, Analytics, Predict, Admin, Profile
│   │   └── utils/            # Helper utilities and formatters
│   ├── tailwind.config.js    # Tailwind styling tokens
│   └── vite.config.js        # Vite build configuration
├── ml-service/               # Python FastAPI Microservice
│   ├── data/                 # Datasets & synthetic data generator
│   ├── models/               # Saved trained model artifacts (.pkl / .joblib)
│   ├── main.py               # FastAPI application server
│   ├── generate_dataset.py   # Synthetic traffic data generator
│   ├── train.py              # ML model trainer (RandomForest / GradientBoosting)
│   ├── predict.py            # Inference engine
│   └── evaluate.py           # Model metrics & evaluation
└── docker-compose.yml        # Orchestration for MongoDB, Backend, Frontend, and ML Service
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: `>= 18.x`
- **Python**: `>= 3.10.x`
- **MongoDB**: Local MongoDB instance or Atlas connection string

---

### 1. Clone Repository

```bash
git clone <repo-url>
cd TrafficSense
```

---

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Optional: Edit .env to set API keys or MongoDB connection
npm install
npm run dev
```

*Backend runs at: `http://localhost:5000`*

---

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

*Frontend runs at: `http://localhost:5173`*

---

### 4. ML Microservice Setup

```bash
cd ml-service

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows: venv\Scripts\activate | Linux/macOS: source venv/bin/activate

pip install -r requirements.txt

# Generate synthetic training dataset
python generate_dataset.py

# Train ML model
python train.py

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

*ML Service runs at: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)*

---

### 5. Database Seeding (Optional)

To seed initial demo users, incidents, weather records, news articles, and predictions:

```bash
cd backend
npm run seed
```

---

## 🐳 Docker Setup

Run the full stack (Frontend, Backend API, Python ML Service, and MongoDB) with a single command:

```bash
docker compose up --build
```

### Container Services & Ports

| Container | Host Address | Description |
|-----------|--------------|-------------|
| **Frontend** | `http://localhost:3000` | Nginx static frontend web server |
| **Backend** | `http://localhost:5000` | Express REST API server |
| **ML Service** | `http://localhost:8000` | Python FastAPI machine learning server |
| **MongoDB** | `localhost:27017` | MongoDB Database container |

---

## 🔑 Environment Variables

### Backend Environment (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trafficsense
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# DEMO MODE — set true to operate without paid external API keys
DEMO_MODE=true

# Optional live API keys
NEWS_API_KEY=your_gnews_or_newsapi_key
NEWS_API_PROVIDER=gnews   # Options: gnews | newsapi
WEATHER_API_KEY=your_openweathermap_key
ROUTING_API_KEY=your_openrouteservice_key
ROUTING_API_URL=https://api.openrouteservice.org/v2/directions

ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎭 Demo Mode

When `DEMO_MODE=true` is set in `backend/.env` (default), the platform operates standalone without external dependencies:

- ✅ **Simulated Route Calculation**: Generates accurate path points and metrics between any origin & destination.
- ✅ **Built-in Weather Generator**: Mock weather data for supported cities.
- ✅ **Demo News Feed**: Curated traffic news headlines with real vs. hoax categorization.
- ✅ **Seeded Incident Engine**: Pre-populated traffic incidents with interactive map locations.
- ✅ **Heuristic Fallback ML**: Fallback prediction heuristics if the ML service is offline.

---

## 🔐 Demo Accounts

Seeded credentials created via `npm run seed`:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@trafficsense.com` | `Admin@123` | Full system access, Incident CRUD, User Management |
| **User** | `demo@trafficsense.com` | `User@123` | Route planning, predictions, news, profile |

> ⚠️ **Important**: Update demo passwords before deploying to production!

---

## 🔍 OCR & AI Fact-Checking Engine

TrafficSense features an integrated **OCR & Incident Fact-Checker** (`IncidentOCRVerifier.jsx` + `POST /api/news/verify`):

1. **OCR Text Extraction**: Users upload screenshots or images of traffic bulletins; Tesseract.js parses the image into plain text.
2. **Real vs. Hoax Analysis**: Text is evaluated against linguistic and spatial markers to verify authenticity and flag viral hoaxes.
3. **Spatial Extraction**: Detects affected corridors, severity index, estimated radius, and incident classification (accident, flooding, construction, road closure).
4. **Automated Detour Generation**: Automatically injects verified incidents into the traffic map and calculates alternative detour routes avoiding affected coordinates.

---

## 🤖 Machine Learning Service

The ML service (`ml-service/`) predicts 4-level traffic congestion severity:
- `0`: Low
- `1`: Moderate
- `2`: High
- `3`: Severe

### Feature Vector

- **Temporal Features**: Hour of day, day of week, month, weekend flag, holiday flag.
- **Weather Conditions**: Temperature, rainfall (mm), visibility (m), condition code.
- **Road & Traffic Parameters**: Road type (highway, arterial, local), speed limit, estimated vehicle count, capacity ratio.
- **Incident Indicators**: Accident flag, construction flag, event flag.

### Pipeline Commands

```bash
cd ml-service
python generate_dataset.py --samples 15000   # Generate training dataset
python train.py --model random_forest        # Train Random Forest classifier
python evaluate.py                           # Output confusion matrix & metrics
```

---

## 🧮 Route Optimization Algorithm

Routes are evaluated using a multi-factor composite risk scoring formula:

$$\text{routeScore} = 0.40 \cdot S_{\text{traffic}} + 0.25 \cdot S_{\text{time}} + 0.15 \cdot R_{\text{incident}} + 0.10 \cdot R_{\text{weather}} + 0.10 \cdot S_{\text{distance}}$$

*Where a **lower score** represents a faster, safer, and less congested route.*

- **$S_{\text{traffic}}$**: Average segment traffic congestion index (0–100)
- **$S_{\text{time}}$**: Duration relative to free-flow travel time
- **$R_{\text{incident}}$**: Proximity to active incidents and severity weighting
- **$R_{\text{weather}}$**: Weather hazard index (rain, low visibility)
- **$S_{\text{distance}}$**: Distance ratio relative to shortest path

---

## 📡 API Reference

### Health & Auth
- `GET /api/health` — System status & version
- `POST /api/auth/register` — Create new user account
- `POST /api/auth/login` — Authenticate user & retrieve JWT
- `GET /api/auth/me` — Retrieve current authenticated user profile

### Route Operations
- `POST /api/routes/calculate` — Calculate & optimize alternative routes
- `GET /api/routes/history` — Get user's past route searches
- `GET /api/routes/geocode` — Forward geocoding query
- `GET /api/routes/reverse-geocode` — Reverse geocoding (lat/lng to address)

### Traffic & Incidents
- `GET /api/traffic/current` — Fetch active traffic incidents
- `GET /api/traffic/nearby` — Get incidents near specific lat/lng
- `GET /api/traffic/hotspots` — Aggregated high-congestion hotspots
- `GET /api/traffic/stats` — Overall traffic statistics

### News & Verification
- `GET /api/news/traffic-news` — Fetch traffic news headlines by city
- `POST /api/news/verify` — OCR & AI incident verification engine

### Weather & Predictions
- `GET /api/weather/current` — Current weather data for location
- `POST /api/predictions/predict` — Send feature payload for ML severity prediction
- `GET /api/predictions/history` — Get prediction history
- `GET /api/predictions/analytics` — Prediction distribution statistics

### Admin Controls *(Admin Auth Required)*
- `GET /api/admin/stats` — System health & statistics
- `GET /api/admin/users` — List all registered users
- `GET /api/admin/incidents` — List all incidents
- `POST /api/admin/incidents` — Create a new incident
- `PUT /api/admin/incidents/:id` — Update incident details
- `DELETE /api/admin/incidents/:id` — Remove an incident

---

## 🖥️ UI Pages & Routing

| Page Name | Path | Access | Features |
|-----------|------|--------|----------|
| **Landing Page** | `/` | Public | Overview, feature highlight, quick portal entry |
| **Dashboard** | `/dashboard` | Public | Real-time traffic summary, active alerts, quick search |
| **Route Planner** | `/route-planner` | Public | Multi-route comparison, OpenStreetMap routing, route cards |
| **Traffic Map** | `/traffic-map` | Public | Full-screen interactive map, heatmaps, layer toggles, incident markers |
| **News Intelligence** | `/news` | Public | Traffic news feed, Tesseract OCR verifier, detour generator |
| **Analytics** | `/analytics` | Public | Recharts data analytics, congestion patterns, peak hour analysis |
| **AI Predictor** | `/predict` | Public | Interactive ML input form, model prediction output |
| **Login / Register** | `/login`, `/register` | Public | JWT authentication forms |
| **User Profile** | `/profile` | User Auth | User route history, saved routes, account preferences |
| **Admin Control** | `/admin` | Admin Auth | Incident CRUD, user management, platform metrics |

---

## 🗺️ Free External APIs

All optional third-party services support free tiers without mandatory credit card registration:

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **OpenStreetMap** | Map tiles & base data | Unlimited (Open source) |
| **CartoDB** | Dark/Light map tiles | Free tier available |
| **Nominatim** | Geocoding & Search | Rate-limited (1 req/sec) |
| **OpenRouteService** | Directions & Routing API | 2,000 requests/day |
| **OpenWeatherMap** | Live weather conditions | 1,000 calls/day |
| **GNews API** | Real-time traffic headlines | 100 requests/day |

---

## ⚠️ Limitations & Roadmap

### Current Limitations
1. **Synthetic Training Dataset**: The ML model is trained on realistic synthetic data; real-world deployment should ingest municipal traffic sensor feeds.
2. **Geocoding Rate Limits**: Nominatim OSM geocoding is rate-limited to 1 req/sec in public demo mode.

### Future Roadmap
- [ ] Real-time WebSocket feed for live incident notifications.
- [ ] Turn-by-turn voice navigation support.
- [ ] GPS live tracking & real-time re-routing.
- [ ] React Native companion mobile app.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

*Built with ❤️ using MERN + Python ML · OpenStreetMap contributors*
