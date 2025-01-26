// gameLogic.js
import { saveGameState } from './gameState.js';
import { playAudio, playSpecialAudio } from './audio.js';
import { animateNumber, updateBingoCircleText } from './ui.js';

export function startBingo(gameState) {
    if (!gameState.isGameRunning && gameState.cartellaState.selected.length > 0) {
        gameState.isGameRunning = true;
        gameState.lockedCartella = [];
        $("#startGame").prop("disabled", true);
        $("#pauseGame").prop("disabled", false);
        $("#resetGame").prop("disabled", false);
        $("#selectCartella").prop("disabled", true);
        $('#refundGame').addClass("d-none");

        // Send request to start the game
        const cartellas = gameState.cartellaState.selected;
        const betAmount = gameState.cartellaState.betAmount;

        gameState.currentNumberIndex = 0;
        gameState.resultIndex = 0;
        gameState.totalCalls = 0;
        gameState.previousCall = 0;
        gameState.transactionId = 0;

        saveGameState(gameState);
        playSpecialAudio("readyPlay.mp3");

        setTimeout(() => playGame(gameState), 3000);
    }
}

export function playGame(gameState) {
    gameState.gameInterval = setInterval(function () {
        if (gameState.resultIndex < gameState.resultNumbers.length) {
            const number = gameState.resultNumbers[gameState.resultIndex];
            saveGameState(gameState);
            playAudio(number);
            animateNumber(number);
            updateBingoCircleText(number);
            gameState.resultIndex++;
            gameState.totalCalls++;

            saveGameState(gameState);
            setTimeout(() => addNumber(number), 1000);
        } else {
            resetGame(gameState);
        }
    }, gameState.gameSpeed);
}

export function pauseGame(gameState) {
    if (gameState.isGameRunning && !gameState.isGamePaused) {
        clearInterval(gameState.gameInterval);
        gameState.isGamePaused = true;
        pauseIconToggle();
    }
}

export function togglePauseGame(gameState) {
    if (gameState.isGameRunning && !gameState.isGamePaused) {
        pauseGame(gameState);
    } else if (gameState.isGamePaused) {
        gameState.isGamePaused = false;
        playGame(gameState);
        pauseIconToggle();
    }
}

export function resetGame(gameState) {
    clearInterval(gameState.gameInterval);
    gameState.isGameRunning = false;
    gameState.isGamePaused = false;
    updateGameUIAfterReset();
    saveGameState(gameState);
}