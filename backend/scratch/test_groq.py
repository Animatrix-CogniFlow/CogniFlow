import sys
import os

# Add app to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from groq import Groq
from app.core.config import settings

def test():
    print("Testing Groq API Key...")
    print(f"Key preview: {settings.GROQ_API_KEY[:10]}...")
    client = Groq(api_key=settings.GROQ_API_KEY)
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Say hello!"}],
            max_tokens=10
        )
        print("Success! Response:")
        print(response.choices[0].message.content)
    except Exception as e:
        print("Groq test failed:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
