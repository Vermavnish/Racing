// js/gameLoop.js

import { getCurrentGameState, setCurrentGameState } from './gameStates.js';
import { GAME_STATE, UI_UPDATE_INTERVAL, TOTAL_LAPS, ROAD_SEGMENTS, SEGMENT_LENGTH } from './constants.js';
import { Car } from './car.js';
import { Track } from './track.js';
import { Camera } from './camera.js';
import { Physics } from './physics.js';
import { Rendering } from './rendering.js';
import { isKeyPressed } from './inputHandler.js';
import uiManager from './uiManager.js';
import audioManager from './audioManager.js';
import assetLoader from './assetLoader.js'; // To get car images for AI

let canvas;
let ctx;
let playerCar;
let aiCars = [];
let track;
let camera;
let physics;
let rendering;

let lastTime = 0; // For delta time calculation
let animationFrameId = null; // To control the requestAnimationFrame
let gameStartTime = 0;
let currentRaceTime = 0;
let playerLapTimes = [];
let lastUITimeUpdate = 0;

/**
 * Initializes all game components.
 * @param {HTMLCanvasElement} mainCanvas - The main game canvas element.
 */
function initializeGame(mainCanvas) {
    canvas = mainCanvas;
    ctx = canvas.getContext('2d');

    // Create game instances
    playerCar = new Car('player', 0, 0, 0, null, 'car1', true); // Initial position, angle, etc.
    track = new Track();
    camera = new Camera(0, 0, 0, playerCar.x, playerCar.y); // Initial camera position
    physics = new Physics();
    rendering = new Rendering(canvas);

    // Create AI cars (Example: 2 AI cars)
    aiCars.push(new Car('ai1', 100, -200, 0, null, 'car2', false));
    aiCars.push(new Car('ai2', -100, -400, 0, null, 'car1', false));

    // Combine player and AI cars for physics and rendering
    const allCars = [playerCar, ...aiCars];

    // Initial UI setup
    uiManager.setTotalLaps(TOTAL_LAPS);
    uiManager.updateInGameUI(playerCar, 0, allCars);

    console.log('Game components initialized.');
}

/**
 * Resets the game state for a new race.
 */
function resetGame() {
    playerCar.x = 0;
    playerCar.y = 0;
    playerCar.angle = 0;
    playerCar.speed = 0;
    playerCar.lap = 0;
    playerCar.currentSegmentIndex = 0;
    playerCar.distanceFromSegmentStart = 0;
    playerLapTimes = [];
    currentRaceTime = 0;
    gameStartTime = 0;

    // Reset AI cars
    aiCars[0].x = 100; aiCars[0].y = -200; aiCars[0].speed = 0; aiCars[0].lap = 0;
    aiCars[1].x = -100; aiCars[1].y = -400; aiCars[1].speed = 0; aiCars[1].lap = 0;

    // Reset UI
    document.getElementById('lapTimesList').innerHTML = ''; // Clear in-game lap times
    uiManager.updateInGameUI(playerCar, 0, [playerCar, ...aiCars]);
    console.log('Game state reset.');
}

/**
 * The main game loop function.
 * @param {DOMHighResTimeStamp} currentTime - The current time provided by requestAnimationFrame.
 */
function gameLoop(currentTime) {
    animationFrameId = requestAnimationFrame(gameLoop);

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Only update and render if in IN_GAME state
    if (getCurrentGameState() === GAME_STATE.IN_GAME) {
        // Update game time
        if (gameStartTime === 0) {
            gameStartTime = currentTime; // Start timer on first active frame
        }
        currentRaceTime = currentTime - gameStartTime;

        // Update all cars
        const allCars = [playerCar, ...aiCars];
        allCars.forEach(car => {
            car.update(deltaTime, isKeyPressed, track); // Pass input handler for player car
            // If it's an AI car, handleAIInput is called internally
        });

        // Update camera position to follow player car
        camera.update(playerCar, track.totalLength);

        // Run physics calculations
        physics.update(allCars, track, deltaTime);

        // Check for lap completion (very basic)
        _checkLapCompletion(playerCar, track);


        // Update UI at a fixed interval
        if (currentTime - lastUITimeUpdate > UI_UPDATE_INTERVAL) {
            uiManager.updateInGameUI(playerCar, currentRaceTime, allCars);
            lastUITimeUpdate = currentTime;
        }

        // Render the scene
        rendering.render(track, camera, allCars, playerCar);

        // Manage audio based on player car speed
        if (playerCar.isAccelerating && playerCar.speed > 10) {
            audioManager.playSound('engineAccelerate', Math.min(1, playerCar.speed / playerCar.maxSpeed));
            audioManager.pauseSound('engineIdle'); // No direct pause, but won't loop
        } else if (playerCar.speed > 5) {
             audioManager.playSound('engineIdle', Math.min(0.5, playerCar.speed / playerCar.maxSpeed / 2));
        } else {
            // Stop engine sounds if car is stationary
        }
        if (playerCar.isSkidding) {
            audioManager.playSound('skid', 0.8);
        }

        // Check for game end condition (e.g., player completes all laps)
        if (playerCar.lap >= TOTAL_LAPS + 1) { // +1 because we check for final lap cross
            endRace(playerCar);
        }

    } else {
        // If not in IN_GAME state, only render the current screen (no game logic update)
        // You might want to render a static background for menus etc.
        // For now, HTML screens overlay the canvas.
    }
}

/**
 * Starts the game loop.
 */
function startGameLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // Clear any existing loop
    }
    lastTime = performance.now(); // Reset lastTime for accurate delta
    animationFrameId = requestAnimationFrame(gameLoop);
    console.log('Game loop started.');
}

/**
 * Stops the game loop.
 */
function stopGameLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    console.log('Game loop stopped.');
}

/**
 * Checks if the player car has completed a lap. (Simplified logic)
 * @param {Car} car - The car to check.
 * @param {Track} track - The track object.
 * @private
 */
function _checkLapCompletion(car, track) {
    // A simple lap check: if car passes the start line (segment 0) and it's not the first time
    // and it has covered a sufficient distance since the last lap cross.
    const currentZ = car.y; // Car's Z-position on the track
    const startLineZ = track.segments[0].p1.z; // Z of the start line

    // Detect if car crosses the finish line (Z = 0) from near the end of the track
    // This is a very rough check and needs refinement for precise lap detection.
    // For a real game, you'd track car's progress through checkpoints.
    if (car.currentSegmentIndex === 0 && car.y < SEGMENT_LENGTH * 0.5 && car.lap < TOTAL_LAPS) {
        // Prevent multiple lap increments for a single pass
        // This requires tracking a 'last_lap_cross_z' or 'has_crossed_checkpoint' flag
        if (car.lastCrossedZ === undefined || car.lastCrossedZ > (track.totalLength - SEGMENT_LENGTH * 2)) { // If coming from the end
            car.lap++;
            const lapTime = currentRaceTime - (playerLapTimes.reduce((sum, time) => sum + time, 0)); // Calculate current lap time
            playerLapTimes.push(lapTime);
            uiManager.addLapTime(car.lap, lapTime);
            console.log(`Player completed Lap ${car.lap}! Time: ${uiManager._formatTime(lapTime)}`);

            if (car.lap >= TOTAL_LAPS) {
                // This is the trigger to end the race after the final lap
                endRace(car);
            }
        }
    }
    car.lastCrossedZ = currentZ; // Update for next check

    // Update current segment index for car
    car.currentSegmentIndex = Math.floor(car.y / SEGMENT_LENGTH) % track.segments.length;
    if (car.currentSegmentIndex < 0) car.currentSegmentIndex += track.segments.length; // Handle negative
}


/**
 * Ends the race and displays results.
 * @param {Car} playerCar - The player's car.
 */
function endRace(playerCar) {
    stopGameLoop();
    audioManager.pauseBackgroundMusic();
    const finalRank = 1; // Simplistic: assume player is 1st for now
    const raceResultText = playerCar.lap >= TOTAL_LAPS ? "You Finished!" : "Race Over!";
    uiManager.displayRaceResults(raceResultText, currentRaceTime, finalRank, playerLapTimes);
    console.log('Race Ended!');
}


export {
    initializeGame,
    startGameLoop,
    stopGameLoop,
    resetGame // For restarting the game
};
