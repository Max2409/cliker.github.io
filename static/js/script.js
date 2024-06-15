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

document.querySelectorAll('.plot').forEach((plot, index) => {
    plot.addEventListener('click', () => handlePlotClick(index));
});

function handlePlotClick(index) {
    if (isProcessing) {
        processPlot(index);
    } else if (isPlanting) {
        openPlantModal(index);
    } else if (isHarvesting) {
        harvestPlot(index);
    }
}

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

function processPlot(index) {
    if (plots[index] !== null && plots[index].processed) {
        showNotification('Грядка уже обработана');
        return;
    }

    plots[index] = { processed: true };
    gainXP(15);
    saveGameData();
}

function openPlantModal(index) {
    if (!plots[index] || !plots[index].processed) {
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
        plantItemButton.addEventListener('click', () => plantSeed(index, 'carrot'));
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

function plantSeed(index, seedType) {
    if (seedType === 'carrot' && carrotSeeds > 0) {
        carrotSeeds--;
        updateWarehouse();
        plots[index] = { seedType, planted: true };
        closePlantModal();
        startGrowing(index, seedType);
        saveGameData();
    } else {
        showNotification('Недостаточно семян для посадки');
    }
}

function startGrowing(index, seedType) {
    let timer = 30;
    const plotElement = document.querySelector(`.plot[data-index="${index}"]`);
    const timerElement = document.createElement('div');
    timerElement.classList.add('timer');
    plotElement.appendChild(timerElement);

    const interval = setInterval(() => {
        timer--;
        timerElement.textContent = timer;
        if (timer <= 0) {
            clearInterval(interval);
            timerElement.remove();
            plots[index] = { seedType, grown: true };
            updatePlotAppearance(index);
        }
    }, 1000);
}

function updatePlotAppearance(index) {
    const plotElement = document.querySelector(`.plot[data-index="${index}"]`);
    plotElement.innerHTML = `<img src="static/css/images/${plots[index].seedType}.png" alt="${plots[index].seedType}">`;
    plotElement.classList.add('harvestable');
}

function harvestPlot(index) {
    if (!plots[index] || !plots[index].grown) {
        showNotification('Нечего собирать');
        return;
    }

    plots[index] = null;
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
    updateStatus();
    saveGameData();
}

function levelUp() {
    xp -= xpNeeded;
    level++;
    xpNeeded += 100;
    coins += 10;
    updateStatus();
    saveGameData();
}

function updateStatus() {
    document.getElementById('level').textContent = level;
    document.getElementById('xp').textContent = xp;
    document.getElementById('xp-needed').textContent = xpNeeded;
    document.getElementById('coins').textContent = coins;
}

function buyCarrotSeeds() {
    if (coins >= carrotSeedsPrice) {
        coins -= carrotSeedsPrice;
        carrotSeeds++;
        updateStatus();
        updateWarehouse();
        saveGameData();
    } else {
        showNotification('Недостаточно монет для покупки семян моркови');
    }
}

function updateWarehouse() {
    const warehouseItemsContainer = document.getElementById('warehouse-items-container');
    warehouseItemsContainer.innerHTML = '';

    if (carrotSeeds === 0) {
        const warehouseEmptyMessage = document.createElement('p');
        warehouseEmptyMessage.textContent = 'Склад пуст';
        warehouseItemsContainer.appendChild(warehouseEmptyMessage);
    } else {
        const warehouseItem = document.createElement('div');
        warehouseItem.classList.add('warehouse-item');

        const warehouseItemImage = document.createElement('img');
        warehouseItemImage.src = 'static/css/images/carrot_seeds.png';
        warehouseItemImage.alt = 'Морковка';
        warehouseItemImage.classList.add('warehouse-item-image');
        warehouseItem.appendChild(warehouseItemImage);

        const warehouseItemQuantity = document.createElement('span');
        warehouseItemQuantity.classList.add('warehouse-item-quantity');
        warehouseItemQuantity.textContent = carrotSeeds;
        warehouseItem.appendChild(warehouseItemQuantity);

        warehouseItemsContainer.appendChild(warehouseItem);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 2000);
}

async function saveGameData() {
    try {
        const response = await fetch('/save_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: 1, // Заменить на реальный user_id из телеграма
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

function openField() {
    window.location.href = 'index.html';
}

function openAnimals() {
    window.location.href = 'animals.html';
}

function openMarket() {
    openShop();
}

function openTasks() {
    // Ваш код для открытия заданий
}

function openRanking() {
    // Ваш код для открытия рейтинга
}

updateStatus();
