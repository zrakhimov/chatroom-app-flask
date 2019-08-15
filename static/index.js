document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#form').onsubmit = function() {
        const nickname = document.querySelector('#username').value;
        if (!localStorage.getItem('username'))
          localStorage.setItem('username', nickname);
    };
});
