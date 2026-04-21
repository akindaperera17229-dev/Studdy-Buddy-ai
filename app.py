from flask import Flask, request, jsonify, render_template
from routes.ask import ask_blueprint


app = Flask(__name__)

app.register_blueprint(ask_blueprint)
@app.route('/')
def home():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug = True)




