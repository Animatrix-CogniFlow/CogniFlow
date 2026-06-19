from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ingest, flashcards, quiz, animation, tutor, oral_exam, search, profile, topics
from app.agents.language_agent import get_all_languages
from app.agents.persona_agent import get_all_personas

app = FastAPI(title="CogniFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cogni-flow-5ihe.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router,     prefix="/api/ingest",     tags=["Ingest"])
app.include_router(topics.router,     prefix="/api/ingest/topics", tags=["Topics"])
app.include_router(flashcards.router, prefix="/api/flashcards", tags=["Flashcards"])
app.include_router(quiz.router,       prefix="/api/quiz",       tags=["Quiz"])
app.include_router(animation.router,  prefix="/api/animation",  tags=["Animation"])
app.include_router(tutor.router,      prefix="/api/tutor",      tags=["Tutor"])
app.include_router(oral_exam.router,  prefix="/api/oral-exam",  tags=["Oral Exam"])
app.include_router(search.router,     prefix="/api/search",     tags=["Search"])
app.include_router(profile.router,    prefix="/api/profile",    tags=["Profile"])

@app.get("/")
def root():
    return {"message": "CogniFlow API is running"}

@app.get("/api/languages")
def list_languages():
    """Returns all supported languages for the frontend language picker."""
    return {"languages": get_all_languages()}

@app.get("/api/personas")
def list_personas():
    """Returns all supported personas for the frontend signup picker."""
    return {"personas": get_all_personas()}
