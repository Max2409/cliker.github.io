document.addEventListener('DOMContentLoaded', function () {
    let counter = 0;
    const counterElement = document.getElementById('counter');
    const clickButton = document.getElementById('click-button');

    clickButton.addEventListener('click', function () {
        counter++;
        counterElement.textContent = 'Счетчик: ' + counter;
    });
});
