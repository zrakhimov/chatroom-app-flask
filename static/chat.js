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

    /************ AJAX CALL FOR CHANNELS ****************** */ 
    document.querySelector("#add-channel-button").onclick = () => {

        const channel = document.querySelector("#channel-id").value;
        if (channel == ""){
            alert("Please enter channel name!");
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
                alert("Channel exists! Please enter a different name for the channel");
            else {
                 //location.reload();
                //Extract JSON data from request
                const data = JSON.parse(request.responseText);

                //Create button element
                const button = document.createElement('button');
                
                // id = <data.channel.id>
                const attid = document.createAttribute("id");
                attid.value =  `${data.channelid}`;

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

    document.querySelectorAll(".ch-class").forEach( (button) => {
        button.onclick = () => {
            const channel_id = button.getAttribute("id");
            const username = localStorage.getItem('username');
            if (channel_id == ""){
                alert("Channel id doesn't exist!");
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
                        alert("Something went wrong");
                    else {
                        document.querySelector(`#${data.channel_id}`).active = true;
                        
                    }
                }
            }
            
            return false;
        };
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
            const timestamp = new Date().getTime();
            //Prepare the data to send it to server
            const data = {'message': message, 'username': username, 'jstimestamp': timestamp};
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
         p.innerHTML = `${data.username}: ${data.message}<br>Sent time: ${data.timestamp}`;
         document.querySelector('#conversation').append(p);

        // Scroll the messages to the bottom
        var messageScroll = document.getElementById("conversation");
        messageScroll.scrollTo(0, messageScroll.scrollHeight);
     });

 });
