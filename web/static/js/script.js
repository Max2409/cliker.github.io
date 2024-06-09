Telegram.WebApp.ready();

document.querySelectorAll('.square').forEach(square => {
    square.addEventListener('click', () => {
        square.classList.toggle('clicked');
    });
});
