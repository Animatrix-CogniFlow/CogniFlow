from groq import Groq
from google import genai
from app.core.config import settings
from app.agents.language_agent import get_language_instruction, should_use_gemini
from app.agents.persona_agent import get_persona_instruction
from app.agents.gemini_utils import generate_content_with_fallback, generate_content_stream_with_fallback

groq_client = Groq(api_key=settings.GROQ_API_KEY)
gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def chat_with_tutor(
    user_message: str,
    conversation_history: list,
    subject: str,
    document_summary: str,
    search_web: bool = False,
    output_language_code: str = "en",
    persona: str = "university",
    page_content: str | None = None
) -> str:

    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)
    use_gemini = should_use_gemini(output_language_code) or search_web

    scope_instruction = f"""
    The student has enabled extended learning mode (Web Research is ON).
    Use the Google Search tool to research and find accurate, up-to-date information, real-world examples, or context related to their query.
    Always tie your findings back to what the student is studying in the uploaded material and current page context.
    """ if search_web else f"""
    Stay strictly focused on the uploaded study material and current page context.
    If the student asks something outside these materials, let them know and suggest enabling Web Research mode.
    """

    page_context = ""
    if page_content:
        page_context = f"""

The student is currently looking at this active page content on their screen:
---
{page_content}
---"""

    system_prompt = f"""
    You are CogniFlow, an AI tutor helping a student study {subject}.

    The student is currently studying this uploaded material:
    {document_summary}
    {page_context}

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

        config = None
        if search_web:
            from google.genai import types
            config = types.GenerateContentConfig(
                tools=[{"google_search": {}}]
            )

        response = generate_content_with_fallback(
            client=gemini_client,
            model="gemini-2.5-flash",
            contents=full_prompt,
            config=config
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


async def chat_with_tutor_stream(
    user_message: str,
    conversation_history: list,
    subject: str,
    document_summary: str,
    search_web: bool = False,
    output_language_code: str = "en",
    persona: str = "university",
    page_content: str | None = None
):
    language_instruction = get_language_instruction(output_language_code)
    persona_instruction = get_persona_instruction(persona)
    use_gemini = should_use_gemini(output_language_code) or search_web

    scope_instruction = f"""
    The student has enabled extended learning mode (Web Research is ON).
    Use the Google Search tool to research and find accurate, up-to-date information, real-world examples, or context related to their query.
    Always tie your findings back to what the student is studying in the uploaded material and current page context.
    """ if search_web else f"""
    Stay strictly focused on the uploaded study material and current page context.
    If the student asks something outside these materials, let them know and suggest enabling Web Research mode.
    """

    page_context = ""
    if page_content:
        page_context = f"""

The student is currently looking at this active page content on their screen:
---
{page_content}
---"""

    system_prompt = f"""
    You are CogniFlow, an AI tutor helping a student study {subject}.

    The student is currently studying this uploaded material:
    {document_summary}
    {page_context}

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

        config = None
        if search_web:
            from google.genai import types
            config = types.GenerateContentConfig(
                tools=[{"google_search": {}}]
            )

        response_stream = generate_content_stream_with_fallback(
            client=gemini_client,
            model="gemini-2.5-flash",
            contents=full_prompt,
            config=config
        )
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text
    else:
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history)
        messages.append({"role": "user", "content": user_message})

        response_stream = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=messages,
            max_tokens=500,
            temperature=0.7,
            stream=True
        )
        for chunk in response_stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
