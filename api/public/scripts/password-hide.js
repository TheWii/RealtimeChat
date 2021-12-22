
const toggles = document.querySelectorAll('form .field.password a.toggle');
for (let toggle of toggles) {
    toggle.addEventListener('click', e => {
        e.preventDefault();
        const anchor = e.target;
        const input = anchor.parentNode.querySelector('input');
        if (input.type === 'password') {
            input.type = 'text'
            anchor.innerHTML = 'HIDE';
        } else {
            input.type = 'password'
            anchor.innerHTML = 'SHOW';
        }
    });
}