import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    username = request.form.get("username")
    return render_template("chat.html", username=username)

@socketio.on("send message")
def messenger(data):
    msg = data["msg"]
    emit("display message", {"msg": msg}, broadcast=True)
