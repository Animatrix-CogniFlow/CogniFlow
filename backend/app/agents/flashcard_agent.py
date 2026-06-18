from google import genai
from app.core.config import settings
from app.agents.language_agent import get_language_instruction
from app.agents.persona_agent import get_persona_instruction
import json, re

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_flashcards(raw_text: str, subject: str, count: int = 10, mode: str = "quick_recall", output_language_code: str = "en", persona: str = "university") -> list:
    """
    Generates flashcards from extracted document text.

    Modes:
    - quick_recall: short question + 1-2 sentence answer (facts, definitions, dates)
    - concept_check: bigger question + short paragraph answer (processes, theories)

    Count: how many flashcards to generate (max 20)
    """

    count = min(count, 20)
    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)

    if mode == "quick_recall":
        style_instruction = """
        - Front: a short question or key term (max 10 words)
        - Back: a 1-2 sentence answer, straight to the point
        - Focus on facts, definitions, dates, formulas, and key terms
        """
    else:
        style_instruction = """
        - Front: a deeper question about a concept, process, or theory (max 15 words)
        - Back: a short paragraph (3-4 sentences) that clearly explains the concept
        - Focus on how things work, why things happen, and what things mean
        """

    prompt = f"""
    You are a study assistant helping a student learn {subject}.
    Based on the following notes, generate exactly {count} flashcards in "{mode}" mode.
    {language_instruction}
    {persona_instruction}

    Flashcard style for this mode:
    {style_instruction}

    Return a JSON array like this:
    [
        {{
            "front": "question or key term written for this persona",
            "back": "answer or explanation written for this persona",
            "mode": "{mode}"
        }}
    ]

    Rules:
    - Cover the most important concepts in the text
    - Every card must be self contained and make sense on its own
    - Write every card in the tone and style appropriate for the persona
    - Return only valid JSON, no extra text

    Notes:
    {raw_text}
    """

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )

    raw = response.text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)
