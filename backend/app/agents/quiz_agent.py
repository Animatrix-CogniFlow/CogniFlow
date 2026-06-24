from google import genai
from app.core.config import settings
from app.agents.language_agent import get_language_instruction
from app.agents.persona_agent import get_persona_instruction
import json, re, random

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_quiz(raw_text: str, subject: str, count: int = 10, difficulty: str = "medium", output_language_code: str = "en", persona: str = "university") -> list:
    """
    Generates multiple choice questions from extracted document text.

    Difficulty levels:
    - easy: straightforward recall questions
    - medium: questions that require some understanding
    - hard: questions that require deeper thinking and application

    Count: how many questions (max 20)
    """

    count = min(count, 20)
    variation_seed = random.randint(1, 10000)
    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)

    if difficulty == "easy":
        difficulty_instruction = "Simple recall questions. Answers are clearly stated in the text."
    elif difficulty == "hard":
        difficulty_instruction = "Deep thinking questions. Student must understand and apply concepts, not just recall."
    else:
        difficulty_instruction = "A mix of recall and understanding. Some answers require thinking beyond the text."

    prompt = f"""
    You are an examiner creating a multiple choice quiz on {subject}.
    Generate exactly {count} questions at {difficulty} difficulty.
    {language_instruction}
    {persona_instruction}

    Difficulty guide: {difficulty_instruction}

    Important: This is attempt variation #{variation_seed}.
    You MUST generate a completely fresh set of questions different from any previous attempt.
    Focus on different angles, concepts, and wordings each time.
    Do not repeat questions that could have been asked before.

    Return a JSON array like this:
    [
        {{
            "question": "the question text written for this persona",
            "options": {{
                "A": "first option",
                "B": "second option",
                "C": "third option",
                "D": "fourth option"
            }},
            "correct_answer": "A",
            "explanation": "brief explanation written for this persona"
        }}
    ]

    Rules:
    - Every question must have exactly 4 options (A, B, C, D)
    - Only one option should be correct
    - Wrong options should be plausible, not obviously wrong
    - Include a short explanation for the correct answer
    - Write questions and explanations in the tone appropriate for the persona
    - Return only valid JSON, no extra text

    Notes:
    {raw_text}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    raw = response.text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)


def evaluate_quiz(questions: list, student_answers: dict) -> dict:
    """
    Evaluates student answers against correct answers.
    student_answers format: { "0": "A", "1": "C", ... } (index: chosen option)
    Returns score, breakdown, and feedback.
    """
    total = len(questions)
    correct = 0
    breakdown = []

    for i, question in enumerate(questions):
        student_answer = student_answers.get(str(i), None)
        is_correct = student_answer == question["correct_answer"]
        if is_correct:
            correct += 1

        breakdown.append({
            "question": question["question"],
            "your_answer": student_answer,
            "correct_answer": question["correct_answer"],
            "is_correct": is_correct,
            "explanation": question["explanation"]
        })

    score_percent = round((correct / total) * 100)

    if score_percent >= 80:
        feedback = "Excellent work! You have a strong understanding of this material."
    elif score_percent >= 60:
        feedback = "Good effort. Review the questions you missed and try again."
    else:
        feedback = "Keep studying. Focus on the explanations for the questions you missed."

    return {
        "score": correct,
        "total": total,
        "percentage": score_percent,
        "feedback": feedback,
        "breakdown": breakdown
    }
