import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

candidates = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest"
]

print("--- Testing Models ---")
for model_name in candidates:
    try:
        print(f"Testing {model_name}...", end=" ")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hi")
        print("SUCCESS! ✅")
        print(f"Response: {response.text}")
        break  # Found one!
    except Exception as e:
        print(f"Failed ({e})")

print("\n--- Listing All Available 'GenerateContent' Models ---")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"List failed: {e}")
