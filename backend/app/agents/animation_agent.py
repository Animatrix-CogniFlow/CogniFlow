from google import genai
from app.core.config import settings
from app.agents.language_agent import get_language_instruction
from app.agents.persona_agent import get_persona_instruction
import json, re

client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def generate_intro_animation(
    title: str,
    subject: str,
    summary: str,
    key_concepts: list,
    output_language_code: str = "en",
    persona: str = "university"
) -> dict:
    """
    Generates an introductory scene script for the entire document.
    This plays before the student explores individual concepts.
    Gives a high level overview of what they are about to learn.
    """

    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)
    concept_names = [c["concept"] for c in key_concepts]

    prompt = f"""
    You are an educational animation scriptwriter.
    Create an introductory animation script that welcomes the student and
    gives them a clear overview of what they are about to learn.
    {language_instruction}
    {persona_instruction}

    Document title: "{title}"
    Subject: {subject}
    Summary: {summary}
    Concepts they will explore: {concept_names}

    Return a JSON object:
    {{
        "type": "intro",
        "title": "{title}",
        "subject": "{subject}",
        "total_scenes": 5,
        "scenes": [
            {{
                "id": 1,
                "type": "concept_intro",
                "heading": "welcome heading written for this persona",
                "subheading": "one sentence setting context written for this persona"
            }},
            {{
                "id": 2,
                "type": "bullet_reveal",
                "heading": "What You Will Learn",
                "points": ["concept 1", "concept 2", "concept 3"]
            }},
            {{
                "id": 3,
                "type": "definition",
                "term": "subject name",
                "meaning": "what this subject is about written for this persona"
            }},
            {{
                "id": 4,
                "type": "flow_diagram",
                "heading": "How These Topics Connect",
                "steps": ["first concept", "leads to", "second concept", "builds on", "third concept"]
            }},
            {{
                "id": 5,
                "type": "summary",
                "heading": "Let us Begin",
                "points": ["encouraging point written for this persona", "what they will be able to do after studying this"]
            }}
        ]
    }}

    Rules:
    - Keep it welcoming and motivating — tone must match the persona
    - Do not go deep into any concept here — that is for individual concept animations
    - Aim for 4 to 6 scenes
    - Keep all text short — this is for animations not essays
    - Return only valid JSON, no extra text
    """

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )
    raw = response.text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)


async def generate_concept_animation(
    concept: str,
    explanation: str,
    subtopics: list,
    why_it_matters: str,
    complexity: str,
    subject: str,
    output_language_code: str = "en",
    persona: str = "university"
) -> dict:
    """
    Generates a deep focused scene script for one specific concept.
    The number of scenes scales with complexity:
    - basic       → 4 to 5 scenes
    - intermediate → 6 to 8 scenes
    - advanced    → 9 to 12 scenes
    """

    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)

    if complexity == "basic":
        depth_instruction = """
        This is a basic concept. Use 4 to 5 scenes.
        Focus on clear definition, simple explanation, and one real world example.
        """
    elif complexity == "advanced":
        depth_instruction = """
        This is an advanced concept. Use 9 to 12 scenes.
        Go deep — cover the mechanism, the steps, the details, exceptions,
        real world applications, and connections to other concepts.
        Every subtopic deserves its own scene.
        """
    else:
        depth_instruction = """
        This is an intermediate concept. Use 6 to 8 scenes.
        Cover the definition, how it works, key details, and why it matters.
        Use examples to make it concrete.
        """

    prompt = f"""
    You are an educational animation scriptwriter explaining {concept} to a {subject} student.
    {language_instruction}
    {persona_instruction}
    {depth_instruction}

    Concept: {concept}
    Explanation: {explanation}
    Subtopics to cover: {subtopics}
    Why it matters: {why_it_matters}
    Complexity level: {complexity}

    Return a JSON object like this:
    {{
        "type": "concept",
        "concept": "{concept}",
        "complexity": "{complexity}",
        "total_scenes": 7,
        "scenes": [
            {{
                "id": 1,
                "type": "concept_intro",
                "heading": "concept name",
                "subheading": "a one sentence hook written for this persona"
            }},
            {{
                "id": 2,
                "type": "definition",
                "term": "concept name",
                "meaning": "clear definition written for this persona"
            }},
            {{
                "id": 3,
                "type": "bullet_reveal",
                "heading": "Key Points",
                "points": ["important point", "another point", "another point"]
            }},
            {{
                "id": 4,
                "type": "flow_diagram",
                "heading": "How It Works",
                "steps": ["step one", "step two", "step three"]
            }},
            {{
                "id": 5,
                "type": "comparison",
                "heading": "A vs B",
                "left": {{ "label": "A", "points": ["point 1", "point 2"] }},
                "right": {{ "label": "B", "points": ["point 1", "point 2"] }}
            }},
            {{
                "id": 6,
                "type": "equation",
                "heading": "The Formula",
                "elements": ["element1", "+", "element2", "=", "result"]
            }},
            {{
                "id": 7,
                "type": "timeline",
                "heading": "sequence of events",
                "events": [
                    {{ "label": "event name", "description": "short description" }}
                ]
            }},
            {{
                "id": 8,
                "type": "bullet_reveal",
                "heading": "Why This Matters",
                "points": ["real world relevance written for this persona", "connection to other concepts"]
            }},
            {{
                "id": 9,
                "type": "summary",
                "heading": "Key Takeaways",
                "points": ["takeaway one", "takeaway two", "takeaway three"]
            }}
        ]
    }}

    Rules:
    - Only use scene types that actually fit the content. Do not force a type.
    - Always start with concept_intro and end with summary
    - Scale depth to complexity level as instructed above
    - Every scene must add new information — no repetition
    - All text must be written in the tone appropriate for the persona
    - Keep all text short and clear — this is for animations not essays
    - Return only valid JSON, no extra text
    """

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )
    raw = response.text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)


async def regenerate_concept_animation(
    concept: str,
    explanation: str,
    subtopics: list,
    why_it_matters: str,
    complexity: str,
    subject: str,
    attempt: int,
    student_feedback: str,
    output_language_code: str = "en",
    persona: str = "university"
) -> dict:
    """
    Regenerates a concept animation when the student did not understand.
    Each attempt gets progressively simpler and more targeted.

    attempt 2 — simpler language, more analogies, real world examples
    attempt 3 — absolute basics, step by step, assume zero prior knowledge
    """

    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)

    if attempt == 2:
        approach_instruction = """
        The student did not understand the previous explanation.
        This time:
        - Use much simpler language — even simpler than the persona normally requires
        - Use real world analogies and everyday examples to make abstract ideas concrete
        - Avoid technical jargon — if you must use it, immediately explain it in plain terms
        - Add more scenes to slow down and give each idea more room to breathe
        """
    else:
        approach_instruction = """
        The student still does not understand after two attempts.
        This is the final attempt before recommending the AI Tutor.
        - Start from absolute zero — assume the student knows nothing about this topic
        - Break every single idea into the smallest possible steps
        - Use simple analogies for everything
        - Be warm and encouraging throughout
        - This explanation must be the clearest and most detailed version possible
        """

    feedback_instruction = ""
    if student_feedback and student_feedback.strip():
        feedback_instruction = f"""
        The student specifically said they did not understand: "{student_feedback}"
        Make sure this explanation directly addresses that confusion.
        Target that specific gap clearly and early in the animation.
        """

    prompt = f"""
    You are an educational animation scriptwriter explaining {concept} to a {subject} student.
    {language_instruction}
    {persona_instruction}
    {approach_instruction}
    {feedback_instruction}

    Concept: {concept}
    Explanation: {explanation}
    Subtopics to cover: {subtopics}
    Why it matters: {why_it_matters}
    This is attempt {attempt} of explaining this concept.

    Return a JSON object in the same scene script format:
    {{
        "type": "concept",
        "concept": "{concept}",
        "complexity": "{complexity}",
        "attempt": {attempt},
        "total_scenes": 8,
        "scenes": [
            {{
                "id": 1,
                "type": "concept_intro",
                "heading": "concept name",
                "subheading": "a warm reassuring hook written for this persona"
            }},
            {{
                "id": 2,
                "type": "definition",
                "term": "concept name",
                "meaning": "the simplest possible definition written for this persona"
            }},
            {{
                "id": 3,
                "type": "bullet_reveal",
                "heading": "Think of it this way",
                "points": ["simple analogy point", "another relatable comparison"]
            }},
            {{
                "id": 4,
                "type": "flow_diagram",
                "heading": "Step by Step",
                "steps": ["step one in plain language", "step two", "step three"]
            }},
            {{
                "id": 5,
                "type": "comparison",
                "heading": "A vs B",
                "left": {{ "label": "A", "points": ["point 1", "point 2"] }},
                "right": {{ "label": "B", "points": ["point 1", "point 2"] }}
            }},
            {{
                "id": 6,
                "type": "equation",
                "heading": "The Formula",
                "elements": ["element1", "+", "element2", "=", "result"]
            }},
            {{
                "id": 7,
                "type": "bullet_reveal",
                "heading": "Real World Example",
                "points": ["where you see this in everyday life", "why it matters to you personally"]
            }},
            {{
                "id": 8,
                "type": "summary",
                "heading": "Let us recap",
                "points": ["the one thing to remember", "how this connects to what comes next"]
            }}
        ]
    }}

    Rules:
    - Only use scene types that actually fit the content
    - Always start with concept_intro and end with summary
    - Every scene must add clarity not complexity
    - Never use jargon without immediately explaining it
    - All text must match the persona tone
    - Return only valid JSON, no extra text
    """

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )
    raw = response.text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)
