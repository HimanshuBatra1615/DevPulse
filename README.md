# 🚀 DevPulse — AI-Powered Developer Productivity OS

> Track coding sessions, manage tasks, analyze focus patterns — and get ML-driven productivity insights.

![DevPulse Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-green?logo=spring) ![React](https://img.shields.io/badge/React-18-blue?logo=react) ![Python](https://img.shields.io/badge/FastAPI-0.111-teal?logo=fastapi) ![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │Dashboard │ │ Sessions │ │  Tasks   │ │ AI Insights      │  │
│  │Live Timer│ │ Heatmap  │ │ Kanban   │ │ Focus + Burnout  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│          │ REST API    │ WebSocket/STOMP    │ REST API         │
└──────────┼─────────────┼───────────────────┼──────────────────┘
           ▼             ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                Spring Boot 3 Backend                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │JWT Auth  │ │Session   │ │Task CRUD │ │ML Client Service │  │
│  │+ OAuth2  │ │Event-Src │ │Priority Q│ │(WebClient)       │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┬─────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │            │
│  │Spring    │ │WebSocket │ │Redis     │          │            │
│  │Security  │ │STOMP     │ │Caching   │          │            │
│  └──────────┘ └──────────┘ └──────────┘          │            │
└────────┬─────────────┬──────────┬────────────────┼────────────┘
         ▼             ▼          ▼                ▼
  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────┐
  │PostgreSQL│  │  Redis   │  │  Python FastAPI ML Service   │
  │   16     │  │    7     │  │  ┌────────┐ ┌────────────┐  │
  │          │  │          │  │  │Focus   │ │Burnout     │  │
  │          │  │          │  │  │Score   │ │Detector    │  │
  └──────────┘  └──────────┘  │  └────────┘ └────────────┘  │
                              │  ┌────────┐ ┌────────────┐  │
                              │  │Peak    │ │Task ETA    │  │
                              │  │Hours   │ │Predictor   │  │
                              │  └────────┘ └────────────┘  │
                              └──────────────────────────────┘
```

## ✨ Features

### Core SDE Features
- **JWT + GitHub OAuth2 Authentication** — Register/login with refresh token rotation, GitHub SSO
- **Event-Sourced Session Tracking** — Immutable session event log (start/pause/resume/stop)
- **Task Management with Priority Queue** — Kanban board, status transitions, deadline tracking
- **Real-Time Session Timer via WebSocket** — STOMP over SockJS, live clock updates
- **Role-Based Access Control (RBAC)** — USER and ADMIN roles with method-level security
- **Redis Caching Layer** — Dashboard stats cached with TTL, invalidated on state changes

### ML Intelligence Layer
- **Focus Score Prediction** — Circadian-rhythm-based model predicts focus quality (0-100)
- **Burnout Risk Detection** — Rolling 7-day window analysis with rule-based + ML classifier
- **Peak Productivity Hours Heatmap** — GitHub-style 7×24 grid showing optimal coding windows
- **Task Completion ETA Predictor** — Personalized linear model based on user history

### Premium UI
- **Dark Glassmorphism Design** — Deep-space dark theme with frosted glass effects
- **Animated Dashboard** — Live timer with pulse animation, count-up stat cards
- **GitHub-Style Contribution Heatmap** — 365-day SVG calendar with tooltip hover
- **Interactive Charts** — Area, bar, donut, and line charts via Recharts
- **Kanban Task Board** — Drag-and-drop columns with priority color coding
- **AI Insights Panel** — Animated focus gauge, burnout risk card, ETA predictions

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4, Recharts, Zustand, Framer Motion |
| Backend | Spring Boot 3.2, Spring Security 6, Spring Data JPA, WebSocket STOMP |
| ML Service | Python 3.11, FastAPI, scikit-learn, NumPy |
| Database | PostgreSQL 16, Redis 7 |
| Auth | JWT (jjwt 0.12), GitHub OAuth2, BCrypt |
| Infrastructure | Docker Compose, Render |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Python 3.11+
- Docker (optional)

### Frontend (React)
```bash
cd DevPulse
npm install
npm run dev     # http://localhost:3000
```

### Backend (Spring Boot)
```bash
cd devpulse-backend
./mvnw spring-boot:run    # http://localhost:8080
```

### ML Service (FastAPI)
```bash
cd devpulse-ml
pip install -r requirements.txt
python -m uvicorn app.main:app --reload    # http://localhost:8000
```

### Docker Compose (All Services)
```bash
docker compose up --build    # Everything at once
```

## 📊 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with JWT |
| POST | `/api/auth/refresh` | Rotate refresh token |
| GET | `/api/auth/me` | Current user profile |

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions/start` | Start coding session |
| POST | `/api/sessions/{id}/stop` | Stop session |
| POST | `/api/sessions/{id}/pause` | Pause session |
| POST | `/api/sessions/{id}/resume` | Resume session |
| GET | `/api/sessions/active` | Get active session |
| GET | `/api/sessions/history` | Session history |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filterable) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/status` | Change status |
| DELETE | `/api/tasks/{id}` | Delete task |

### Analytics & ML
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/insights/focus-score` | AI focus prediction |
| GET | `/api/insights/burnout-risk` | Burnout detection |
| GET | `/api/insights/peak-hours` | Peak productivity heatmap |
| GET | `/api/admin/stats` | Admin platform stats |

## 📝 Resume Bullet Templates

> Fill in your actual numbers once deployed:

- Architected a full-stack developer productivity platform with **Spring Boot 3** REST APIs, **JWT + GitHub OAuth2** authentication, **WebSocket** real-time session tracking, and **Redis** caching — deployed on Render via Docker.
- Engineered an **event-sourced** session logging system with RBAC using Spring Security, reducing dashboard query latency by ~**X%** via Redis TTL caching on aggregate stats.
- Built a **Python FastAPI ML microservice** integrated with the Spring Boot backend to predict developer focus scores and detect burnout risk using personalised regression models on session time-series data.
- Developed a React + Recharts analytics dashboard with a **GitHub-style contribution heatmap**, real-time WebSocket timer, and AI Insights panel surfacing ML predictions to end users.

## 📄 License

MIT
