from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.firebase_auth import get_current_user, get_firestore_client
from app.agents.ingestion_agent import extract_content_from_pdf
from app.agents.language_agent import validate_language
from app.agents.persona_agent import validate_persona
from pydantic import BaseModel
from firebase_admin import storage
import base64, datetime

router = APIRouter()
db = get_firestore_client()

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50MB

class DocumentUploadPayload(BaseModel):
    storage_path: str
    filename: str

@router.post("/upload")
async def upload_document(
    payload: DocumentUploadPayload,
    language_code: str = Query(default="en", description="Language for output content"),
    persona: str = Query(default="university", description="User persona: kid, secondary, university, casual"),
    user: dict = Depends(get_current_user)
):
    """
    Ingest a PDF notes or textbook uploaded directly to Firebase Storage.
    - Max file size: 50MB
    """
    if not validate_language(language_code):
        raise HTTPException(status_code=400, detail=f"Unsupported language code: {language_code}")

    if not validate_persona(persona):
        raise HTTPException(status_code=400, detail=f"Invalid persona. Choose from: kid, secondary, university, casual")

    try:
        bucket = storage.bucket()
        blob = bucket.blob(payload.storage_path)
        file_bytes = blob.download_as_bytes()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to download file from storage path '{payload.storage_path}': {str(e)}"
        )

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File is too large. Maximum allowed size is 50MB. "
                   f"Your file is {round(len(file_bytes) / (1024 * 1024), 1)}MB."
        )

    file_b64 = base64.b64encode(file_bytes).decode("utf-8")

    extracted = await extract_content_from_pdf(file_b64, payload.filename, language_code, persona)

    doc_ref = db.collection("documents").document()
    doc_ref.set({
        "user_id": user["uid"],
        "filename": payload.filename,
        "storage_path": payload.storage_path,
        "title": extracted.get("title", payload.filename),
        "subject": extracted.get("subject", ""),
        "summary": extracted.get("summary", ""),
        "key_concepts": extracted.get("key_concepts", []),
        "raw_text": extracted.get("raw_text", ""),
        "file_size_mb": round(len(file_bytes) / (1024 * 1024), 1),
        "created_at": datetime.datetime.utcnow().isoformat()
    })

    return {
        "document_id": doc_ref.id,
        "title": extracted.get("title"),
        "subject": extracted.get("subject"),
        "summary": extracted.get("summary"),
        "total_concepts": len(extracted.get("key_concepts", [])),
        "key_concepts": extracted.get("key_concepts"),
        "language_code": language_code,
        "persona": persona,
        "file_size_mb": round(len(file_bytes) / (1024 * 1024), 1),
        "message": "Document processed successfully"
    }
