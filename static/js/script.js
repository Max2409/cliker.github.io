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
    updateStatus();
    saveGameData();
}

function levelUp() {
    xp -= xpNeeded;
    level++;
    xpNeeded += 100;
    if (level > 999) {
        level = 999;
        xp = xpNeeded;
    }
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
        carrotSeeds += 1;
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

// Функции для обработки нажатий на новые кнопки
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

// Функция для обновления данных на складе при продаже
function updateWarehouseSell() {
    const warehouseItemsContainerSell = document.getElementById('warehouse-items-container-sell');
    warehouseItemsContainerSell.innerHTML = '';

    if (carrotSeeds === 0) {
        const warehouseEmptyMessage = document.createElement('p');
        warehouseEmptyMessage.textContent = 'Склад пуст';
        warehouseItemsContainerSell.appendChild(warehouseEmptyMessage);
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
        warehouseItemQuantity.textContent = `Количество: ${carrotSeeds}`;
        warehouseItem.appendChild(warehouseItemQuantity);

        const warehouseItemSellButton = document.createElement('button');
        warehouseItemSellButton.classList.add('warehouse-item-button');
        warehouseItemSellButton.textContent = 'Продать';
        warehouseItemSellButton.onclick = () => sellCarrotSeeds(1);
        warehouseItem.appendChild(warehouseItemSellButton);

        warehouseItemsContainerSell.appendChild(warehouseItem);
    }
}

// Функция для продажи семян моркови
function sellCarrotSeeds(quantity) {
    if (carrotSeeds >= quantity) {
        carrotSeeds -= quantity;
        coins += 10 * quantity;
        updateStatus();
        updateWarehouse();
        updateWarehouseSell();
        saveGameData();
    } else {
        showNotification('Недостаточно моркови на складе');
    }
}

updateStatus();
