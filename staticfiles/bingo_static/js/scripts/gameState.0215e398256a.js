// gameState.js
function getLocalStorageItem(key, defaultValue) {
    const value = localStorage.getItem(key);
    return value !== null ? parseInt(value) : defaultValue;
}

export let gameSpeed = getLocalStorageItem('gameSpeed', 3000);
export let isGameRunning = false;
export let isGamePaused = false;
export let resultNumbers = null;
export let transactionId = null;

export function initializeGameState() {
    gameSpeed = getLocalStorageItem('gameSpeed', 3000);
    isGameRunning = false;
    isGamePaused = false;
    resultNumbers = null;
    transactionId = null;
}

const gameStateKeys = {
    gameSpeed: (value) => gameSpeed = value,
    isGameRunning: (value) => isGameRunning = value,
    isGamePaused: (value) => isGamePaused = value,
    resultNumbers: (value) => resultNumbers = value,
    transactionId: (value) => transactionId = value
};

export function updateGameState(key, value) {
    if (gameStateKeys[key]) {
        gameStateKeys[key](value);
    } else {
        console.warn(`Invalid gameState key: ${key}`);
    }
}
