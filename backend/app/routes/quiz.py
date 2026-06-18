from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.firebase_auth import get_current_user, get_firestore_client
from app.agents.quiz_agent import generate_quiz, evaluate_quiz
from app.agents.language_agent import validate_language
from app.agents.persona_agent import validate_persona
from pydantic import BaseModel
from typing import Optional
import datetime

router = APIRouter()
db = get_firestore_client()

class SubmitAnswersRequest(BaseModel):
    quiz_id: str
    answers: dict  # { "0": "A", "1": "C", ... }

@router.post("/generate/{document_id}")
async def create_quiz(
    document_id: str,
    count: int = Query(default=10, ge=1, le=20, description="Number of questions (max 20)"),
    difficulty: str = Query(default="medium", description="easy, medium or hard"),
    language_code: str = Query(default="en", description="Language for output content"),
    persona: str = Query(default="university", description="User persona: kid, secondary, university, casual"),
    timed: bool = Query(default=False, description="Whether the quiz is timed"),
    time_limit: Optional[int] = Query(default=None, description="Time limit in minutes (required if timed=true)"),
    user: dict = Depends(get_current_user)
):
    """
    Generates a multiple choice quiz from a document.

    - timed=false: no time limit
    - timed=true: requires time_limit in minutes
    - language_code: language to generate quiz in
    - persona: adjusts tone and question style
    """
    if difficulty not in ["easy", "medium", "hard"]:
        raise HTTPException(status_code=400, detail="Difficulty must be easy, medium or hard")

    if not validate_language(language_code):
        raise HTTPException(status_code=400, detail=f"Unsupported language code: {language_code}")

    if not validate_persona(persona):
        raise HTTPException(status_code=400, detail=f"Invalid persona. Choose from: kid, secondary, university, casual")

    if timed and not time_limit:
        raise HTTPException(status_code=400, detail="time_limit in minutes is required when timed is true")

    if timed and time_limit < 1:
        raise HTTPException(status_code=400, detail="time_limit must be at least 1 minute")

    doc_ref = db.collection("documents").document(document_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    data = doc.to_dict()

    if data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    questions = await generate_quiz(
        raw_text=data["raw_text"],
        subject=data["subject"],
        count=count,
        difficulty=difficulty,
        output_language_code=language_code,
        persona=persona
    )

    started_at = datetime.datetime.utcnow()
    expires_at = (started_at + datetime.timedelta(minutes=time_limit)).isoformat() if timed else None

    quiz_ref = db.collection("quizzes").document()
    quiz_ref.set({
        "user_id": user["uid"],
        "document_id": document_id,
        "title": data["title"],
        "difficulty": difficulty,
        "language_code": language_code,
        "persona": persona,
        "timed": timed,
        "time_limit_minutes": time_limit if timed else None,
        "started_at": started_at.isoformat(),
        "expires_at": expires_at,
        "questions": questions,
        "created_at": started_at.isoformat()
    })

    return {
        "quiz_id": quiz_ref.id,
        "title": data["title"],
        "difficulty": difficulty,
        "language_code": language_code,
        "persona": persona,
        "timed": timed,
        "time_limit_minutes": time_limit if timed else None,
        "expires_at": expires_at,
        "total_questions": len(questions),
        "questions": questions
    }


@router.post("/submit")
async def submit_quiz(
    body: SubmitAnswersRequest,
    user: dict = Depends(get_current_user)
):
    """
    Student submits their answers.
    If the quiz is timed, checks whether the student submitted before time expired.
    """
    quiz_ref = db.collection("quizzes").document(body.quiz_id)
    quiz = quiz_ref.get()

    if not quiz.exists:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz_data = quiz.to_dict()

    if quiz_data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if quiz_data.get("timed") and quiz_data.get("expires_at"):
        expires_at = datetime.datetime.fromisoformat(quiz_data["expires_at"])
        if datetime.datetime.utcnow() > expires_at:
            raise HTTPException(
                status_code=400,
                detail="Time is up. This quiz has expired and can no longer be submitted."
            )

    result = evaluate_quiz(quiz_data["questions"], body.answers)

    result_ref = db.collection("quiz_results").document()
    result_ref.set({
        "user_id": user["uid"],
        "quiz_id": body.quiz_id,
        "document_id": quiz_data["document_id"],
        "timed": quiz_data.get("timed", False),
        "time_limit_minutes": quiz_data.get("time_limit_minutes"),
        **result,
        "submitted_at": datetime.datetime.utcnow().isoformat()
    })

    return {
        "result_id": result_ref.id,
        **result
    }


@router.get("/results/{document_id}")
async def get_quiz_results(
    document_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Fetches all past quiz results for a document.
    """
    results = db.collection("quiz_results")\
        .where("document_id", "==", document_id)\
        .where("user_id", "==", user["uid"])\
        .stream()

    history = []
    for doc in results:
        data = doc.to_dict()
        history.append({
            "result_id": doc.id,
            "score": data["score"],
            "total": data["total"],
            "percentage": data["percentage"],
            "feedback": data["feedback"],
            "timed": data.get("timed", False),
            "time_limit_minutes": data.get("time_limit_minutes"),
            "submitted_at": data["submitted_at"]
        })

    return {
        "document_id": document_id,
        "attempts": len(history),
        "history": history
    }
