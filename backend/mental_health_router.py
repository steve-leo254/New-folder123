"""
Mental Health API endpoints
Handles CRUD operations for mental health data including:
- Mood tracking
- Focus sessions
- Game results
- Mental health scores
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field

from database import get_db
from models import User
from auth_router import get_current_active_user

router = APIRouter(prefix="/api/mental-health", tags=["mental-health"])

# Pydantic Models
class MoodEntryCreate(BaseModel):
    mood: int = Field(..., ge=1, le=10)
    energy: int = Field(..., ge=1, le=10)
    anxiety: int = Field(..., ge=1, le=10)
    notes: str = Field(default="")

class MoodEntryResponse(BaseModel):
    id: int
    user_id: int
    date: date
    mood: int
    energy: int
    anxiety: int
    notes: str
    created_at: datetime

class GameResultCreate(BaseModel):
    game: str = Field(..., description="Type of game: memory, reaction, color, focus")
    score: int = Field(..., ge=0)
    level: int = Field(..., ge=1)
    metrics: Dict[str, Any] = Field(default={})

class GameResultResponse(BaseModel):
    id: int
    user_id: int
    game: str
    score: int
    level: int
    metrics: Dict[str, Any]
    timestamp: datetime

class MentalHealthScore(BaseModel):
    overall: int
    stress: int
    anxiety: int
    focus: int
    mood: int
    recommendations: List[str]
    last_updated: datetime

# Mood Tracking Endpoints
@router.post("/mood", response_model=MoodEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_mood_entry(
    mood_data: MoodEntryCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new mood entry."""
    try:
        # Import here to avoid circular imports
        from models import MoodEntry
        
        mood_entry = MoodEntry(
            user_id=current_user.id,
            date=date.today(),
            mood=mood_data.mood,
            energy=mood_data.energy,
            anxiety=mood_data.anxiety,
            notes=mood_data.notes
        )
        
        db.add(mood_entry)
        db.commit()
        db.refresh(mood_entry)
        
        return mood_entry
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create mood entry: {str(e)}"
        )

@router.get("/mood", response_model=List[MoodEntryResponse])
async def get_mood_entries(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    limit: int = 30
):
    """Get user's mood entries."""
    try:
        from models import MoodEntry
        
        mood_entries = db.query(MoodEntry).filter(
            MoodEntry.user_id == current_user.id
        ).order_by(MoodEntry.date.desc()).limit(limit).all()
        
        return mood_entries
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get mood entries: {str(e)}"
        )

# Game Results Endpoints
@router.post("/games", response_model=GameResultResponse, status_code=status.HTTP_201_CREATED)
async def create_game_result(
    game_data: GameResultCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new game result."""
    try:
        from models import GameResult
        
        game_result = GameResult(
            user_id=current_user.id,
            game=game_data.game,
            score=game_data.score,
            level=game_data.level,
            metrics=game_data.metrics,
            timestamp=datetime.utcnow()
        )
        
        db.add(game_result)
        db.commit()
        db.refresh(game_result)
        
        return game_result
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create game result: {str(e)}"
        )

@router.get("/games", response_model=List[GameResultResponse])
async def get_game_results(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    game_type: str = None,
    limit: int = 50
):
    """Get user's game results."""
    try:
        from models import GameResult
        
        query = db.query(GameResult).filter(GameResult.user_id == current_user.id)
        
        if game_type:
            query = query.filter(GameResult.game == game_type)
        
        game_results = query.order_by(GameResult.timestamp.desc()).limit(limit).all()
        
        return game_results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get game results: {str(e)}"
        )

# Mental Health Score Endpoint
@router.get("/score", response_model=MentalHealthScore)
async def get_mental_health_score(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Calculate and return user's mental health score."""
    try:
        from models import MoodEntry, GameResult
        
        # Get mood entries
        mood_entries = db.query(MoodEntry).filter(
            MoodEntry.user_id == current_user.id
        ).order_by(MoodEntry.date.desc()).limit(30).all()
        
        # Get game results
        game_results = db.query(GameResult).filter(
            GameResult.user_id == current_user.id
        ).order_by(GameResult.timestamp.desc()).limit(50).all()
        
        # Calculate scores
        focus_score = 50
        stress_score = 50
        mood_score = 50
        anxiety_score = 50
        
        # Calculate from game results
        memory_results = [r for r in game_results if r.game == 'memory']
        reaction_results = [r for r in game_results if r.game == 'reaction']
        color_results = [r for r in game_results if r.game == 'color']
        focus_results = [r for r in game_results if r.game == 'focus']
        
        if memory_results:
            avg_memory_score = sum(r.score for r in memory_results) / len(memory_results)
            focus_score = min(100, focus_score + avg_memory_score * 0.3)
        
        if reaction_results:
            avg_reaction_score = sum(r.score for r in reaction_results) / len(reaction_results)
            focus_score = min(100, focus_score + avg_reaction_score * 0.2)
        
        if color_results:
            avg_color_score = sum(r.score for r in color_results) / len(color_results)
            focus_score = min(100, focus_score + avg_color_score * 0.2)
        
        if focus_results:
            avg_focus_score = sum(r.score for r in focus_results) / len(focus_results)
            focus_score = min(100, focus_score + avg_focus_score * 0.3)
            stress_score = max(0, stress_score - avg_focus_score * 0.2)
        
        # Calculate from mood entries
        if mood_entries:
            avg_mood = sum(m.mood for m in mood_entries) / len(mood_entries)
            avg_anxiety = sum(m.anxiety for m in mood_entries) / len(mood_entries)
            avg_energy = sum(m.energy for m in mood_entries) / len(mood_entries)
            
            mood_score = avg_mood * 10
            anxiety_score = 100 - (avg_anxiety * 10)
            stress_score = max(0, stress_score - (avg_anxiety * 5))
            focus_score = min(100, focus_score + (avg_energy * 3))
        
        # Calculate overall score
        overall = round((focus_score + stress_score + mood_score + anxiety_score) / 4)
        
        # Generate recommendations
        recommendations = []
        if focus_score < 60:
            recommendations.append('Try more memory and reaction games to improve focus')
        if stress_score < 60:
            recommendations.append('Practice breathing exercises and meditation')
        if mood_score < 60:
            recommendations.append('Consider activities that bring you joy and track your mood regularly')
        if anxiety_score < 60:
            recommendations.append('Try relaxation techniques and consider talking to a mental health professional')
        
        return MentalHealthScore(
            overall=overall,
            stress=round(stress_score),
            anxiety=round(anxiety_score),
            focus=round(focus_score),
            mood=round(mood_score),
            recommendations=recommendations,
            last_updated=datetime.utcnow()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate mental health score: {str(e)}"
        )
