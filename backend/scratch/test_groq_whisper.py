import sys
import os

# Add app to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from groq import Groq
from app.core.config import settings

def test():
    print("Testing Groq Whisper API...")
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    # We need dummy audio bytes (a tiny valid WebM/WAV/MP3)
    # A tiny silent WebM file:
    dummy_webm_base64 = "GkXfo6NChoEBQveBAULygQSTgdEDrk4ut0QkY71zk4uh80QkY71zk4uS80QkY71zk4uR80QkY71zk4uO80QkY71zk4uM80QkY71zk4uK80QkY71zk4uI80QkY71zk4uG80QkY71zk4uE80QkY71zk4uC80QkY71zk4uA80QkY71zk4t880QkY71zk4t680QkY71zk4t480QkY71zk4t280QkY71zk4t080QkY71zk4ty80QkY71zk4tw80QkY71zk4tu80QkY71zk4ts80QkY71zk4tq80QkY71zk4to80QkY71zk4tm80QkY71zk4tk80QkY71zk4ti80QkY71zk4tg80QkY71zk4te80QkY71zk4tc80QkY71zk4ta80QkY71zk4tY80QkY71zk4tW80QkY71zk4tU80QkY71zk4tS80QkY71zk4tQ80QkY71zk4tO80QkY71zk4tM80QkY71zk4tK80QkY71zk4tI80QkY71zk4tG80QkY71zk4tE80QkY71zk4tC80QkY71zk4tA"
    import base64
    audio_bytes = base64.b64decode(dummy_webm_base64)
    
    try:
        response = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=("audio.webm", audio_bytes),
        )
        print("Success! Transcription:")
        print(response.text)
    except Exception as e:
        print("Groq Whisper failed:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
