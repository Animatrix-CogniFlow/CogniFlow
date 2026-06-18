from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.firebase_auth import get_current_user, get_firestore_client
from app.agents.search_agent import search_concepts

router = APIRouter()
db = get_firestore_client()


@router.get("/concepts/{document_id}")
async def search_document_concepts(
    document_id: str,
    q: str = Query(..., description="Search query — what the student is looking for"),
    top_k: int = Query(default=5, ge=1, le=20, description="Number of results to return"),
    user: dict = Depends(get_current_user)
):
    """
    Semantic search through a document's concepts.
    Student types a question or topic and gets back the most relevant concepts.

    For example:
    - "how does energy move through cells" → returns concepts about ATP, mitochondria etc
    - "what caused the war" → returns concepts about the relevant historical events
    - "explain gravity" → returns concepts related to gravity and forces

    This is smarter than keyword search — it understands meaning not just exact words.
    """
    doc_ref = db.collection("documents").document(document_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    data = doc.to_dict()

    if data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    concepts = data.get("key_concepts", [])

    if not concepts:
        raise HTTPException(status_code=404, detail="No concepts found in this document")

    results = search_concepts(
        query=q,
        concepts=concepts,
        top_k=top_k
    )

    return {
        "document_id": document_id,
        "query": q,
        "total_results": len(results),
        "results": results
    }


@router.get("/documents")
async def search_all_documents(
    q: str = Query(..., description="Search query"),
    top_k: int = Query(default=5, ge=1, le=20),
    user: dict = Depends(get_current_user)
):
    """
    Searches across ALL documents the student has uploaded.
    Useful when a student wants to find which document covers a specific topic
    without knowing which file it is in.
    """
    # Fetch all documents for this user
    docs = db.collection("documents")\
        .where("user_id", "==", user["uid"])\
        .stream()

    all_results = []

    for doc in docs:
        data = doc.to_dict()
        concepts = data.get("key_concepts", [])

        if not concepts:
            continue

        results = search_concepts(query=q, concepts=concepts, top_k=3)

        if results:
            all_results.append({
                "document_id": doc.id,
                "document_title": data.get("title"),
                "subject": data.get("subject"),
                "top_match": results[0],
                "other_matches": results[1:] if len(results) > 1 else []
            })

    # Sort documents by their best matching concept score
    all_results.sort(
        key=lambda x: x["top_match"]["relevance_score"],
        reverse=True
    )

    return {
        "query": q,
        "total_documents_searched": len(all_results),
        "results": all_results[:top_k]
    }