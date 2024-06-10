let level = 1;
let xp = 0;
let xpNeeded = 100;
let isProcessing = false;

document.querySelectorAll('.plot').forEach(plot => {
    plot.addEventListener('click', () => {
        if (isProcessing && !plot.classList.contains('active')) {
            plot.classList.add('active');
            gainXP(5);
        }
    });
});

function toggleProcess() {
    isProcessing = !isProcessing;
    const button = document.getElementById('process-button');
    if (isProcessing) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
}

function plant() {
    alert('Посадка растений...');
    gainXP(15); // Example XP gain for planting
}

function harvest() {
    alert('Сбор урожая...');
    gainXP(20); // Example XP gain for harvesting
}

function warehouse() {
    alert('Открытие склада...');
}

function openShop() {
    const modal = document.getElementById('shop-modal');
    modal.style.display = 'block';
}

function closeShop() {
    const modal = document.getElementById('shop-modal');
    modal.style.display = 'none';
}

function field() {
    alert('Открытие поля...');
}

function stable() {
    alert('Открытие стойла...');
}

function garden() {
    alert('Открытие сада...');
}

function barn() {
    alert('Открытие амбара...');
}

function market() {
    alert('Открытие рынка...');
}

function gainXP(amount) {
    xp += amount;
    if (xp >= xpNeeded) {
        levelUp();
    }
    updateStatus();
}

function levelUp() {
    xp -= xpNeeded;
    level++;
    xpNeeded += 100;
    if (level > 999) {
        level = 999;
        xp = xpNeeded;
    }
    updateStatus();
}

function updateStatus() {
    document.getElementById('level').textContent = level;
    document.getElementById('xp').textContent = xp;
    document.getElementById('xp-needed').textContent = xpNeeded;
}

updateStatus();
