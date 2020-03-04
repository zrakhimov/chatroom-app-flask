document.addEventListener('DOMContentLoaded', () => {



    /************BIND 'SEND' with "Return key"****************** */ 
    var input = document.getElementById("message");
    // Execute a function when the user releases a key on the keyboard
    input.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("send").click();
        // focus input field
        document.getElementById("message").focus();
    }
    });

    /************BIND 'ADD' with "Return key"****************** */ 
    var input = document.getElementById("channel-id");
    // Execute a function when the user releases a key on the keyboard
    input.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("add-channel-button").click();
        // focus input field
        document.getElementById("channel-id").focus();
    }
    });



    /************ Socket IO ****************** */ 
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
     
    
    // Send Message
     socket.on('connect', () => {
        document.querySelector('#send').onclick =  () => {
            if(document.querySelector('#message').value == ''){
                // don't do anything
            }
            else {
            // Save data to local variables
            const message = document.querySelector('#message').value;
            const username = localStorage.getItem('username');
            const channel = localStorage.getItem('channel')
            const timestamp = new Date().getTime();
            //Prepare the data to send it to server
            const data = {'message': message, 'username': username, 'jstimestamp': timestamp, 'channel': channel};
            socket.emit('send message', data);
            
            // Clear input field and autofocus
            document.querySelector('#message').value = "";
            document.querySelector('#message').focus();
            }  
        }
     });

     // Display Message
     socket.on('display message', data => {
         const p = document.createElement('p');
         if (localStorage.getItem('channel') == data.channel)
         {
            p.innerHTML = `<b>${data.username}</b> @ ${data.timestamp} <br><font color="blue">${data.message}</font><br>`;
            document.querySelector('#conversation').append(p);
         }

        // Scroll the messages to the bottom
        var messageScroll = document.getElementById("conversation");
        messageScroll.scrollTo(0, messageScroll.scrollHeight);
     });

     /************ END SOCKET IO ***********/

 });



/**************** 
 * 
 * 
 *  OBSERVE
 *          
 * 
 * 
 ****************/
 document.addEventListener("mousemove", () => {

    /************ AJAX CALL FOR creating CHANNELS ****************** */ 
    document.querySelector("#add-channel-button").onclick = () => {

        const channel = document.querySelector("#channel-id").value;
        if (channel == ""){
            console.log("Please enter channel name!");
        }
        else {
            // Initialize new AJAX request
            const request = new XMLHttpRequest();
            request.open('POST', '/addch');
            // Add data to send with request
            const data = new FormData();
            data.append('channel', channel);
            // Send request
            request.send(data);


        // Callback function
        request.onload = () => {
            if (JSON.parse(request.responseText).status == "exists")
                console.log("Channel exists! Please enter a different name for the channel");
            else {
                //location.reload();
                //Extract JSON data from request
                const data = JSON.parse(request.responseText);

                //Create button element
                const button = document.createElement('button');
                
                // id = <data.channel.id>
                const attid = document.createAttribute("id");
                attid.value =  `ch-${data.channelid}`;

                //class = btn btn-outline-secondary
                const attclass = document.createAttribute("class");
                attclass.value = "ch-class btn btn-outline-secondary"
                // type = button
                const atttype = document.createAttribute("type");
                atttype.value = "button"

                button.innerHTML = `#${data.channel}`;
                button.setAttributeNode(attclass);
                button.setAttributeNode(atttype);
                button.setAttributeNode(attid);
                document.querySelector('#channel-list').append(button);
                
            }
        }
        // Clear input field and autofocus
        document.querySelector('#channel-id').value = "";
        document.querySelector('#channel-id').focus();

        }
        
        return false;
    }

    /************ AJAX CALL FOR selecting CHANNELS ****************** */ 
    document.querySelectorAll(".ch-class").forEach( (button) => {
        button.onclick = () => {
            // channel id change from "ch-2" to "2"
            const channel_id = button.getAttribute("id").replace("ch-", "");
            const username = localStorage.getItem('username');

            // Clear out messages
            document.querySelector("#conversation").innerHTML = "";

            if (channel_id == ""){
                console.log("Channel id doesn't exist!");
            }
            else {
                // Initialize new AJAX request
                const request = new XMLHttpRequest();
                request.open('POST', '/selectch');
                // Add data to send with request
                const data = new FormData();
                data.append('channel_id', channel_id);
                data.append('username', username)
                // Send request
                request.send(data);


                // Callback function
                request.onload = () => {
                    if (request.status != 200)
                        console.log("Something went wrong");
                    else {
                        //Extract JSON data from request
                        const data = JSON.parse(request.responseText);
                        const messages = JSON.parse(data.messages);
                        const users = JSON.parse(data.users);
                        // Display current channel
                        document.querySelector("#current_channel").innerHTML = "#" + data.selected_channel;
                        // Change Local Storage channel value
                        localStorage.setItem('channel', data.selected_channel);
                        // Highlight the button as active
                        document.querySelectorAll(".ch-class").forEach( (button) => {
                                if (button.innerHTML == `#${data.selected_channel}`){
                                    button.classList.add("active");
                                }
                                else {
                                    button.classList.remove("active");
                                }
                        });
                        // Display list of messages for the specific channel
                        for (var i=0; i < messages.length ; i++){
                            const p = document.createElement('p');
                            var username = "";
                            // convert messages[i].fk_userid => actual username who sent message
                            for (var j=0; j < users.length; j++){
                                if(messages[i].fk_userid == users[j].id) {
                                    username = users[j].username;
                                }
                            }
                            p.innerHTML = `<b>${username}</b> @ <h6"> ${messages[i].time}</h6> <br><font color="blue">${messages[i].content}</font><br>`;
                            document.querySelector('#conversation').append(p);
                        }
                    }
                }
            }
            
            return false;
        };
    });   
       
    

 });





