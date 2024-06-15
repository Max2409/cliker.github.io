let isProcessing = false;
let isPlanting = false;
let isHarvesting = false;
let level = 1;
let xp = 0;
let xpNeeded = 100;
let coins = 50;
let carrotSeeds = 0;
const carrotSeedsPrice = 10;
let plots = Array(9).fill(null);

document.querySelectorAll('.plot').forEach(plot => {
    plot.addEventListener('click', (event) => {
        if (isProcessing) {
            processPlot(plot);
        } else if (isPlanting) {
            openPlantModal(plot);
        } else if (isHarvesting) {
            harvestPlot(plot);
        }
    });
});

function toggleProcess() {
    isProcessing = !isProcessing;
    isPlanting = false;
    isHarvesting = false;
    updateButtonStates();
}

function togglePlant() {
    isPlanting = !isPlanting;
    isProcessing = false;
    isHarvesting = false;
    updateButtonStates();
}

function toggleHarvest() {
    isHarvesting = !isHarvesting;
    isProcessing = false;
    isPlanting = false;
    updateButtonStates();
}

function updateButtonStates() {
    document.getElementById('process-button').classList.toggle('active', isProcessing);
    document.getElementById('plant-button').classList.toggle('active', isPlanting);
    document.getElementById('harvest-button').classList.toggle('active', isHarvesting);
}

function processPlot(plot) {
    if (plot.classList.contains('active')) {
        showNotification('Грядка уже обработана');
        return;
    }

    plot.classList.add('active');
    gainXP(15);
    saveGameData();
}

function openPlantModal(plot) {
    if (!plot.classList.contains('active')) {
        showNotification('Сначала обработайте грядку');
        return;
    }

    const modal = document.getElementById('plant-modal');
    const plantItemsContainer = modal.querySelector('.plant-items');
    plantItemsContainer.innerHTML = '';

    if (carrotSeeds > 0) {
        const plantItem = document.createElement('div');
        plantItem.classList.add('plant-item');

        const plantItemImage = document.createElement('img');
        plantItemImage.src = 'static/css/images/carrot_seeds.png';
        plantItemImage.alt = 'Морковка';
        plantItem.appendChild(plantItemImage);

        const plantItemQuantity = document.createElement('span');
        plantItemQuantity.textContent = `Количество: ${carrotSeeds}`;
        plantItem.appendChild(plantItemQuantity);

        const plantItemButton = document.createElement('button');
        plantItemButton.textContent = 'Посадить';
        plantItemButton.classList.add('plant-item-button');
        plantItemButton.addEventListener('click', () => plantSeed(plot, 'carrot'));
        plantItem.appendChild(plantItemButton);

        plantItemsContainer.appendChild(plantItem);
    } else {
        const noSeedsMessage = document.createElement('p');
        noSeedsMessage.textContent = 'Нет семян для посадки';
        plantItemsContainer.appendChild(noSeedsMessage);
    }

    modal.style.display = 'block';
}

function closePlantModal() {
    const modal = document.getElementById('plant-modal');
    modal.style.display = 'none';
}

function plantSeed(plot, seedType) {
    if (seedType === 'carrot' && carrotSeeds > 0) {
        carrotSeeds--;
        updateWarehouse();
        plot.innerHTML = '<img src="static/css/images/carrot_seeds.png" alt="Морковка"><div class="timer">30</div>';
        closePlantModal();
        startGrowing(plot, seedType);
        saveGameData();
    } else {
        showNotification('Недостаточно семян для посадки');
    }
}

function startGrowing(plot, seedType) {
    let timer = 30;
    const interval = setInterval(() => {
        timer--;
        plot.querySelector('.timer').textContent = timer;
        if (timer <= 0) {
            clearInterval(interval);
            plot.innerHTML = '<img src="static/css/images/carrot.png" alt="Морковка">';
            plot.classList.add('harvestable');
            saveGameData();  // Сохранение данных после окончания роста
        }
    }, 1000);
}

function harvestPlot(plot) {
    if (!plot.classList.contains('harvestable')) {
        showNotification('Нечего собирать');
        return;
    }

    plot.innerHTML = '';
    plot.classList.remove('harvestable', 'active');
    carrotSeeds += 2;
    updateWarehouse();
    gainXP(20);
    saveGameData();
}

function openShop() {
    const modal = document.getElementById('shop-modal');
    modal.style.display = 'block';
}

function closeShop() {
    const modal = document.getElementById('shop-modal');
    modal.style.display = 'none';
}

function openWarehouse() {
    const modal = document.getElementById('warehouse-modal');
    modal.style.display = 'block';
    updateWarehouse();
}

function closeWarehouse() {
    const modal = document.getElementById('warehouse-modal');
    modal.style.display = 'none';
}

function gainXP(amount) {
    xp += amount;
    if (xp >= xpNeeded) {
        levelUp();
    }
    updateStats();
}

function levelUp() {
    level++;
    xp -= xpNeeded;
    xpNeeded += 50;
    coins += 10;
    updateStats();
}

function updateStats() {
    document.getElementById('level').textContent = level;
    document.getElementById('xp').textContent = xp;
    document.getElementById('xpNeeded').textContent = xpNeeded;
    document.getElementById('coins').textContent = coins;
}

function updateWarehouse() {
    document.getElementById('carrotSeeds').textContent = carrotSeeds;
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('active');
    setTimeout(() => {
        notification.textContent = '';
        notification.classList.remove('active');
    }, 3000);
}

async function saveGameData() {
    try {
        const response = await fetch('/save_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: 123456789,  // Replace with actual user_id obtained from Telegram API
                level: level,
                xp: xp,
                xp_needed: xpNeeded,
                coins: coins,
                carrot_seeds: carrotSeeds,
                plots: plots
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save game data');
        }
    } catch (error) {
        console.error(error);
    }
}

document.getElementById('process-button').addEventListener('click', toggleProcess);
document.getElementById('plant-button').addEventListener('click', togglePlant);
document.getElementById('harvest-button').addEventListener('click', toggleHarvest);
document.getElementById('shop-button').addEventListener('click', openShop);
document.getElementById('shop-close').addEventListener('click', closeShop);
document.getElementById('warehouse-button').addEventListener('click', openWarehouse);
document.getElementById('warehouse-close').addEventListener('click', closeWarehouse);
document.getElementById('close-plant-modal').addEventListener('click', closePlantModal);
document.getElementById('notification').addEventListener('click', () => {
    document.getElementById('notification').classList.remove('active');
});
