from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_answer(question, mode):

    if mode == "rule_based":
        return "Try asking a more detailed question."

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a friendly teacher who explains concepts simply with examples.Always format responses using Markdown with headings, bullet points, and bold text when useful."},
                {"role": "user", "content": question}
            ],
            max_tokens=300
        )

        return response.choices[0].message.content

    except Exception as e:
        print("OPENAI ERROR:", e)
        return "AI is currently unavailable. Please try again."