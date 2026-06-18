from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from pathlib import Path
import os

# Explicitly load .env from the project root before anything else
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    GROQ_API_KEY: str
    OPENAI_API_KEY: str
    HUGGINGFACE_API_KEY: str
    HF_TOKEN: str
    FIREBASE_PROJECT_ID: str
    FIREBASE_PRIVATE_KEY: str
    FIREBASE_CLIENT_EMAIL: str

settings = Settings()