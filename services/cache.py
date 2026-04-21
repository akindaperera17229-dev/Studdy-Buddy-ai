cache = {}

def get_cache(question):
    return cache.get(question)

def set_cache(question, answer):
    cache[question] = answer