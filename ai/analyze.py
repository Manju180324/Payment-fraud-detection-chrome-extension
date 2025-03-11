# Python AI model using Gemini API
import os
import google.generativeai as genai
from extract import extract_text_from_url

genai.configure(api_key="YOUR_GEMINI_API_KEY")

def analyze_with_gemini(url):
    text = extract_text_from_url(url)
    if not text:
        return {"status": "error", "message": "Failed to extract text"}

    prompt = f"""
    Is this webpage trying to trick users into providing personal information?
    Look for urgent warnings, fake security alerts, or login requests.

    Text: {text}
    """

    response = genai.generate_text(prompt=prompt)
    
    if "yes" in response.lower():
        return {"status": "danger", "message": "AI detected phishing intent!"}
    
    return {"status": "safe", "message": "No phishing intent found."}
