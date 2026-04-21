from flask import Blueprint, request, jsonify
from services.router import route_question
from services.ai_service import generate_answer
from services.cache import get_cache, set_cache
from utils.validator import validate_input

ask_blueprint = Blueprint('ask', __name__)

@ask_blueprint.route("/ask", methods = ["POST"])
def ask():
    try :
        question = request.json.get("question")

        if not validate_input(question):
            return jsonify({"answer": "Invalid input"}), 400
        
        cached = get_cache(question)
        if cached:
            return jsonify({"answer": cached})
        
        route =  route_question(question)

        answer = generate_answer(question, route)

        set_cache(question, answer)

        return jsonify({"answer": answer})
    
    except Exception as e :
         print("Error:", e)
         return jsonify({"answer": "Server error"}), 500