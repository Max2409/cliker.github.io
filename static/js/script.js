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

// Load progress from localStorage
window.onload = function() {
    loadProgress();
    updateStatus();
    updateButtonStates();
    updatePlots();
    startAutoSave();
    startAutoGrowing();
};

document.querySelectorAll('.plot').forEach((plot, index) => {
    plot.addEventListener('click', (event) => {
        if (isProcessing) {
            processPlot(plot, index);
        } else if (isPlanting) {
            openPlantModal(plot, index);
        } else if (isHarvesting) {
            harvestPlot(plot, index);
        }
        saveProgress();  // Save progress after each interaction
    });
});

function toggleProcess() {
    isProcessing = !isProcessing;
    isPlanting = false;
    isHarvesting = false;
    updateButtonStates();
    saveProgress();
}

function togglePlant() {
    isPlanting = !isPlanting;
    isProcessing = false;
    isHarvesting = false;
    updateButtonStates();
    saveProgress();
}

function toggleHarvest() {
    isHarvesting = !isHarvesting;
    isProcessing = false;
    isPlanting = false;
    updateButtonStates();
    saveProgress();
}

function updateButtonStates() {
    console.log('Updating button states:', { isProcessing, isPlanting, isHarvesting });
    document.getElementById('process-button').classList.toggle('active', isProcessing);
    document.getElementById('plant-button').classList.toggle('active', isPlanting);
    document.getElementById('harvest-button').classList.toggle('active', isHarvesting);
}

function processPlot(plot, index) {
    console.log(`Processing plot ${index}`);
    if (plot.classList.contains('active')) {
        showNotification('Грядка уже обработана');
        return;
    }

     plot.classList.add('active');
    plots[index] = { status: 'processed' };
    gainXP(15);
    saveProgress();
}

function openPlantModal(plot, index) {
    console.log(`Opening plant modal for plot ${index}`);
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
        plantItemButton.addEventListener('click', () => plantSeed(plot, 'carrot', index));
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

function plantSeed(plot, seedType, index) {
    if (seedType === 'carrot' && carrotSeeds > 0) {
        carrotSeeds--;
        updateWarehouse();
        const plantTime = Date.now(); // Сохраняем текущее время в миллисекундах
        plot.innerHTML = '<img src="static/css/images/carrot_seeds.png" alt="Морковка"><div class="timer">30</div>';
        closePlantModal();
        plots[index] = { status: 'planted', type: 'carrot', plantTime, growTime: 30000 }; // Время роста в миллисекундах (30 секунд)
        saveProgress();  // Save progress after planting seeds
        updatePlots();
    } else {
        showNotification('Недостаточно семян для посадки');
    }
}

function startGrowing(plot, index) {
    let timer = plots[index].timeLeft;
    if (!plots[index].interval) {
        console.log(`Starting growing process for plot ${index} with timer ${timer}`);
        plots[index].interval = setInterval(() => {
            timer--;
            plot.querySelector('.timer').textContent = timer;
            plots[index].timeLeft = timer;
            if (timer <= 0) {
                clearInterval(plots[index].interval);
                plot.innerHTML = '<img src="static/css/images/carrot.png" alt="Морковка">';
                plot.classList.add('harvestable');
                plots[index] = { status: 'harvestable', type: 'carrot' };
                saveProgress();
            }
        }, 1000);
    }
}


function harvestPlot(plot, index) {
    if (!plot.classList.contains('harvestable')) {
        showNotification('Нечего собирать');
        return;
    }

    plot.innerHTML = '';
    plot.classList.remove('harvestable', 'active');
    carrotSeeds += 2;
    updateWarehouse();
    gainXP(20);
    plots[index] = null;  // Грядка становится необработанной после сбора урожая
    saveProgress();  // Save progress after harvesting
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
    saveProgress();  // Save progress after gaining XP
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
    saveProgress();  // Save progress after leveling up
}

function updateStatus() {
    document.getElementById('level').textContent = level;
    document.getElementById('xp').textContent = xp;
    document.getElementById('xp-needed').textContent = xpNeeded;
    document.getElementById('coins').textContent = coins;
    document.getElementById('carrot-seeds').textContent = `Семена моркови: ${carrotSeeds}`;
}

function buyCarrotSeeds() {
    if (coins >= carrotSeedsPrice) {
        coins -= carrotSeedsPrice;
        carrotSeeds += 1;
        updateStatus();
        updateWarehouse();
        saveProgress();  // Save progress after buying carrot seeds
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

function saveProgress() {
    const progress = {
        isProcessing,
        isPlanting,
        isHarvesting,
        level,
        xp,
        xpNeeded,
        coins,
        carrotSeeds,
        plots
    };
    localStorage.setItem('gameProgress', JSON.stringify(progress));
}

function loadProgress() {
    let savedProgress = localStorage.getItem('gameProgress');
    if (savedProgress) {
        savedProgress = JSON.parse(savedProgress);
        isProcessing = savedProgress.isProcessing;
        isPlanting = savedProgress.isPlanting;
        isHarvesting = savedProgress.isHarvesting;
        level = savedProgress.level;
        xp = savedProgress.xp;
        xpNeeded = savedProgress.xpNeeded;
        coins = savedProgress.coins;
        carrotSeeds = savedProgress.carrotSeeds;
        plots = savedProgress.plots.map((plot) => ({
            ...plot,
            interval: null
        }));
        updatePlots();
        startAutoSave();
        startAutoGrowing(); // Запускаем автогрошение
    }
}

function updatePlots() {
    console.log('Updating plots...');
    document.querySelectorAll('.plot').forEach((plot, index) => {
        const plotData = plots[index];
        if (plotData) {
            if (plotData.status === 'processed') {
                plot.classList.add('active');
                plot.innerHTML = '';  // Очищаем грядку, но оставляем её обработанной
            } else if (plotData.status === 'planted') {
                startGrowing(plot, index);
            } else if (plotData.status === 'harvestable') {
                plot.innerHTML = '<img src="static/css/images/carrot.png" alt="Морковка">';
                plot.classList.add('harvestable');
            }
        } else {
            plot.classList.remove('active', 'harvestable');
            plot.innerHTML = '';
        }
    });
}

function startGrowing(plot, index) {
    const plotData = plots[index];
    if (plotData && plotData.status === 'planted') {
        const currentTime = Date.now();
        let timeElapsed = currentTime - plotData.plantTime;
        let timeLeft = plotData.growTime - timeElapsed;
        if (timeLeft <= 0) {
            plot.innerHTML = '<img src="static/css/images/carrot.png" alt="Морковка">';
            plot.classList.add('harvestable');
            plots[index] = { status: 'harvestable', type: 'carrot' };
        } else {
            plot.innerHTML = `<img src="static/css/images/carrot_seeds.png" alt="Морковка"><div class="timer">${Math.ceil(timeLeft / 1000)}</div>`;
            plots[index].interval = setInterval(() => {
                timeLeft -= 1000; // Вычитаем 1000 миллисекунд (1 секунду)
                plot.querySelector('.timer').textContent = Math.ceil(timeLeft / 1000); // Отображаем таймер в секундах
                if (timeLeft <= 0) {
                    clearInterval(plots[index].interval);
                    plot.innerHTML = '<img src="static/css/images/carrot.png" alt="Морковка">';
                    plot.classList.add('harvestable');
                    plots[index] = { status: 'harvestable', type: 'carrot' };
                    saveProgress();
                }
            }, 1000);
        }
    }
}

// Функции для обработки нажатий на новые кнопки
function openField() {
    saveProgress();
    window.location.href = 'index.html';
}

function openAnimals() {
    saveProgress();
    window.location.href = 'animals.html';
}

function openMarket() {
    saveProgress();
    openShop();
}

function openTasks() {
    saveProgress();
    // Ваш код для открытия заданий
}

function openRanking() {
    saveProgress();
    // Ваш код для открытия рейтинга
}

function showShopTab(tab) {
    document.getElementById('shop-buy-tab').style.display = 'none';
    document.getElementById('shop-sell-tab').style.display = 'none';

    if (tab === 'buy') {
        document.getElementById('shop-buy-tab').style.display = 'block';
    } else if (tab === 'sell') {
        document.getElementById('shop-sell-tab').style.display = 'block';
        updateWarehouseSell();
    }
}

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

function sellCarrotSeeds(quantity) {
    if (carrotSeeds >= quantity) {
        carrotSeeds -= quantity;
        coins += 10 * quantity;
        updateStatus();
        updateWarehouse();
        updateWarehouseSell();
        saveProgress();  // Save progress after selling carrot seeds
    } else {
        showNotification('Недостаточно моркови на складе');
    }
}

function startAutoSave() {
    setInterval(() => {
        saveProgress();
    }, 1000); // 1000 миллисекунд = 1 секунда
}

function startAutoGrowing() {
    document.querySelectorAll('.plot').forEach((plot, index) => {
        const plotData = plots[index];
        if (plotData && plotData.status === 'planted') {
            startGrowing(plot, index);
        }
    });
}


updateStatus();
