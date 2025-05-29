// js/main.js

// import assetLoader from './assetLoader.js'; // Removed assetLoader import
import { initializeInput } from './inputHandler.js';
import { setCurrentGameState, getCurrentGameState } from './gameStates.js';
import { GAME_STATE, GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import { initializeGame, startGameLoop, stopGameLoop, resetGame } from './gameLoop.js';
import uiManager from './uiManager.js';
// import audioManager from './audioManager.js'; // Removed audioManager import

// Get the main canvas element
const gameCanvas = document.getElementById('gameCanvas');
if (gameCanvas) {
    gameCanvas.width = GAME_WIDTH;
    gameCanvas.height = GAME_HEIGHT;
} else {
    console.error('Game canvas element not found!');
}

/**
 * Initializes the game and sets up event listeners for state changes.
 */
function init() {
    // 1. Set initial game state (no loading screen needed if no assets)
    setCurrentGameState(GAME_STATE.MAIN_MENU); // Directly go to Main Menu

    // 2. Initialize input handlers (for UI buttons as well)
    initializeInput();

    // 3. Initialize game core components (Car, Track, Camera, Physics, Rendering)
    // This part runs once when the game starts.
    initializeGame(gameCanvas);


    // Handle state transitions for game logic
    document.addEventListener('gameStateChange', (event) => {
        const newState = event.detail.newState;
        console.log(`main.js detected state change to: ${newState}`);

        switch (newState) {
            case GAME_STATE.MAIN_MENU:
                // audioManager.playBackgroundMusic(); // Removed audioManager call
                stopGameLoop(); // Ensure game loop is stopped when in menu
                break;
            case GAME_STATE.IN_GAME:
                // Only reset if it's a fresh start, not just unpausing
                if (event.detail.oldState !== GAME_STATE.PAUSED) {
                    resetGame(); // Reset car positions, laps, etc.
                }
                startGameLoop(); // Start or resume the game loop
                // audioManager.playBackgroundMusic(); // Removed audioManager call
                break;
            case GAME_STATE.PAUSED:
                stopGameLoop(); // Pause the game loop
                // audioManager.pauseBackgroundMusic(); // Removed audioManager call
                break;
            case GAME_STATE.LOADING:
                // This state is effectively skipped now, but remains for structure.
                setCurrentGameState(GAME_STATE.MAIN_MENU); // Immediately move to Main Menu
                break;
            case GAME_STATE.RACE_RESULTS:
            case GAME_STATE.GARAGE:
            case GAME_STATE.SETTINGS:
            case GAME_STATE.CONTROLS:
            case GAME_STATE.ABOUT:
                stopGameLoop(); // Ensure game loop is stopped for these UI screens
                // audioManager.pauseBackgroundMusic(); // Removed audioManager call
                break;
            default:
                break;
        }
    });

    // 4. Asset loading logic removed.
    // Since no assets, game starts directly to main menu.
    uiManager.showMessagePopup("Game Loaded! (No external assets)"); // Optional: show a message
}

// Start the initialization process when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
