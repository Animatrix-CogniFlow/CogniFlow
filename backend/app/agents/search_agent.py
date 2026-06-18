import requests
import numpy as np
from app.core.config import settings

# HuggingFace Inference API — runs the model on their servers, not ours
# This uses almost zero memory on our end
EMBEDDING_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"

def embed_texts(texts: list) -> list:
    """
    Sends texts to HuggingFace Inference API and gets back embeddings.
    The model runs on HuggingFace servers — no memory cost on our server.
    """
    headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
    response = requests.post(
        EMBEDDING_API_URL,
        headers=headers,
        json={"inputs": texts, "options": {"wait_for_model": True}}
    )
    response.raise_for_status()
    return response.json()


def embed_text(text: str) -> list:
    """Embeds a single text."""
    return embed_texts([text])[0]


def cosine_similarity(vec_a: list, vec_b: list) -> float:
    """
    Measures how similar two embeddings are.
    Returns a score between 0 and 1 — the closer to 1 the more similar.
    """
    a = np.array(vec_a)
    b = np.array(vec_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def search_concepts(query: str, concepts: list, top_k: int = 5) -> list:
    """
    Searches through a document's concepts using semantic similarity.
    Returns the top_k most relevant concepts to the student's query.
    """
    if not concepts:
        return []

    # Embed query and all concepts in one API call
    concept_texts = [
        f"{c['concept']}. {c['explanation']}" for c in concepts
    ]
    all_texts = [query] + concept_texts
    all_embeddings = embed_texts(all_texts)

    query_embedding = all_embeddings[0]
    concept_embeddings = all_embeddings[1:]

    # Score each concept against the query
    scored = []
    for i, concept in enumerate(concepts):
        score = cosine_similarity(query_embedding, concept_embeddings[i])
        scored.append({
            "concept": concept["concept"],
            "explanation": concept["explanation"],
            "complexity": concept.get("complexity", "intermediate"),
            "why_it_matters": concept.get("why_it_matters", ""),
            "relevance_score": round(score, 4)
        })

    scored.sort(key=lambda x: x["relevance_score"], reverse=True)
    return scored[:top_k]