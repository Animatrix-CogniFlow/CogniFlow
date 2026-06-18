# All supported languages
SUPPORTED_LANGUAGES = {
    # Global
    "en":   "English",
    "fr":   "French",
    "pt":   "Portuguese",
    "es":   "Spanish",
    "ar":   "Arabic",
    "zh":   "Chinese (Mandarin)",
    "ja":   "Japanese",
    "ko":   "Korean",
    "hi":   "Hindi",

    # African languages
    "sw":   "Swahili",
    "ha":   "Hausa",
    "yo":   "Yoruba",
    "ig":   "Igbo",
    "am":   "Amharic",
    "tw":   "Twi",
    "pcm":  "Nigerian Pidgin",

    # Fun / engagement
    "genZ": "Gen Z English",
}

# African + non-Latin languages — route through Gemini instead of Groq for better quality
GEMINI_ONLY_LANGUAGES = {
    "sw", "ha", "yo", "ig", "am", "tw", "pcm", "ar", "zh", "ja", "ko", "hi"
}


def get_language_instruction(output_language_code: str) -> str:
    """
    Returns a prompt instruction that tells the model:
    1. To ignore whatever language the source notes are written in
    2. To respond entirely in the student's chosen language
    """
    language_name = SUPPORTED_LANGUAGES.get(output_language_code, "English")

    if output_language_code == "en":
        return "Respond in clear standard English."

    if output_language_code == "genZ":
        return """
Respond in Gen Z English. Use current Gen Z slang naturally — words like 
"no cap", "lowkey", "it's giving", "slay", "bussin", "understood the assignment", 
"main character energy", "rent free", "vibe check" etc. 
Keep it fun and informal but make sure the student still fully understands the content.
Do not force slang where it doesn't fit — keep it natural.
"""

    if output_language_code == "pcm":
        return """
Respond in Nigerian Pidgin English (Naija Pidgin).
Use natural Pidgin expressions like "wetin", "dey", "na", "abi", "e don", 
"no wahala", "sabi", "chop", "waka" etc.
Make sure the student still fully understands the educational content.
Keep it authentic — write how a Nigerian would naturally speak Pidgin.
"""

    return f"""
IMPORTANT: The source notes may be written in any language.
Regardless of what language the notes are in, you MUST respond entirely in {language_name}.
Translate all concepts and explanations into {language_name}.
Do not mix languages. Every single word of your response must be in {language_name}.
"""


def should_use_gemini(language_code: str) -> bool:
    """
    Returns True if this language should be handled by Gemini
    instead of Groq for better quality output.
    """
    return language_code in GEMINI_ONLY_LANGUAGES


def validate_language(language_code: str) -> bool:
    return language_code in SUPPORTED_LANGUAGES


def get_all_languages() -> list:
    """Returns all supported languages for the frontend language picker."""
    return [{"code": code, "name": name} for code, name in SUPPORTED_LANGUAGES.items()]