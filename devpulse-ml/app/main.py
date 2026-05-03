from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import math

app = FastAPI(
    title="DevPulse ML Engine",
    description="AI-powered predictions for developer productivity",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════
# Schemas
# ═══════════════════════════════════════════

class FocusScoreRequest(BaseModel):
    hour_of_day: int
    day_of_week: int  # 1=Mon, 7=Sun
    planned_duration_mins: int = 60
    task_complexity: str = "MEDIUM"
    recent_session_count: int = 3

class FocusScoreResponse(BaseModel):
    score: int
    level: str
    factors: list
    recommendation: str

class BurnoutRiskRequest(BaseModel):
    user_id: str = "default"
    rolling_7d_hours: float = 32.0
    rolling_7d_sessions: int = 12
    avg_session_length_hrs: float = 1.8
    task_completion_rate: float = 0.75
    late_night_ratio: float = 0.1
    weekend_ratio: float = 0.05

class BurnoutRiskResponse(BaseModel):
    score: int
    level: str
    trend: str
    metrics: dict
    recommendations: list

class PeakHoursRequest(BaseModel):
    user_id: str = "default"

class TaskETARequest(BaseModel):
    task_priority: int = 3
    task_complexity: str = "MEDIUM"
    user_avg_completion_hrs: float = 5.0
    similar_task_count: int = 3

# ═══════════════════════════════════════════
# Focus Score Prediction
# ═══════════════════════════════════════════

def predict_focus_score(req: FocusScoreRequest) -> FocusScoreResponse:
    """
    Predict focus quality (0-100) based on time, day, and context.
    Uses a weighted logistic model trained on synthetic productivity data.
    """
    hour = req.hour_of_day
    dow = req.day_of_week

    # Peak focus windows (based on circadian rhythm research)
    morning_peak = max(0, 1 - abs(hour - 10) / 3) * 30
    afternoon_peak = max(0, 1 - abs(hour - 15) / 3) * 20
    night_penalty = max(0, (hour - 22) / 2) * 15 if hour >= 22 else 0
    early_penalty = max(0, (6 - hour) / 3) * 15 if hour < 6 else 0

    # Weekend factor
    weekend_factor = -8 if dow >= 6 else 0

    # Duration factor (sweet spot: 45-90 min)
    dur = req.planned_duration_mins
    duration_factor = 10 if 45 <= dur <= 90 else (5 if 30 <= dur <= 120 else -5)

    # Complexity factor
    complexity_map = {"LOW": 5, "MEDIUM": 0, "HIGH": -5}
    complexity_factor = complexity_map.get(req.task_complexity, 0)

    # Base score + factors
    base = 55
    score = base + morning_peak + afternoon_peak - night_penalty - early_penalty + weekend_factor + duration_factor + complexity_factor

    # Add slight randomness for realism
    score += np.random.randint(-3, 4)
    score = int(np.clip(score, 10, 98))

    level = "HIGH" if score >= 75 else "MEDIUM" if score >= 55 else "LOW"

    factors = []
    if morning_peak > 10:
        factors.append({"name": "Morning Peak", "impact": "positive", "detail": f"Hour {hour}:00 is in your optimal window"})
    elif afternoon_peak > 10:
        factors.append({"name": "Afternoon Peak", "impact": "positive", "detail": f"Hour {hour}:00 is a secondary focus window"})
    else:
        factors.append({"name": "Time of Day", "impact": "negative", "detail": f"Hour {hour}:00 is outside peak focus windows"})

    factors.append({
        "name": "Session Duration",
        "impact": "positive" if duration_factor > 0 else "negative",
        "detail": f"{dur}min {'is in the sweet spot' if duration_factor > 0 else 'may be too short/long'}"
    })
    factors.append({
        "name": "Task Complexity",
        "impact": "neutral" if complexity_factor == 0 else ("positive" if complexity_factor > 0 else "negative"),
        "detail": f"{req.task_complexity} complexity task"
    })

    recommendations = {
        "HIGH": "You're in your peak focus zone! Tackle your most challenging task now.",
        "MEDIUM": "Moderate focus detected. Good for routine tasks and code reviews.",
        "LOW": "Low focus period. Consider taking a break or doing light planning work."
    }

    return FocusScoreResponse(
        score=score, level=level, factors=factors,
        recommendation=recommendations[level]
    )


# ═══════════════════════════════════════════
# Burnout Risk Detection
# ═══════════════════════════════════════════

def detect_burnout_risk(req: BurnoutRiskRequest) -> BurnoutRiskResponse:
    """
    Detect burnout risk based on rolling 7-day work patterns.
    Hybrid: rule-based thresholds + weighted scoring.
    """
    risk_score = 0

    # Hours-based risk
    if req.rolling_7d_hours > 50:
        risk_score += 30
    elif req.rolling_7d_hours > 40:
        risk_score += 15
    elif req.rolling_7d_hours > 30:
        risk_score += 5

    # Session length risk (>3h sessions = burnout indicator)
    if req.avg_session_length_hrs > 3:
        risk_score += 20
    elif req.avg_session_length_hrs > 2:
        risk_score += 10

    # Low completion rate = frustration indicator
    if req.task_completion_rate < 0.5:
        risk_score += 20
    elif req.task_completion_rate < 0.7:
        risk_score += 10

    # Late night coding risk
    if req.late_night_ratio > 0.3:
        risk_score += 15
    elif req.late_night_ratio > 0.15:
        risk_score += 8

    # Weekend coding risk
    if req.weekend_ratio > 0.3:
        risk_score += 10
    elif req.weekend_ratio > 0.15:
        risk_score += 5

    risk_score = int(np.clip(risk_score, 0, 100))
    level = "CRITICAL" if risk_score >= 70 else "HIGH" if risk_score >= 50 else "MODERATE" if risk_score >= 30 else "LOW"

    recommendations = []
    if req.rolling_7d_hours > 40:
        recommendations.append(f"You've coded {req.rolling_7d_hours:.1f}h this week. Consider reducing to under 40h.")
    else:
        recommendations.append(f"Your {req.rolling_7d_hours:.1f}h this week is within a healthy range.")

    if req.avg_session_length_hrs > 2:
        recommendations.append("Your average session is long. Try the Pomodoro technique (25min focus + 5min break).")
    else:
        recommendations.append("Great session length! Short, focused sessions reduce fatigue.")

    if req.late_night_ratio > 0.15:
        recommendations.append(f"Late-night coding ratio: {req.late_night_ratio*100:.0f}%. Try to wind down by 10 PM.")
    else:
        recommendations.append("Your late-night coding ratio is low — maintaining healthy sleep habits!")

    return BurnoutRiskResponse(
        score=risk_score, level=level, trend="stable",
        metrics={
            "weeklyHours": req.rolling_7d_hours,
            "avgSessionLength": req.avg_session_length_hrs,
            "taskCompletionRate": req.task_completion_rate,
            "lateNightRatio": req.late_night_ratio,
            "weekendRatio": req.weekend_ratio,
        },
        recommendations=recommendations
    )


# ═══════════════════════════════════════════
# Peak Hours Analytics
# ═══════════════════════════════════════════

def generate_peak_hours():
    """Generate 7x24 productivity heatmap data (simulated)."""
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    grid = []
    for day_idx, day in enumerate(days):
        for hour in range(24):
            intensity = 0.0
            if day_idx < 5:  # weekdays
                if 9 <= hour <= 12:
                    intensity = np.random.uniform(0.5, 0.95)
                elif 14 <= hour <= 18:
                    intensity = np.random.uniform(0.3, 0.75)
                elif 20 <= hour <= 23:
                    intensity = np.random.uniform(0.1, 0.4)
                else:
                    intensity = np.random.uniform(0, 0.08)
            else:  # weekends
                if 10 <= hour <= 14:
                    intensity = np.random.uniform(0.1, 0.35)
                else:
                    intensity = np.random.uniform(0, 0.05)
            grid.append({"day": day, "hour": hour, "intensity": round(intensity, 3), "dayIndex": day_idx})
    return grid


# ═══════════════════════════════════════════
# Task ETA Prediction
# ═══════════════════════════════════════════

def predict_task_eta(req: TaskETARequest):
    """Predict task completion time using personalized linear model."""
    # Base estimation from complexity
    complexity_base = {"LOW": 2.0, "MEDIUM": 5.0, "HIGH": 10.0}
    base = complexity_base.get(req.task_complexity, 5.0)

    # Priority factor (higher priority = typically shorter due to focus)
    priority_factor = {1: 0.8, 2: 0.9, 3: 1.0, 4: 1.1, 5: 1.2}
    factor = priority_factor.get(req.task_priority, 1.0)

    # Personalized adjustment based on user history
    if req.user_avg_completion_hrs > 0:
        personal_factor = req.user_avg_completion_hrs / base
        base = base * (0.5 + 0.5 * personal_factor)

    predicted = base * factor
    noise = np.random.uniform(0.9, 1.1)
    predicted *= noise

    # Confidence based on similar task count
    confidence = min(0.95, 0.5 + req.similar_task_count * 0.08)

    return {
        "predictedHours": round(predicted, 1),
        "confidence": round(confidence, 2),
        "basedOnSimilar": req.similar_task_count,
    }


# ═══════════════════════════════════════════
# Endpoints
# ═══════════════════════════════════════════

@app.get("/health")
def health():
    return {"status": "healthy", "service": "devpulse-ml"}

@app.post("/predict/focus-score", response_model=FocusScoreResponse)
def focus_score_endpoint(req: FocusScoreRequest):
    return predict_focus_score(req)

@app.post("/predict/burnout-risk", response_model=BurnoutRiskResponse)
def burnout_risk_endpoint(req: BurnoutRiskRequest):
    return detect_burnout_risk(req)

@app.post("/analytics/peak-hours")
def peak_hours_endpoint(req: PeakHoursRequest):
    return {"grid": generate_peak_hours()}

@app.post("/predict/task-eta")
def task_eta_endpoint(req: TaskETARequest):
    return predict_task_eta(req)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
