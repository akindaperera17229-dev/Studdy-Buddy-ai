import re

def validate_input(question: str) -> bool:
   
    if not question:
        return False
    question = question.strip()
    if len(question) < 2:
        return False
    if len(question) > 500:
        return False
    if question.isspace():
        return False

    return True