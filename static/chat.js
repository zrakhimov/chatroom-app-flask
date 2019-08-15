document.addEventListener('DOMContentLoaded', () => {


     // Connect to websocket
     var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

     // When connected, configure buttons
     socket.on('connect', () => {
        document.querySelector('button').onclick =  () => {
            const msg = document.querySelector('#message').value;
            const nickname = localStorage.getItem('nickname');
            socket.emit('send message', {'msg': msg, 'nickname': nickname});
        }
     });

     // When a new message is sent, add to the queue
     socket.on('display message', data => {
         const p = document.createElement('p');
         p.innerHTML = `${data.nickname}: ${data.msg}`;
         document.querySelector('#conversation').append(p);
     });

 });
