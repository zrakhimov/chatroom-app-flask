import os, datetime

from flask import Flask, redirect, render_template, request, jsonify, abort, url_for, json
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

class Message:
    message_counter = 0
    def __init__(self, content, time, fk_u, fk_ch):
        #set ID property
        self.id = Message.message_counter
        Message.message_counter += 1
        #local variables
        self.content = content
        self.time = time
        self.fk_u = fk_u
        self.fk_ch = fk_ch


class User:
    user_counter = 0
    def __init__(self, username):
        #set ID property
        self.id = User.user_counter
        #local variables
        self.username = username
        #FK - default it 0 which is #general
        self.fk_channelid = 0
        User.user_counter += 1
    def setChannel(self, fk_ch):
        self.fk_channelid = fk_ch

class Channel:
    channel_counter = 0
    def __init__(self, channelname):
        self.id = Channel.channel_counter
        self.channelname = channelname
        Channel.channel_counter += 1

########## LISTS #############
usernamesList = []
messagesList = []
channelsList = []
#first default channel is #general
channelsList.append(Channel(channelname = "general"))
#first default user is "admin"
usernamesList.append(User(username = "admin"))

timestamp = datetime.datetime

# Returns jsonified Users list
def UconvertToJSON(UlistOfClassObjects):
    dictList = []
    dict = {}
    for Uobj in UlistOfClassObjects:
        dict = {"id":Uobj.id, "username":Uobj.username, "fk_channelid": Uobj.fk_channelid}
        dictList.append(dict)
    return json.dumps(dictList)

# Returns jsonified Channels list
def CHconvertToJSON(CHlistOfClassObjects):
    dictList = []
    dict = {}
    for CHobj in CHlistOfClassObjects:
        dict = {"id":CHobj.id, "channelname":CHobj.channelname}
        dictList.append(dict)
    return json.dumps(dictList)

# Returns jsonified Messages list
def MconvertToJSON(MlistOfClassObjects):
    dictList = []
    dict = {}
    for Mobj in MlistOfClassObjects:
        dict = {"id":Mobj.id, "content":Mobj.content, "time": Mobj.time, "fk_channelid": Mobj.fk_ch, "fk_userid": Mobj.fk_u}
        dictList.append(dict)
    return json.dumps(dictList)



@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    # accept user input to a temp variable
    local_storage_exists = request.form.get("name-local-storage-exists")

    if (local_storage_exists is "1"):
        existing_username = request.form.get("username")
        existing_channel = request.form.get("channel")
        for obj in channelsList:
                if existing_channel == obj.channelname:
                    temp_ch_id = obj.id
        return render_template("chat.html", username=existing_username, current_channel=existing_channel, temp_ch_id=temp_ch_id, channelsResult=channelsList, messagesResult=messagesList)
    else:
        found = False
        new_username = request.form.get("username")
        # check if the username already exists
        for obj in usernamesList:
            if new_username == obj.username:
                found = True
        if found:
            return render_template("error.html", message="Username already taken. Please choose a different name")
        # Otherwise add it to usernames list
        # create an object of type User() ==> "0 is a channel: #general by default"
        if not found:
            new_user_instance = User(username = new_username)
            usernamesList.append(new_user_instance)
            for obj in channelsList:
                if new_user_instance.fk_channelid == obj.id:
                    temp_ch_id = obj.id
                    current_channel = obj.channelname
            return render_template("chat.html", username=new_user_instance.username, current_channel=current_channel, temp_ch_id=temp_ch_id, channelsResult=channelsList, messagesResult=messagesList)
#todo : POST REDIRECT GET pattern

#Ajax add
@app.route("/addch", methods=["POST"])
def addchannel():

    #Recieve sent data from AJAX call
    channel = request.form.get("channel")
    channel_exists = False
    #Check if the channel already exist
    for obj in channelsList:
        if channel == obj.channelname:
            channel_exists = True
    if channel_exists:
        return jsonify({"status": "exists"})
    else:
        #Add channel to the channel list of Channel objects
        channelsList.append(Channel(channelname = channel))
        #Return the last item in the channelsList

        return jsonify({"channel": channelsList[-1].channelname, "channelid": channelsList[-1].id})
        
# AJAX getData
@app.route("/getData")
def getData():
    json_usernamesList = UconvertToJSON(usernamesList)
    json_channelsList = CHconvertToJSON(channelsList)
    json_messagesList = MconvertToJSON(messagesList)
    masterList = []
    masterList.append(json_usernamesList)
    masterList.append(json_channelsList)
    masterList.append(json_messagesList)
    return jsonify(masterList)

# AJAX select
@app.route("/selectch", methods=["POST"])
def selectchannel():
    #Receive sent data from AJAX call
    channel_id = request.form.get("channel_id")
    username = request.form.get("username")
    
    #Set channel for the user
    for user_obj in usernamesList:
        if username == user_obj.username:
            user_obj.setChannel(channel_id)
    
    # Find the channel name selected
    selected_channel = ""
    for channel_obj in channelsList:
        if channel_obj.id == int(channel_id):
            selected_channel = channel_obj.channelname

    return jsonify({"selected_channel": selected_channel})

    


@socketio.on("send message")
def messenger(receivedData):
    server_data = {}
    server_data["timestamp"] = timestamp.fromtimestamp(receivedData["jstimestamp"]/1000).strftime("%c")
    server_data["username"] = receivedData["username"]
    server_data["message"] = receivedData["message"]
    server_data["channel"] = receivedData["channel"]
    tempfk_u = ""
    tempfk_ch = ""

    # get userid of author
    for user in usernamesList:
        if user.username == receivedData["username"]:
            tempfk_u = user.id
    
    # get channelid of author
    for channel in channelsList:
        if channel.channelname == receivedData["channel"]:
            tempfk_ch = channel.id

    server_data["channelid"] = tempfk_ch
    server_data["userid"] = tempfk_u

    mObject = Message(content = receivedData["message"], time = server_data["timestamp"], fk_u = tempfk_u, fk_ch = tempfk_ch)
    messagesList.append(mObject)

    emit("display message", server_data, broadcast=True)
