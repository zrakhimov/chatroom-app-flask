import os, datetime

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

class Message:
    message_counter = 1
    def __init__(self, content, time, fk_u, fk_ch):
        #set ID property
        self.id = Message.message_counter
        Message.message_counter += 1
        #local variables
        self.content = content
        self.time = time
        #FK
        self.fk_userid = self.fk_u
        self.fk_channelid = self.fk_ch

class User:
    user_counter = 1
    def __init__(self, username):
        #set ID property
        self.id = User.user_counter
        #local variables
        self.username = username
        #FK - default it 1 which is #general
        self.fk_channelid = 1
        User.user_counter += 1
    def setChannel(fk_ch):
        self.fk_channelid = fk_ch

class Channel:
    channel_counter = 1
    def __init__(self, channelname):
        self.id = Channel.channel_counter
        self.channelname = channelname
        Channel.channel_counter += 1

########## LISTS #############
usernamesList = []
messagesList = []
channelsList = []
#first default channel is #general
channelsList.append(Channel(channelname = "#general"))
#first default user is "admin"
usernamesList.append(User(username = "admin"))

timestamp = datetime.datetime

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    # accept user input to a temp variable
    temp_username = request.form.get("username")
    found = 0
    # check if the username already exists
    for obj in usernamesList:
        if temp_username == obj.username:
            found = 1
            return render_template("error.html", message="Username already taken. Please choose a different name")
   
    # Otherwise add it to usernames list
    # create an object of type User() ==> "0 is a channel: #general by default"
    if not found:
        user_instance=User(temp_username)
        usernamesList.append(user_instance)
        for obj in channelsList:
            if user_instance.fk_channelid == obj.id:
                current_channel = obj.channelname
        
        return render_template("chat.html", username=user_instance.username, channel=current_channel)

@socketio.on("send message")
def messenger(receivedData):
    server_data = {}
    server_data["timestamp"] = timestamp.fromtimestamp(receivedData["jstimestamp"]/1000).strftime("%c")
    server_data["username"] = receivedData["username"]
    server_data["message"] = receivedData["message"]
    emit("display message", server_data, broadcast=True)
