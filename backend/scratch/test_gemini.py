import sys
import os
import asyncio

# Add app to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.agents.ingestion_agent import extract_content_from_pdf

async def test():
    # A tiny valid 1-pixel PDF base64 or just dummy base64
    # Let's use a dummy base64 string for PDF
    dummy_pdf_b64 = "JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL1Jlc291cmNlcyA8PAogICAgID4+CiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogID4+CmVuZG9iagp0cmFpbGVyCiAgPDwgL1NpemUgNAogICAgIC9Sb290IDEgMCBSCiAgPj4Kc3RhcnR4cmVmCjI0MAolJUVPRgo="
    
    print("Testing extraction agent...")
    try:
        res = await extract_content_from_pdf(dummy_pdf_b64, "test.pdf", "en", "university")
        print("Success! Result:")
        print(res)
    except Exception as e:
        print("Failed with exception:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
