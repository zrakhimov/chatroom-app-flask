import os, datetime

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

usernames = []
messages = []
timestamp = datetime.datetime

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    localStorageUsername = request.form.get("username")
    #if username is already being used
    if localStorageUsername in usernames :
        return render_template("error.html", message="Username already taken. Please choose a different name")
    #Otherwise add it to usernames list
    usernames.append(localStorageUsername)
    return render_template("chat.html", username=localStorageUsername)

@socketio.on("send message")
def messenger(receivedData):
    server_data = {}

    server_data["timestamp"] = timestamp.fromtimestamp(receivedData["jstimestamp"]/1000).strftime("%c %z %Z")
    server_data["username"] = receivedData["username"]
    server_data["message"] = receivedData["message"]
    emit("display message", server_data, broadcast=True)
