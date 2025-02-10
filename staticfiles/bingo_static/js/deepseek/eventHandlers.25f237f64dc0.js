// eventHandlers.js
import { initializeGameState, saveGameState } from './gameState.js';
import { startBingo, pauseGame, resetGame, togglePauseGame } from './gameLogic.js';

export function attachEventHandlers() {
    const gameState = initializeGameState();

    $("#startGame").on("click", function () {
        startBingo(gameState);
    });

    $("#pauseGame").on("click", function () {
        togglePauseGame(gameState);
    });

    $("#resetGame").on("click", function () {
        resetGame(gameState);
    });

    $("#gamePattern").on("change", function () {
        gameState.gamePattern = $(this).val();
        saveGameState(gameState);
    });

    // Add more event handlers as needed
}