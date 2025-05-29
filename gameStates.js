// js/gameStates.js

import { GAME_STATE } from './constants.js';

let currentGameState = GAME_STATE.LOADING; // Initial state is loading

/**
 * Sets the current game state and updates the UI accordingly.
 * @param {string} newState - The new state to set (from GAME_STATE enum).
 */
function setCurrentGameState(newState) {
    if (currentGameState === newState) {
        return; // No change needed
    }

    // Hide all screens first
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(screen => {
        screen.classList.remove('active-screen');
        screen.style.pointerEvents = 'none'; // Disable interaction
    });

    // Handle game-specific pauses/resumes
    if (newState === GAME_STATE.IN_GAME && currentGameState === GAME_STATE.PAUSED) {
        // Just unpause, no need to hide/show game screen
        document.getElementById('pause-menu').classList.remove('active');
        console.log(`Transitioning from ${currentGameState} to ${newState}`);
        currentGameState = newState;
        return;
    }
    if (newState === GAME_STATE.PAUSED && currentGameState === GAME_STATE.IN_GAME) {
        // Pause game, show pause menu
        document.getElementById('pause-menu').classList.add('active');
        console.log(`Transitioning from ${currentGameState} to ${newState}`);
        currentGameState = newState;
        return;
    }

    // Show the new active screen
    let targetScreenId;
    switch (newState) {
        case GAME_STATE.LOADING:
            targetScreenId = 'loading-screen';
            break;
        case GAME_STATE.MAIN_MENU:
            targetScreenId = 'main-menu-screen';
            break;
        case GAME_STATE.GARAGE:
            targetScreenId = 'garage-screen';
            break;
        case GAME_STATE.SETTINGS:
            targetScreenId = 'settings-screen';
            break;
        case GAME_STATE.CONTROLS:
            targetScreenId = 'controls-screen';
            break;
        case GAME_STATE.ABOUT:
            targetScreenId = 'about-screen';
            break;
        case GAME_STATE.IN_GAME:
            targetScreenId = 'game-screen';
            break;
        case GAME_STATE.RACE_RESULTS:
            targetScreenId = 'race-results-screen';
            break;
        default:
            console.warn(`Attempted to set unknown game state: ${newState}`);
            return;
    }

    const targetScreen = document.getElementById(targetScreenId);
    if (targetScreen) {
        targetScreen.classList.add('active-screen');
        targetScreen.style.pointerEvents = 'all'; // Enable interaction
    } else {
        console.error(`Could not find screen for state: ${newState} (ID: ${targetScreenId})`);
    }

    console.log(`Game state changed from ${currentGameState} to ${newState}`);
    currentGameState = newState;
}

/**
 * Gets the current game state.
 * @returns {string} The current game state.
 */
function getCurrentGameState() {
    return currentGameState;
}

export {
    setCurrentGameState,
    getCurrentGameState
};
