// js/uiManager.js

import { UI_UPDATE_INTERVAL, TOTAL_LAPS } from './constants.js';
import { getCurrentGameState, setCurrentGameState } from './gameStates.js';
import { GAME_STATE } from './constants.js';
// import audioManager from './audioManager.js'; // Removed audioManager import

class UIManager {
    constructor() {
        this.speedometerValue = document.getElementById('currentSpeedValue');
        this.lapCounterValue = document.getElementById('currentLapValue');
        this.totalLapsValue = document.getElementById('totalLapsValue');
        this.gameTimerValue = document.getElementById('gameTimerValue');
        this.playerRankValue = document.getElementById('playerRankValue');
        this.totalRacersValue = document.getElementById('totalRacersValue');
        this.lapTimesList = document.getElementById('lapTimesList');
        this.finalLapTimesList = document.getElementById('finalLapTimesList'); // For results screen
        this.resultsTitle = document.getElementById('resultsTitle');
        this.finalPosition = document.getElementById('finalPosition');
        this.finalTime = document.getElementById('finalTime');

        // Settings screen elements
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeValueDisplay = document.getElementById('volumeValue');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.graphicsQualitySelect = document.getElementById('graphicsQuality');
        this.toggleMusicCheckbox = document.getElementById('toggleMusic'); // This checkbox will now do nothing

        // Garage elements
        this.selectedCarImage = document.getElementById('selectedCarImage');
        this.selectedCarName = document.getElementById('selectedCarName');
        this.carTopSpeed = document.getElementById('carTopSpeed');
        this.carAcceleration = document.getElementById('carAcceleration');
        this.carHandling = document.getElementById('carHandling');
        this.cars = [ // Example car data (just for display purposes in garage)
            { name: 'Red Racer', color: 'red', topSpeed: '200 MPH', acceleration: '3.5s (0-60)', handling: 'Excellent' },
            { name: 'Blue Cruiser', color: 'blue', topSpeed: '180 MPH', acceleration: '4.2s (0-60)', handling: 'Very Good' },
            { name: 'Green Monster', color: 'green', topSpeed: '150 MPH', acceleration: '5.0s (0-60)', handling: 'Good' }
        ];
        this.currentCarIndex = 0;


        this._setupEventListeners();
        this._updateSettingsUI(); // Populate settings from initial state
        this._updateGarageUI(); // Initialize garage display
        this.setTotalLaps(TOTAL_LAPS);
        console.log('UI Manager initialized.');
    }

    /**
     * Sets up event listeners for UI elements.
     * @private
     */
    _setupEventListeners() {
        // Volume slider and toggleMusicCheckbox now have no effect as audioManager is removed
        this.volumeSlider.addEventListener('input', (event) => { /* console.log('Volume slider moved:', event.target.value); */ });
        this.toggleMusicCheckbox.addEventListener('change', (event) => { /* console.log('Music toggle changed:', event.target.checked); */ });
        
        this.difficultySelect.addEventListener('change', (event) => console.log('Difficulty changed to:', event.target.value));
        this.graphicsQualitySelect.addEventListener('change', (event) => console.log('Graphics Quality changed to:', event.target.value));

        // Garage navigation
        document.getElementById('prevCarButton').addEventListener('click', () => this.navigateCar(-1));
        document.getElementById('nextCarButton').addEventListener('click', () => this.navigateCar(1));
        document.getElementById('selectCarButton').addEventListener('click', () => this.selectCar());

        // Global click listener for button click sounds removed as audioManager is removed
    }

    /**
     * Volume change handler (now does nothing as no audio manager)
     * @param {Event} event - The input event from the slider.
     * @private
     */
    _handleVolumeChange(event) {
        // Removed audioManager calls
    }

    /**
     * Music toggle handler (now does nothing as no audio manager)
     * @param {Event} event - The change event from the checkbox.
     * @private
     */
    _handleMusicToggle(event) {
        // Removed audioManager calls
    }

    /**
     * Populates settings UI with current values (or defaults).
     * @private
     */
    _updateSettingsUI() {
        // Values will be default, no interaction with audioManager
        this.volumeSlider.value = 70; // Default value
        this.volumeValueDisplay.textContent = `70%`;
        this.toggleMusicCheckbox.checked = false; // Default to off as no music
    }

    /**
     * Navigates through cars in the garage.
     * @param {number} direction - -1 for previous, 1 for next.
     */
    navigateCar(direction) {
        this.currentCarIndex = (this.currentCarIndex + direction + this.cars.length) % this.cars.length;
        this._updateGarageUI();
    }

    /**
     * Updates the garage UI to show the currently selected car.
     * Image display will be removed or replaced with a placeholder.
     * @private
     */
    _updateGarageUI() {
        const car = this.cars[this.currentCarIndex];
        if (car) {
            // Remove image display logic
            if (this.selectedCarImage) {
                this.selectedCarImage.style.backgroundColor = car.color; // Show color
                this.selectedCarImage.style.border = '2px solid white';
                this.selectedCarImage.style.width = '100px';
                this.selectedCarImage.style.height = '150px';
                this.selectedCarImage.src = ''; // No image source
                this.selectedCarImage.alt = `A ${car.color} car`;
            }
            
            this.selectedCarName.textContent = car.name;
            this.carTopSpeed.textContent = car.topSpeed;
            this.carAcceleration.textContent = car.acceleration;
            this.carHandling.textContent = car.handling;
        }
    }

    /**
     * Placeholder for car selection logic.
     */
    selectCar() {
        const selectedCar = this.cars[this.currentCarIndex];
        console.log(`Selected car: ${selectedCar.name}`);
        // In a real game, you would set the player's car model based on this selection.
        setCurrentGameState(GAME_STATE.MAIN_MENU); // Go back to menu after selection
    }


    /**
     * Updates in-game UI elements.
     * @param {Car} playerCar - The player's car object.
     * @param {number} gameTime - Current game time in milliseconds.
     * @param {Array<Car>} allCars - Array of all car objects for ranking.
     */
    updateInGameUI(playerCar, gameTime, allCars) {
        if (getCurrentGameState() !== GAME_STATE.IN_GAME) return;

        this.speedometerValue.textContent = Math.floor(playerCar.speed).toString();
        this.lapCounterValue.textContent = playerCar.lap.toString();
        this.gameTimerValue.textContent = this._formatTime(gameTime);

        // Update player rank (very basic for now, needs proper sorting based on track progress)
        const sortedCars = [...allCars].sort((a, b) => b.y - a.y); // Sort by Z (Y in our case)
        const playerRank = sortedCars.findIndex(car => car === playerCar) + 1;
        this.playerRankValue.textContent = playerRank.toString();
        this.totalRacersValue.textContent = allCars.length.toString();
    }

    /**
     * Adds a new lap time to the in-game display.
     * @param {number} lapNumber - The lap number.
     * @param {number} lapTimeMs - The lap time in milliseconds.
     */
    addLapTime(lapNumber, lapTimeMs) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `Lap ${lapNumber}: <span>${this._formatTime(lapTimeMs)}</span>`;
        this.lapTimesList.appendChild(listItem);
        this.lapTimesList.scrollTop = this.lapTimesList.scrollHeight; // Scroll to bottom
    }

    /**
     * Sets the total number of laps displayed.
     * @param {number} total - The total number of laps for the race.
     */
    setTotalLaps(total) {
        this.totalLapsValue.textContent = total.toString();
    }

    /**
     * Displays race results on the results screen.
     * @param {string} resultText - "You Won!" or "You Lost!"
     * @param {number} finalTotalTime - Total time for the race in milliseconds.
     * @param {number} finalPlayerRank - Player's final rank.
     * @param {Array<number>} allLapTimes - Array of all lap times in milliseconds.
     */
    displayRaceResults(resultText, finalTotalTime, finalPlayerRank, allLapTimes) {
        this.resultsTitle.textContent = resultText;
        this.finalPosition.textContent = `${finalPlayerRank}${this._getOrdinalSuffix(finalPlayerRank)}`;
        this.finalTime.textContent = this._formatTime(finalTotalTime);

        this.finalLapTimesList.innerHTML = ''; // Clear previous times
        allLapTimes.forEach((time, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `Lap ${index + 1}: <span>${this._formatTime(time)}</span>`;
            this.finalLapTimesList.appendChild(listItem);
        });

        setCurrentGameState(GAME_STATE.RACE_RESULTS);
    }

    /**
     * Formats milliseconds into a "MM:SS.ms" string.
     * @param {number} ms - Time in milliseconds.
     * @returns {string} Formatted time string.
     * @private
     */
    _formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10); // Get two digits for ms

        const pad = (num, size = 2) => String(num).padStart(size, '0');

        return `${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 2)}`;
    }

    /**
     * Returns the ordinal suffix for a number (e.g., 1st, 2nd, 3rd).
     * @param {number} n - The number.
     * @returns {string} The ordinal suffix.
     * @private
     */
    _getOrdinalSuffix(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }

    /**
     * Displays a general message popup.
     * @param {string} message - The message to display.
     */
    showMessagePopup(message) {
        const popup = document.getElementById('message-popup');
        const popupText = document.getElementById('popup-text');
        if (popup && popupText) {
            popupText.textContent = message;
            popup.classList.add('active');
        }
    }
}

// Export a single instance
const uiManager = new UIManager();
export default uiManager;
