from google import genai
from google.genai import types
from app.core.config import settings
from app.agents.language_agent import get_language_instruction
from app.agents.persona_agent import get_persona_instruction
from app.agents.gemini_utils import generate_content_with_fallback
import json, re, base64

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def extract_content_from_pdf(file_b64: str, filename: str, output_language_code: str = "en", persona: str = "university") -> dict:
    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)

    prompt = f"""
    You are an intelligent study assistant. Analyze this PDF document thoroughly.
    {language_instruction}
    {persona_instruction}

    Return this exact JSON structure with all text adapted to the persona above:
    {{
        "title": "detected title of the document",
        "subject": "subject area e.g. Biology, History, Mathematics",
        "summary": "a clear 3-5 sentence overview of the entire document written for this persona",
        "topics": [
            {{
                "topic_name": "name of a specific key chapter, section, or topic in the document",
                "brief_description": "a 1-sentence description of what this topic covers"
            }}
        ],
        "raw_text": "the full extracted text from the document in its original language (first 5000 characters limit)"
    }}

    Rules:
    - Break the document down into 5 to 15 main topics/chapters.
    - Each topic should be specific enough to be studied individually.
    - Translate title, subject, summary and topics list into the requested language.
    - Return only valid JSON. No extra text.
    """

    response = generate_content_with_fallback(
        client=client,
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=base64.b64decode(file_b64), mime_type="application/pdf"),
            types.Part.from_text(text=prompt)
        ]
    )

    raw = response.text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)


async def extract_concepts_for_topic(file_b64: str, filename: str, topic_name: str, output_language_code: str = "en", persona: str = "university") -> list:
    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)

    prompt = f"""
    You are an intelligent study assistant. Analyze this PDF document and focus ONLY on the topic: "{topic_name}".
    {language_instruction}
    {persona_instruction}

    Extract and detail all key concepts related to "{topic_name}" from this document.
    Return this exact JSON structure containing a list of concepts:
    {{
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
        ]
    }}

    Rules:
    - Only extract concepts that directly pertain to "{topic_name}".
    - Break "{topic_name}" into detailed, self-contained key concepts.
    - complexity must reflect how difficult the concept is to understand.
    - Translate all concept details into the requested language.
    - Return only valid JSON. No extra text.
    """

    response = generate_content_with_fallback(
        client=client,
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=base64.b64decode(file_b64), mime_type="application/pdf"),
            types.Part.from_text(text=prompt)
        ]
    )

    raw = response.text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    data = json.loads(raw)
    return data.get("key_concepts", [])
