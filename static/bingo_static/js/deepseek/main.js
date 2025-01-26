// main.js
import { initializeGameState } from './gameState.js';
import { attachEventHandlers } from './eventHandlers.js';
import { toggleFullscreen } from './fullscreenModal.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeGameState();
    attachEventHandlers();
    toggleFullscreen();
});
{/* <script type="module" src="main.js"></script> */}