// js/main.js

import assetLoader from './assetLoader.js';
import { initializeInput } from './inputHandler.js';
import { setCurrentGameState, getCurrentGameState } from './gameStates.js';
import { GAME_STATE, GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import { initializeGame, startGameLoop, stopGameLoop, resetGame } from './gameLoop.js';
import uiManager from './uiManager.js';
import audioManager from './audioManager.js';

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
    // 1. Set initial game state to loading
    setCurrentGameState(GAME_STATE.LOADING);

    // 2. Initialize input handlers (for UI buttons as well)
    initializeInput();

    // 3. Initialize game core components (Car, Track, Camera, Physics, Rendering)
    // This part runs once after assets are loaded, when we switch to MAIN_MENU state.
    // It's called when 'Start Game' button is clicked for the first time or on reset.

    // Handle state transitions for game logic
    document.addEventListener('gameStateChange', (event) => {
        const newState = event.detail.newState;
        console.log(`main.js detected state change to: ${newState}`);

        switch (newState) {
            case GAME_STATE.MAIN_MENU:
                audioManager.playBackgroundMusic();
                stopGameLoop(); // Ensure game loop is stopped when in menu
                // Optionally reset game state here if returning from a race
                break;
            case GAME_STATE.IN_GAME:
                // Only reset if it's a fresh start, not just unpausing
                if (event.detail.oldState !== GAME_STATE.PAUSED) {
                    resetGame(); // Reset car positions, laps, etc.
                }
                startGameLoop(); // Start or resume the game loop
                audioManager.playBackgroundMusic(); // Ensure music plays
                break;
            case GAME_STATE.PAUSED:
                stopGameLoop(); // Pause the game loop
                audioManager.pauseBackgroundMusic();
                break;
            case GAME_STATE.LOADING:
                // Loading screen already active, assetLoader will handle transition
                break;
            case GAME_STATE.RACE_RESULTS:
            case GAME_STATE.GARAGE:
            case GAME_STATE.SETTINGS:
            case GAME_STATE.CONTROLS:
            case GAME_STATE.ABOUT:
                stopGameLoop(); // Ensure game loop is stopped for these UI screens
                audioManager.pauseBackgroundMusic(); // Pause music when on UI screens
                break;
            default:
                break;
        }
    });

    // 4. Load all game assets
    assetLoader.loadAllAssets().then(() => {
        console.log('Assets loaded, ready for main menu.');
        // Once assets are loaded, initialize game components
        initializeGame(gameCanvas);
        // And then transition to the main menu
        setCurrentGameState(GAME_STATE.MAIN_MENU);
    }).catch(error => {
        console.error('Initial asset loading failed:', error);
        uiManager.showMessagePopup(`Failed to load game. Please check your internet connection and try again. Error: ${error.message}`);
    });
}

// Start the initialization process when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
