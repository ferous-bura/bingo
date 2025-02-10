
// eventHandlers.js
import { updateGameState, initializeGameState } from './gameState.js';
import { updateBingoCircleText, updateGameUIAfterReset } from './uiUpdates.js';
import { playAudio, playSpecialAudio } from './audioManager.js';

export function attachEventHandlers() {
    document.getElementById('startGame').addEventListener('click', () => {
        updateGameState('isGameRunning', true);
        playSpecialAudio("start_game.mp3");
    });

    document.getElementById('pauseGame').addEventListener('click', () => {
        updateGameState('isGamePaused', !isGamePaused);
        const status = isGamePaused ? "paused" : "resumed";
        console.log(`Game is now ${status}`);
    });

    document.getElementById('resetGame').addEventListener('click', () => {
        initializeGameState();
        updateGameUIAfterReset();
        console.log("Game has been reset.");
    });
}
