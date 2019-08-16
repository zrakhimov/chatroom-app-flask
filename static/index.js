document.addEventListener('DOMContentLoaded', function() {
    //Focus on the input field
    document.getElementById('username').focus();
    // Store username in a local storages
    document.querySelector('#form').onsubmit = function() {
        const nickname = document.querySelector('#username').value;
        localStorage.setItem('username', nickname);
        if (!localStorage.getItem('channel'))
            localStorage.setItem('channel', "#general")
    };
});
