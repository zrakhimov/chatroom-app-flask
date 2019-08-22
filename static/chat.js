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

    /************ AJAX CALL FOR CHANNELS ****************** */ 
    


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
