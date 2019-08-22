document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("get-started").onclick = () => {
        // if localStorage already exists
        if(localStorage.getItem('username') != null && localStorage.getItem('channel') != null) {
            // set hidden input field value to 1 (means user already logged in before)
            document.querySelector("#local-storage-exists").setAttribute("value", "1");
            // set the username for the input field
            document.querySelector("#username").value = localStorage.getItem('username');
            // set the channel for hidden input field
            document.querySelector("#channel").value = localStorage.getItem('channel');
            // submit the form to the server
            document.querySelector("#form").submit();
        }
        else {
            // Store username in a local storages
            document.querySelector('#form').onsubmit = () => {
                document.querySelector("#channel").value = "#general";
                const nickname = document.querySelector('#username').value;
                const channel = document.querySelector("#channel").value;
                
                if (!localStorage.getItem('username'))
                    localStorage.setItem('username', nickname);
                if (!localStorage.getItem('channel')) {
                    localStorage.setItem('channel', channel);
                }
            };
        }
        
    }
});
