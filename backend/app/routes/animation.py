from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.firebase_auth import get_current_user, get_firestore_client
from app.agents.animation_agent import generate_intro_animation, generate_concept_animation, regenerate_concept_animation
from app.agents.language_agent import validate_language
from app.agents.persona_agent import validate_persona
from pydantic import BaseModel
from typing import Optional
import datetime

router = APIRouter()
db = get_firestore_client()


@router.post("/intro/{document_id}")
async def create_intro_animation(
    document_id: str,
    language_code: str = Query(default="en"),
    persona: str = Query(default="university"),
    user: dict = Depends(get_current_user)
):
    """
    Generates the introductory overview animation for a document.
    This is the first animation the student watches before exploring concepts.
    """
    if not validate_language(language_code):
        raise HTTPException(status_code=400, detail=f"Unsupported language code: {language_code}")

    if not validate_persona(persona):
        raise HTTPException(status_code=400, detail=f"Invalid persona. Choose from: kid, secondary, university, casual")

    doc_ref = db.collection("documents").document(document_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    data = doc.to_dict()

    if data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    scene_script = await generate_intro_animation(
        title=data["title"],
        subject=data["subject"],
        summary=data["summary"],
        key_concepts=data["key_concepts"],
        output_language_code=language_code,
        persona=persona
    )

    animation_ref = db.collection("animations").document()
    animation_ref.set({
        "user_id": user["uid"],
        "document_id": document_id,
        "type": "intro",
        "language_code": language_code,
        "persona": persona,
        "scene_script": scene_script,
        "created_at": datetime.datetime.utcnow().isoformat()
    })

    return {
        "animation_id": animation_ref.id,
        "type": "intro",
        "language_code": language_code,
        "persona": persona,
        "scene_script": scene_script
    }


@router.post("/concept/{document_id}")
async def create_concept_animation(
    document_id: str,
    concept_name: str = Query(..., description="Name of the concept to animate"),
    language_code: str = Query(default="en"),
    persona: str = Query(default="university"),
    user: dict = Depends(get_current_user)
):
    """
    Generates a deep focused animation for one specific concept.
    Depth scales automatically with complexity:
    - basic       → 4 to 5 scenes
    - intermediate → 6 to 8 scenes
    - advanced    → 9 to 12 scenes
    """
    if not validate_language(language_code):
        raise HTTPException(status_code=400, detail=f"Unsupported language code: {language_code}")

    if not validate_persona(persona):
        raise HTTPException(status_code=400, detail=f"Invalid persona. Choose from: kid, secondary, university, casual")

    doc_ref = db.collection("documents").document(document_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    data = doc.to_dict()

    if data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    concept_data = None
    for c in data["key_concepts"]:
        if c["concept"].lower() == concept_name.lower():
            concept_data = c
            break

    if not concept_data:
        raise HTTPException(
            status_code=404,
            detail=f"Concept '{concept_name}' not found. Check /api/animation/concepts/{document_id} for available concepts."
        )

    scene_script = await generate_concept_animation(
        concept=concept_data["concept"],
        explanation=concept_data["explanation"],
        subtopics=concept_data.get("subtopics", []),
        why_it_matters=concept_data.get("why_it_matters", ""),
        complexity=concept_data.get("complexity", "intermediate"),
        subject=data["subject"],
        output_language_code=language_code,
        persona=persona
    )

    animation_ref = db.collection("animations").document()
    animation_ref.set({
        "user_id": user["uid"],
        "document_id": document_id,
        "type": "concept",
        "concept": concept_name,
        "complexity": concept_data.get("complexity", "intermediate"),
        "language_code": language_code,
        "persona": persona,
        "attempt": 1,
        "scene_script": scene_script,
        "created_at": datetime.datetime.utcnow().isoformat()
    })

    return {
        "animation_id": animation_ref.id,
        "type": "concept",
        "concept": concept_name,
        "complexity": concept_data.get("complexity", "intermediate"),
        "language_code": language_code,
        "persona": persona,
        "scene_script": scene_script
    }


@router.get("/concepts/{document_id}")
async def get_concepts(
    document_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Returns the full list of concepts extracted from a document.
    The frontend uses this to show the student what they can explore.
    """
    doc_ref = db.collection("documents").document(document_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    data = doc.to_dict()

    if data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return {
        "document_id": document_id,
        "title": data["title"],
        "subject": data["subject"],
        "total_concepts": len(data["key_concepts"]),
        "concepts": [
            {
                "concept": c["concept"],
                "explanation": c["explanation"],
                "complexity": c.get("complexity", "intermediate"),
                "why_it_matters": c.get("why_it_matters", "")
            }
            for c in data["key_concepts"]
        ]
    }


@router.get("/get/{document_id}")
async def get_saved_animations(
    document_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Returns all previously generated animations for a document.
    """
    results = db.collection("animations")\
        .where("document_id", "==", document_id)\
        .where("user_id", "==", user["uid"])\
        .stream()

    animations = []
    for doc in results:
        data = doc.to_dict()
        animations.append({
            "animation_id": doc.id,
            "type": data.get("type"),
            "concept": data.get("concept"),
            "complexity": data.get("complexity"),
            "language_code": data.get("language_code"),
            "persona": data.get("persona"),
            "created_at": data.get("created_at")
        })

    return {
        "document_id": document_id,
        "animations": animations
    }


class EvaluationRequest(BaseModel):
    satisfied: bool
    feedback: Optional[str] = None


@router.post("/evaluate/{animation_id}")
async def evaluate_animation(
    animation_id: str,
    body: EvaluationRequest,
    user: dict = Depends(get_current_user)
):
    """
    Student evaluates whether the animation helped them understand the concept.
    satisfied=true → recommend next concept, quiz or oral exam
    satisfied=false → regenerate or recommend AI Tutor after 3 attempts
    """
    animation_ref = db.collection("animations").document(animation_id)
    animation = animation_ref.get()

    if not animation.exists:
        raise HTTPException(status_code=404, detail="Animation not found")

    data = animation.to_dict()

    if data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if data.get("type") != "concept":
        raise HTTPException(status_code=400, detail="Only concept animations can be evaluated")

    current_attempt = data.get("attempt", 1)

    if body.satisfied:
        animation_ref.update({"understood": True})
        return {
            "understood": True,
            "concept": data.get("concept"),
            "message": f"Great work! You understood {data.get('concept')}.",
            "next_actions": [
                {"action": "next_concept", "label": "Continue to next concept"},
                {"action": "quiz", "label": "Test yourself with a Quiz"},
                {"action": "oral_exam", "label": "Take an Oral Exam"}
            ]
        }
    else:
        if current_attempt >= 3:
            animation_ref.update({"understood": False, "max_attempts_reached": True})
            return {
                "understood": False,
                "action": "tutor",
                "concept": data.get("concept"),
                "message": f"No worries — some concepts need a more personal explanation. "
                           f"The AI Tutor can work through {data.get('concept')} with you directly.",
                "next_actions": [
                    {"action": "tutor", "label": "Chat with AI Tutor"},
                    {"action": "next_concept", "label": "Skip and continue anyway"}
                ]
            }
        else:
            animation_ref.update({
                "understood": False,
                "last_feedback": body.feedback or "",
                "attempt": current_attempt
            })
            return {
                "understood": False,
                "action": "regenerate",
                "concept": data.get("concept"),
                "attempts_remaining": 3 - current_attempt,
                "message": "No problem. Let me explain this differently.",
            }


@router.post("/regenerate/{animation_id}")
async def regenerate_animation(
    animation_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Regenerates a concept animation with a simpler, more targeted explanation.
    Maximum 3 attempts before recommending AI Tutor.
    """
    animation_ref = db.collection("animations").document(animation_id)
    animation = animation_ref.get()

    if not animation.exists:
        raise HTTPException(status_code=404, detail="Animation not found")

    data = animation.to_dict()

    if data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    current_attempt = data.get("attempt", 1)

    if current_attempt >= 3:
        raise HTTPException(
            status_code=400,
            detail="Maximum regeneration attempts reached. Please use the AI Tutor."
        )

    doc_ref = db.collection("documents").document(data["document_id"])
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    doc_data = doc.to_dict()

    concept_data = None
    for c in doc_data["key_concepts"]:
        if c["concept"].lower() == data["concept"].lower():
            concept_data = c
            break

    if not concept_data:
        raise HTTPException(status_code=404, detail="Concept not found in document")

    new_attempt = current_attempt + 1
    student_feedback = data.get("last_feedback", "")
    language_code = data.get("language_code", "en")
    persona = data.get("persona", "university")

    new_scene_script = await regenerate_concept_animation(
        concept=concept_data["concept"],
        explanation=concept_data["explanation"],
        subtopics=concept_data.get("subtopics", []),
        why_it_matters=concept_data.get("why_it_matters", ""),
        complexity=concept_data.get("complexity", "intermediate"),
        subject=doc_data["subject"],
        attempt=new_attempt,
        student_feedback=student_feedback,
        output_language_code=language_code,
        persona=persona
    )

    new_animation_ref = db.collection("animations").document()
    new_animation_ref.set({
        "user_id": user["uid"],
        "document_id": data["document_id"],
        "type": "concept",
        "concept": data["concept"],
        "complexity": concept_data.get("complexity", "intermediate"),
        "language_code": language_code,
        "persona": persona,
        "attempt": new_attempt,
        "previous_animation_id": animation_id,
        "student_feedback": student_feedback,
        "scene_script": new_scene_script,
        "created_at": datetime.datetime.utcnow().isoformat()
    })

    return {
        "animation_id": new_animation_ref.id,
        "concept": data["concept"],
        "attempt": new_attempt,
        "attempts_remaining": 3 - new_attempt,
        "language_code": language_code,
        "persona": persona,
        "scene_script": new_scene_script
    }
