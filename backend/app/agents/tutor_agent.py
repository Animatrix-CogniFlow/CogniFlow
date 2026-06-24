from groq import Groq
from google import genai
from app.core.config import settings
from app.agents.language_agent import get_language_instruction, should_use_gemini
from app.agents.persona_agent import get_persona_instruction

groq_client = Groq(api_key=settings.GROQ_API_KEY)
gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def chat_with_tutor(
    user_message: str,
    conversation_history: list,
    subject: str,
    document_summary: str,
    search_web: bool = False,
    output_language_code: str = "en",
    persona: str = "university"
) -> str:

    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)
    use_gemini = should_use_gemini(output_language_code)

    scope_instruction = f"""
    The student has enabled extended learning mode.
    Go beyond the uploaded notes to give richer explanations, real world examples and deeper context.
    Always tie your answer back to what the student is studying.
    """ if search_web else f"""
    Stay strictly focused on the uploaded study material summarised below.
    If the student asks something outside the material, let them know and suggest enabling extended learning mode.
    """

    system_prompt = f"""
    You are CogniFlow, an AI tutor helping a student study {subject}.

    The student is currently studying:
    {document_summary}

    {scope_instruction}
    {language_instruction}
    {persona_instruction}

    Your role:
    - Answer questions clearly in a way that fits this persona
    - Break things down if the student is confused
    - Encourage the student appropriately for their persona
    - Be concise and conversational
    - Use examples appropriate for this persona
    """

    if use_gemini:
        history_text = ""
        for msg in conversation_history:
            role = "Student" if msg["role"] == "user" else "Tutor"
            history_text += f"{role}: {msg['content']}\n"
        history_text += f"Student: {user_message}\nTutor:"
        full_prompt = f"{system_prompt}\n\nConversation:\n{history_text}"
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt
        )
        return response.text.strip()
    else:
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history)
        messages.append({"role": "user", "content": user_message})
        response = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content
