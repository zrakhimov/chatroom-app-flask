document.addEventListener('DOMContentLoaded', () => {


     // Connect to websocket
     var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

     // When connected, configure buttons
     socket.on('connect', () => {
        document.querySelector('button').onclick =  () => {
            const msg = document.querySelector('#message').value;
            socket.emit('send message', {'msg': msg});
        }
     });

     // When a new message is sent, add to the queue
     socket.on('display message', data => {
         const p = document.createElement('p');
         p.innerHTML = `${localStorage.getItem("nicknames")}: ${data.msg}`;
         document.querySelector('#conversation').append(p);
     });

 });
