import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

usernames = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    localStorageUsername = request.form.get("username")
    if localStorageUsername in usernames :
        return render_template("error.html", message="Username already taken. Please choose a different name")
    usernames.append(localStorageUsername)
    return render_template("chat.html", username=localStorageUsername)

@socketio.on("send message")
def messenger(data):
    emit("display message", data, broadcast=True)
