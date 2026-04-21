def route_question(question):
    q = question.lower()

    if len(q) < 10:
        return "rule_based"
    elif "what is" in q:
        return "simple_ai"
    else:
        return "full_ai"
    