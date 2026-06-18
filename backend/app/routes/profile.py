from fastapi import APIRouter, Depends, HTTPException
from google.cloud import firestore
from app.core.firebase_auth import get_current_user, get_firestore_client
from app.agents.persona_agent import SUPPORTED_PERSONAS, validate_persona, get_all_personas
from pydantic import BaseModel

router = APIRouter()
db = get_firestore_client()

class PersonaRequest(BaseModel):
    persona: str

@router.post("/persona")
async def set_persona(
    body: PersonaRequest,
    user: dict = Depends(get_current_user)
):
    """
    Student sets their persona at signup.
    This determines how every agent communicates with them.
    Can be updated later in profile settings.

    Valid personas: kid, secondary, university, casual
    """
    if not validate_persona(body.persona):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid persona. Choose from: {list(SUPPORTED_PERSONAS.keys())}"
        )

    profile_ref = db.collection("profiles").document(user["uid"])
    profile_ref.set({
        "user_id": user["uid"],
        "persona": body.persona,
        "persona_name": SUPPORTED_PERSONAS[body.persona]
    }, merge=True)

    return {
        "message": f"Persona set to {SUPPORTED_PERSONAS[body.persona]}",
        "persona": body.persona,
        "persona_name": SUPPORTED_PERSONAS[body.persona]
    }


@router.get("/persona")
async def get_persona(user: dict = Depends(get_current_user)):
    """
    Returns the student's current persona.
    Frontend uses this to determine which interface to show.
    Defaults to university if not set.
    """
    profile_ref = db.collection("profiles").document(user["uid"])
    profile = profile_ref.get()

    if profile.exists:
        data = profile.to_dict()
        persona = data.get("persona", "university")
        return {
            "persona": persona,
            "persona_name": SUPPORTED_PERSONAS.get(persona, "University Student")
        }

    return {
        "persona": "university",
        "persona_name": "University Student (Ages 18-25)"
    }


@router.get("/personas")
async def list_personas(user: dict = Depends(get_current_user)):
    """
    Returns all available personas for the signup persona picker.
    """
    return {"personas": get_all_personas()}
