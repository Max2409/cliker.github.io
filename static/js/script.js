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

// Add event listeners for plot interaction
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

// Add event listeners for buttons
document.getElementById('process-button').addEventListener('click', toggleProcess);
document.getElementById('plant-button').addEventListener('click', togglePlant);
document.getElementById('harvest-button').addEventListener('click', toggleHarvest);
document.getElementById('shop-button').addEventListener('click', openShop);
document.getElementById('warehouse-button').addEventListener('click', openWarehouse);
document.getElementById('close-shop-button').addEventListener('click', closeShop);
document.getElementById('close-warehouse-button').addEventListener('click', closeWarehouse);
document.getElementById('buy-carrot-seeds').addEventListener('click', buyCarrotSeeds);

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
        alert('Грядка обработана');
        return;
    }

    plot.classList.add('active');
    gainXP(15);
}

function openPlantModal(plot) {
    if (!plot.classList.contains('active')) {
        alert('Сначала обработайте грядку');
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
    } else {
        alert('Недостаточно семян для посадки');
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
        alert('Нечего собирать');
        return;
    }

    plot.innerHTML = '';
    plot.classList.remove('harvestable', 'active');
    carrotSeeds += 2;
    updateWarehouse();
    gainXP(20);
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
    } else {
        alert('Недостаточно монет для покупки семян моркови');
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

updateStatus();
