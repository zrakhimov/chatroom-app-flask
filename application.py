import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["GET", "POST"])
def chat():
    if request.method == "GET":
        return render_template("chat.html")

    elif request.method == "POST":
        #Save nickname, display on every sent message
        form_nickname = request.form.get("nickname")
        return render_template("chat.html")

@socketio.on("send message")
def vote(data):
    msg = data["msg"]
    emit("display message", {"msg": msg}, broadcast=True)
