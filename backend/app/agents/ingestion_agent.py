from google import genai
from google.genai import types
from app.core.config import settings
from app.agents.language_agent import get_language_instruction
from app.agents.persona_agent import get_persona_instruction
import json, re, base64

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def extract_content_from_pdf(file_b64: str, filename: str, output_language_code: str = "en", persona: str = "university") -> dict:
    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)

    pdf_part = {
        "inline_data": {
            "mime_type": "application/pdf",
            "data": file_b64
        }
    }

    prompt = f"""
    You are an intelligent study assistant. Analyze this PDF document thoroughly.
    {language_instruction}
    {persona_instruction}

    Return this exact JSON structure with all text adapted to the persona above:
    {{
        "title": "detected title of the document",
        "subject": "subject area e.g. Biology, History, Mathematics",
        "summary": "a clear 3-5 sentence overview of the entire document written for this persona",
        "key_concepts": [
            {{
                "concept": "name of the concept",
                "explanation": "explanation written in the tone and style appropriate for this persona",
                "complexity": "basic | intermediate | advanced",
                "subtopics": [
                    "specific subtopic or detail within this concept",
                    "another subtopic"
                ],
                "why_it_matters": "one sentence on why this concept is important, written for this persona"
            }}
        ],
        "raw_text": "the full extracted text from the document in its original language"
    }}

    Rules:
    - Break the document into the smallest meaningful individual concepts
    - Do not group large chapters as one concept — split them into specific ideas
    - A 50 page textbook should yield 20-60 concepts depending on content density
    - Each concept must be self contained and explainable on its own
    - complexity must reflect how difficult the concept is to understand
    - subtopics are the specific details, mechanisms, or steps within that concept
    - Translate title, subject, summary and key_concepts into the requested language
    - Keep raw_text in the original language of the document
    - Return only valid JSON. No extra text.
    """

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=[
            types.Part.from_bytes(data=base64.b64decode(file_b64), mime_type="application/pdf"),
            types.Part.from_text(text=prompt)
        ]
    )

    raw = response.text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)
