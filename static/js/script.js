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
    let savedProgress = localStorage.getItem('gameProgress');
    if (savedProgress) {
        let progress = JSON.parse(savedProgress);
        isProcessing = progress.isProcessing;
        isPlanting = progress.isPlanting;
        isHarvesting = progress.isHarvesting;
        level = progress.level;
        xp = progress.xp;
        xpNeeded = progress.xpNeeded;
        coins = progress.coins;
        carrotSeeds = progress.carrotSeeds;
        plots = progress.plots;
        updateStatus();
        updateButtonStates();
    }
};

document.querySelectorAll('.plot').forEach(plot => {
    plot.addEventListener('click', (event) => {
        if (isProcessing) {
            processPlot(plot);
        } else if (isPlanting) {
            openPlantModal(plot);
        } else if (isHarvesting) {
            harvestPlot(plot);
        }
        saveProgress();  // Save progress after each interaction
    });
});

function toggleProcess() {
    isProcessing = !isProcessing;
    isPlanting = false;
    isHarvesting = false;
    updateButtonStates();
    saveProgress();  // Save progress when toggling process
}

function togglePlant() {
    isPlanting = !isPlanting;
    isProcessing = false;
    isHarvesting = false;
    updateButtonStates();
    saveProgress();  // Save progress when toggling plant
}

function toggleHarvest() {
    isHarvesting = !isHarvesting;
    isProcessing = false;
    isPlanting = false;
    updateButtonStates();
    saveProgress();  // Save progress when toggling harvest
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
    saveProgress();  // Save progress after processing plot
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
        plantItemImage.classList.add('plant-item-image');
        plantItem.appendChild(plantItemImage);

        const plantItemQuantity = document.createElement('span');
        plantItemQuantity.classList.add('plant-item-quantity');
        plantItemQuantity.textContent = `Количество: ${carrotSeeds}`;
        plantItem.appendChild(plantItemQuantity);

        plantItem.addEventListener('click', () => {
            plantSeeds(plot, 'carrot');
            modal.style.display = 'none';
        });

        plantItemsContainer.appendChild(plantItem);
    } else {
        const noSeedsMessage = document.createElement('p');
        noSeedsMessage.textContent = 'У вас нет семян';
        plantItemsContainer.appendChild(noSeedsMessage);
    }

    modal.style.display = 'block';
}

function plantSeeds(plot, type) {
    if (type === 'carrot' && carrotSeeds > 0) {
        carrotSeeds--;
        plot.dataset.type = 'carrot';
        plot.classList.add('planted');
        saveProgress();  // Save progress after planting seeds
    }
}

function harvestPlot(plot) {
    if (!plot.classList.contains('planted')) {
        showNotification('Нет растений для сбора');
        return;
    }

    if (plot.dataset.type === 'carrot') {
        carrotSeeds++;
        plot.classList.remove('planted');
        plot.classList.remove('active');
        delete plot.dataset.type;
        gainXP(10);
        saveProgress();  // Save progress after harvesting
    }
}

function gainXP(amount) {
    xp += amount;
    if (xp >= xpNeeded) {
        level++;
        xp = xp - xpNeeded;
        xpNeeded = Math.floor(xpNeeded * 1.5);
    }
    updateStatus();
    saveProgress();  // Save progress after gaining XP
}

function updateStatus() {
    document.getElementById('level').textContent = `Уровень: ${level}`;
    document.getElementById('xp').textContent = `Опыт: ${xp}/${xpNeeded}`;
    document.getElementById('coins').textContent = `Монеты: ${coins}`;
    document.getElementById('carrot-seeds').textContent = `Семена моркови: ${carrotSeeds}`;
}

function saveProgress() {
    let progress = {
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

function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

function updateShop(tab) {
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

updateStatus();
