import openai
from google import genai
from google.genai import types
from app.core.config import settings
from app.agents.language_agent import get_language_instruction, should_use_gemini
from app.agents.persona_agent import get_persona_instruction
from app.agents.gemini_utils import generate_content_with_fallback
import json, re, random, base64

openai.api_key = settings.OPENAI_API_KEY
gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def transcribe_audio(audio_bytes: bytes, filename: str, language_code: str = "en") -> str:
    """
    Transcribes student audio to text.
    - Weak African languages → Gemini
    - All other languages → OpenAI Whisper
    """
    if should_use_gemini(language_code):
        response = generate_content_with_fallback(
            client=gemini_client,
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=audio_bytes, mime_type="audio/webm"),
                types.Part.from_text(text="Transcribe this audio exactly as spoken. Return only the transcribed text, nothing else.")
            ]
        )
        return response.text.strip()
    else:
        transcript = openai.audio.transcriptions.create(
            model="whisper-1",
            file=(filename, audio_bytes, "audio/webm"),
        )
        return transcript.text


async def generate_oral_questions(raw_text: str, subject: str, count: int = 5, output_language_code: str = "en", persona: str = "university") -> list:
    """
    Generates open ended oral exam questions from the document.
    Variation seed ensures questions are different on every attempt.
    """
    count = min(count, 10)
    variation_seed = random.randint(1, 10000)
    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)

    prompt = f"""
    You are an examiner conducting an oral exam on {subject}.
    Generate exactly {count} open ended questions based on the notes below.
    These questions will be asked verbally so they must be clear and conversational.
    {language_instruction}
    {persona_instruction}

    Important: This is attempt variation #{variation_seed}.
    You MUST generate completely fresh questions different from any previous attempt.
    Approach the content from different angles, test different concepts each time.

    Return a JSON array like this:
    [
        {{
            "id": 1,
            "question": "the question text written for this persona",
            "key_points": ["point the answer should cover", "another key point"]
        }}
    ]

    Rules:
    - Questions should require more than a one word answer
    - Each question should test understanding not just memory
    - Write questions in the tone and style appropriate for the persona
    - key_points are what a good answer should mention
    - Return only valid JSON, no extra text

    Notes:
    {raw_text}
    """

    response = generate_content_with_fallback(
        client=gemini_client,
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = response.text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)


async def evaluate_oral_answer(
    question: str,
    key_points: list,
    student_answer: str,
    subject: str,
    output_language_code: str = "en",
    persona: str = "university"
) -> dict:
    """
    Gemini evaluates the student's transcribed spoken answer.
    Evaluation is content-based — works regardless of what language the student answered in.
    """
    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)

    prompt = f"""
    You are an examiner evaluating a student's oral answer in {subject}.
    {language_instruction}
    {persona_instruction}

    Note: The student may have answered in a different language than the question.
    Evaluate purely based on whether the content of their answer covers the key points.
    Language of the answer does not affect the score.

    Question asked: {question}
    Key points a good answer should cover: {key_points}
    Student's answer: {student_answer}

    Evaluate the answer and return a JSON object:
    {{
        "score": a number from 0 to 10,
        "is_correct": true if the score is 7 or above and the student demonstrated sufficient understanding of the core concepts, false otherwise,
        "understanding": "poor | fair | good | excellent",
        "feedback": "feedback written in the tone appropriate for this persona",
        "clue": "if not correct, a constructive, supportive hint/clue that guides the student's thinking towards the right answer without giving it away. If correct, this can be empty.",
        "correct_answer": "a concise, complete model answer in the target language that covers all the key points perfectly",
        "covered": ["key points the student mentioned"],
        "missed": ["key points the student did not mention"]
    }}

    Be encouraging but honest. Write feedback that fits the persona. Return only valid JSON, no extra text.
    """

    response = generate_content_with_fallback(
        client=gemini_client,
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = response.text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)
