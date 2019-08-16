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

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
     
    
    // Send Message
     socket.on('connect', () => {
        document.querySelector('#send').onclick =  () => {
            // Reset input field
            const msg = document.querySelector('#message').value;

            //Prepare the data to send it to server
            const username = localStorage.getItem('username');
            const data = {'msg': msg, 'username': username};
            socket.emit('send message', data);
            document.querySelector('#message').value = "";
        }
     });

     // Display Messae
     socket.on('display message', data => {
         const p = document.createElement('p');
         p.innerHTML = `${data.username}: ${data.msg}`;
         document.querySelector('#conversation').append(p);
     });

 });
