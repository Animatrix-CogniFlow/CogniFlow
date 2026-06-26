import sys
import os

# Add app to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from openai import OpenAI
from app.core.config import settings

def test():
    print("Testing OpenAI API Key...")
    print(f"Key preview: {settings.OPENAI_API_KEY[:10]}...")
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Say hello!"}],
            max_tokens=10
        )
        print("Success! Response:")
        print(response.choices[0].message.content)
    except Exception as e:
        print("OpenAI test failed:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
