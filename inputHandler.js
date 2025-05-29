// js/inputHandler.js

import { getCurrentGameState, setCurrentGameState } from './gameStates.js';
import { GAME_STATE } from './constants.js';

const pressedKeys = {}; // Stores the state of currently pressed keys

/**
 * Initializes the input handler by setting up event listeners for key presses and releases.
 */
function initializeInput() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    console.log('Input handler initialized.');

    // Add event listeners for UI buttons (moved here for simplicity, ideally in uiManager)
    document.getElementById('startGameButton').addEventListener('click', () => {
        setCurrentGameState(GAME_STATE.IN_GAME);
        // Additional setup needed for game start (e.g., reset car, track)
    });
    document.getElementById('settingsButton').addEventListener('click', () => setCurrentGameState(GAME_STATE.SETTINGS));
    document.getElementById('controlsButton').addEventListener('click', () => setCurrentGameState(GAME_STATE.CONTROLS));
    document.getElementById('aboutButton').addEventListener('click', () => setCurrentGameState(GAME_STATE.ABOUT));
    document.getElementById('garageButton').addEventListener('click', () => setCurrentGameState(GAME_STATE.GARAGE));

    // Back buttons
    document.getElementById('backToMainMenuFromSettings').addEventListener('click', () => setCurrentGameState(GAME_STATE.MAIN_MENU));
    document.getElementById('backToMainMenuFromControls').addEventListener('click', () => setCurrentGameState(GAME_STATE.MAIN_MENU));
    document.getElementById('backToMainMenuFromAbout').addEventListener('click', () => setCurrentGameState(GAME_STATE.MAIN_MENU));
    document.getElementById('backToMainMenuFromGarage').addEventListener('click', () => setCurrentGameState(GAME_STATE.MAIN_MENU));
    document.getElementById('backToMainMenuFromResults').addEventListener('click', () => setCurrentGameState(GAME_STATE.MAIN_MENU));

    // Pause menu buttons
    document.getElementById('resumeGameButton').addEventListener('click', () => setCurrentGameState(GAME_STATE.IN_GAME));
    document.getElementById('restartRaceButton').addEventListener('click', () => {
        // This will require resetting game state fully
        setCurrentGameState(GAME_STATE.IN_GAME); // For now, just resume
    });
    document.getElementById('quitToMenuButton').addEventListener('click', () => setCurrentGameState(GAME_STATE.MAIN_MENU));

    // Garage actions
    document.getElementById('prevCarButton').addEventListener('click', () => {
        // Logic to cycle through cars (will be in car.js or uiManager.js)
        console.log('Previous car clicked');
    });
    document.getElementById('nextCarButton').addEventListener('click', () => {
        // Logic to cycle through cars
        console.log('Next car clicked');
    });
    document.getElementById('selectCarButton').addEventListener('click', () => {
        console.log('Car selected!');
        // Trigger car selection logic
    });

    // Settings actions
    document.getElementById('saveSettingsButton').addEventListener('click', () => {
        console.log('Settings saved!');
        // Logic to save settings (will be in uiManager.js or settingsManager.js)
        alert('Settings saved!'); // Placeholder
    });

    // Popup close button
    document.getElementById('closePopupButton').addEventListener('click', () => {
        const popup = document.getElementById('message-popup');
        if (popup) popup.classList.remove('active');
    });

    // Example of a game over button
    document.getElementById('playAgainButton').addEventListener('click', () => {
        setCurrentGameState(GAME_STATE.IN_GAME);
        // Need to trigger a full game reset here
    });
}

/**
 * Handles the keydown event.
 * @param {KeyboardEvent} event - The keyboard event object.
 */
function handleKeyDown(event) {
    pressedKeys[event.code] = true; // Set key status to true when pressed

    // Handle game-state specific key presses
    if (getCurrentGameState() === GAME_STATE.IN_GAME) {
        if (event.code === 'Escape' || event.code === 'KeyP') {
            setCurrentGameState(GAME_STATE.PAUSED);
        }
    } else if (getCurrentGameState() === GAME_STATE.PAUSED) {
        if (event.code === 'Escape' || event.code === 'KeyP') {
            setCurrentGameState(GAME_STATE.IN_GAME);
        }
    }
}

/**
 * Handles the keyup event.
 * @param {KeyboardEvent} event - The keyboard event object.
 */
function handleKeyUp(event) {
    pressedKeys[event.code] = false; // Set key status to false when released
}

/**
 * Checks if a specific key is currently pressed.
 * @param {string} keyCode - The `event.code` of the key (e.g., 'ArrowUp', 'KeyW').
 * @returns {boolean} True if the key is pressed, false otherwise.
 */
function isKeyPressed(keyCode) {
    return pressedKeys[keyCode];
}

export {
    initializeInput,
    isKeyPressed
};
