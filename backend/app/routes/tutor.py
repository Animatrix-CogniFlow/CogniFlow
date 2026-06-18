from fastapi import APIRouter, Depends, HTTPException
from app.core.firebase_auth import get_current_user, get_firestore_client
from app.agents.tutor_agent import chat_with_tutor
from app.agents.language_agent import validate_language
from app.agents.persona_agent import validate_persona
from pydantic import BaseModel
import datetime

router = APIRouter()
db = get_firestore_client()

class ChatRequest(BaseModel):
    document_id: str
    message: str
    session_id: str | None = None
    search_web: bool = False
    language_code: str = "en"
    persona: str = "university"

@router.post("/chat")
async def tutor_chat(
    body: ChatRequest,
    user: dict = Depends(get_current_user)
):
    """
    Student sends a message to the AI tutor.
    persona adjusts how the tutor communicates — tone, vocabulary, depth.
    """
    if not validate_language(body.language_code):
        raise HTTPException(status_code=400, detail=f"Unsupported language code: {body.language_code}")

    if not validate_persona(body.persona):
        raise HTTPException(status_code=400, detail=f"Invalid persona. Choose from: kid, secondary, university, casual")

    doc_ref = db.collection("documents").document(body.document_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")
    doc_data = doc.to_dict()
    if doc_data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if body.session_id:
        session_ref = db.collection("tutor_sessions").document(body.session_id)
        session = session_ref.get()
        if not session.exists:
            raise HTTPException(status_code=404, detail="Session not found")
        conversation_history = session.to_dict().get("history", [])
    else:
        session_ref = db.collection("tutor_sessions").document()
        conversation_history = []
        session_ref.set({
            "user_id": user["uid"],
            "document_id": body.document_id,
            "title": doc_data["title"],
            "subject": doc_data["subject"],
            "language_code": body.language_code,
            "persona": body.persona,
            "history": [],
            "created_at": datetime.datetime.utcnow().isoformat()
        })

    reply = await chat_with_tutor(
        user_message=body.message,
        conversation_history=conversation_history,
        subject=doc_data["subject"],
        document_summary=doc_data["summary"],
        search_web=body.search_web,
        output_language_code=body.language_code,
        persona=body.persona
    )

    conversation_history.append({"role": "user", "content": body.message})
    conversation_history.append({"role": "assistant", "content": reply})

    session_ref.update({
        "history": conversation_history,
        "last_updated": datetime.datetime.utcnow().isoformat()
    })

    return {
        "session_id": session_ref.id,
        "reply": reply,
        "mode": "extended" if body.search_web else "focused",
        "language_code": body.language_code,
        "persona": body.persona,
        "history": conversation_history
    }


@router.get("/sessions/{document_id}")
async def get_sessions(document_id: str, user: dict = Depends(get_current_user)):
    sessions = db.collection("tutor_sessions")\
        .where("document_id", "==", document_id)\
        .where("user_id", "==", user["uid"])\
        .stream()

    result = []
    for s in sessions:
        data = s.to_dict()
        result.append({
            "session_id": s.id,
            "title": data["title"],
            "subject": data["subject"],
            "message_count": len(data.get("history", [])),
            "created_at": data["created_at"],
            "last_updated": data.get("last_updated")
        })
    return {"sessions": result}


@router.delete("/session/{session_id}")
async def delete_session(session_id: str, user: dict = Depends(get_current_user)):
    session_ref = db.collection("tutor_sessions").document(session_id)
    session = session_ref.get()
    if not session.exists:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.to_dict()["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    session_ref.delete()
    return {"message": "Session deleted successfully"}
