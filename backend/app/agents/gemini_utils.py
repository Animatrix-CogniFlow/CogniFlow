import logging
from google.genai.errors import APIError
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Groq client
groq_client = Groq(api_key=settings.GROQ_API_KEY)

class MockGeminiResponse:
    """Mock Gemini response object to match SDK interface."""
    def __init__(self, text):
        self.text = text

class MockGeminiChunk:
    """Mock Gemini stream chunk to match SDK interface."""
    def __init__(self, text):
        self.text = text

def extract_text_from_contents(contents) -> str:
    """Extracts raw text string from Gemini contents structure."""
    if isinstance(contents, str):
        return contents
    if isinstance(contents, list):
        text_parts = []
        for part in contents:
            if isinstance(part, str):
                text_parts.append(part)
            elif hasattr(part, "text") and part.text:
                text_parts.append(part.text)
            elif isinstance(part, dict) and "text" in part:
                text_parts.append(part["text"])
        return "\n".join(text_parts)
    return str(contents)

def contains_multimodal_parts(contents) -> bool:
    """Checks if contents contain PDF or non-text parts which Groq cannot process."""
    if isinstance(contents, list):
        for part in contents:
            if not isinstance(part, str):
                if hasattr(part, "mime_type") and part.mime_type and "pdf" in part.mime_type.lower():
                    return True
                if hasattr(part, "inline_data") or hasattr(part, "function_call"):
                    return True
    return False

def call_groq_completions(contents) -> str:
    """Helper to route standard text completions to Groq (Llama 3.3)."""
    prompt_text = extract_text_from_contents(contents)
    response_format = None
    if "json" in prompt_text.lower():
        response_format = {"type": "json_object"}
        if "json" not in prompt_text.lower():
            prompt_text += "\nReturn only valid JSON."

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt_text}],
        response_format=response_format,
        temperature=0.2,
    )
    return response.choices[0].message.content

def call_groq_stream(contents):
    """Helper to route streaming completions to Groq (Llama 3.3)."""
    prompt_text = extract_text_from_contents(contents)
    response_stream = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt_text}],
        stream=True,
    )
    for chunk in response_stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield MockGeminiChunk(chunk.choices[0].delta.content)

def generate_content_with_fallback(client, model: str, contents, config=None):
    """
    Generate content using a pipeline of models.
    Primary: gemini-2.5-flash -> gemini-2.0-flash.
    Final Fallback (for text-only queries): Groq (llama-3.3-70b-versatile).
    """
    models = [model, "gemini-2.0-flash"]
    seen = set()
    model_pipeline = [m for m in models if not (m in seen or seen.add(m))]

    for idx, current_model in enumerate(model_pipeline):
        try:
            return client.models.generate_content(
                model=current_model,
                contents=contents,
                config=config
            )
        except APIError as e:
            is_429 = e.code == 429 or "RESOURCE_EXHAUSTED" in str(e) or "quota" in str(e).lower()
            if not is_429:
                raise e
            
            # If we have another Gemini model, proceed to try it
            if idx < len(model_pipeline) - 1:
                logger.warning(f"Model {current_model} exhausted (429). Falling back to {model_pipeline[idx + 1]}.")
                continue
            
            # If all Gemini models are exhausted, fall back to Groq if the request is text-only
            if not contains_multimodal_parts(contents):
                logger.warning("All Gemini models exhausted. Falling back to Groq (llama-3.3-70b-versatile).")
                try:
                    text_response = call_groq_completions(contents)
                    return MockGeminiResponse(text_response)
                except Exception as groq_err:
                    logger.error(f"Groq fallback failed: {groq_err}")
            
            raise e

def generate_content_stream_with_fallback(client, model: str, contents, config=None):
    """
    Generate content stream using a pipeline of models.
    Primary: gemini-2.5-flash -> gemini-2.0-flash.
    Final Fallback (for text-only queries): Groq (llama-3.3-70b-versatile).
    """
    models = [model, "gemini-2.0-flash"]
    seen = set()
    model_pipeline = [m for m in models if not (m in seen or seen.add(m))]

    def run_stream_with_fallback(pipeline_index: int):
        current_model = model_pipeline[pipeline_index]
        try:
            stream = client.models.generate_content_stream(
                model=current_model,
                contents=contents,
                config=config
            )
            for chunk in stream:
                yield chunk
        except APIError as e:
            is_429 = e.code == 429 or "RESOURCE_EXHAUSTED" in str(e) or "quota" in str(e).lower()
            if not is_429:
                raise e
            
            if pipeline_index < len(model_pipeline) - 1:
                logger.warning(
                    f"Stream of model {current_model} failed (429). "
                    f"Falling back to {model_pipeline[pipeline_index + 1]}."
                )
                yield from run_stream_with_fallback(pipeline_index + 1)
                return
            
            if not contains_multimodal_parts(contents):
                logger.warning("All Gemini stream models exhausted. Falling back to Groq stream (llama-3.3-70b-versatile).")
                try:
                    yield from call_groq_stream(contents)
                    return
                except Exception as groq_err:
                    logger.error(f"Groq stream fallback failed: {groq_err}")
            
            raise e

    return run_stream_with_fallback(0)
