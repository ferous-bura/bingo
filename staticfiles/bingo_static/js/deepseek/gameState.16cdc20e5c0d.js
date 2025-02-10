// gameState.js
export function initializeGameState() {
    const gameState = {
        gameSpeed: parseInt(localStorage.getItem('gameSpeed'), 10) || 5000,
        isGameRunning: false,
        isGamePaused: false,
        refund: localStorage.getItem('refund') === 'true',
        transactionId: localStorage.getItem('transactionId') || null,
        resultIndex: parseInt(localStorage.getItem('resultIndex'), 10) || 0,
        balance: parseInt(localStorage.getItem('balance'), 10) || 0,
        resultNumbers: JSON.parse(localStorage.getItem('resultNumbers')) || null,
        voiceChoice: localStorage.getItem('voiceChoice') || 'female',
        totalCalls: parseInt(localStorage.getItem('totalCalls'), 10) || 0,
        previousCall: parseInt(localStorage.getItem('previousCall'), 10) || 0,
        gamePattern: localStorage.getItem('gamePattern') || 'default'
    };

    return gameState;
}

export function saveGameState(gameState) {
    localStorage.setItem('gameSpeed', gameState.gameSpeed);
    localStorage.setItem('refund', gameState.refund.toString());
    localStorage.setItem('transactionId', gameState.transactionId);
    localStorage.setItem('resultIndex', gameState.resultIndex);
    localStorage.setItem('balance', gameState.balance);
    localStorage.setItem('resultNumbers', JSON.stringify(gameState.resultNumbers));
    localStorage.setItem('voiceChoice', gameState.voiceChoice);
    localStorage.setItem('totalCalls', gameState.totalCalls);
    localStorage.setItem('previousCall', gameState.previousCall);
    localStorage.setItem('gamePattern', gameState.gamePattern);
}