from fastapi import APIRouter, Depends, HTTPException, Query
from google.cloud import firestore
from app.core.firebase_auth import get_current_user, get_firestore_client
from app.agents.ingestion_agent import extract_concepts_for_topic
from app.agents.language_agent import validate_language
from app.agents.persona_agent import validate_persona
from pydantic import BaseModel
from firebase_admin import storage
import base64

router = APIRouter()
db = get_firestore_client()

class ExtractConceptsPayload(BaseModel):
    document_id: str
    topic_name: str

@router.post("/extract-concepts")
async def extract_concepts(
    payload: ExtractConceptsPayload,
    language_code: str = Query(default="en"),
    persona: str = Query(default="university"),
    user: dict = Depends(get_current_user)
):
    """
    Lazily extracts key concepts for a specific topic of a document.
    Saves the concepts to the main document's key_concepts list to maintain compatibility.
    """
    if not validate_language(language_code):
        raise HTTPException(status_code=400, detail=f"Unsupported language code: {language_code}")

    if not validate_persona(persona):
        raise HTTPException(status_code=400, detail=f"Invalid persona. Choose from: kid, secondary, university, casual")

    # 1. Fetch document metadata
    doc_ref = db.collection("documents").document(payload.document_id)
    doc_snap = doc_ref.get()
    if not doc_snap.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    doc_data = doc_snap.to_dict()
    if doc_data.get("user_id") != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    storage_path = doc_data.get("storage_path")
    if not storage_path:
        raise HTTPException(status_code=400, detail="Document storage path is missing")

    # 2. Check if concepts for this topic have already been extracted
    existing_concepts = doc_data.get("key_concepts", [])
    # We can check if any concept is associated or if we should just extract new ones
    # To prevent duplicate Gemini calls, we can tag concepts with a 'topic_name' field
    # and skip if we find any concepts with matching topic_name.
    topic_concepts = [c for c in existing_concepts if c.get("extracted_for_topic", "").lower() == payload.topic_name.lower()]
    if topic_concepts:
        return {"concepts": topic_concepts}

    # 3. Download the PDF from storage
    try:
        bucket = storage.bucket()
        blob = bucket.blob(storage_path)
        file_bytes = blob.download_as_bytes()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to download file from storage: {str(e)}"
        )

    file_b64 = base64.b64encode(file_bytes).decode("utf-8")

    # 4. Generate concepts with Gemini
    concepts = await extract_concepts_for_topic(
        file_b64=file_b64,
        filename=doc_data.get("filename", "document.pdf"),
        topic_name=payload.topic_name,
        output_language_code=language_code,
        persona=persona
    )

    # Add metadata to each concept indicating which topic they were extracted for
    for c in concepts:
        c["extracted_for_topic"] = payload.topic_name

    # 5. Append to key_concepts list in Firestore
    if concepts:
        doc_ref.update({
            "key_concepts": firestore.ArrayUnion(concepts)
        })

    return {"concepts": concepts}
