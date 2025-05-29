// js/assetLoader.js

import { ASSET_PATHS, GAME_STATE } from './constants.js';
import { setCurrentGameState } from './gameStates.js';

class AssetLoader {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.loadedAssetsCount = 0;
        this.totalAssets = 0;

        this.loadingProgressBar = document.getElementById('loading-progress-bar');
        this.loadingStatusText = document.getElementById('loading-status-text');
    }

    /**
     * Loads all assets defined in ASSET_PATHS.
     * @returns {Promise<void>} A promise that resolves when all assets are loaded.
     */
    async loadAllAssets() {
        this.totalAssets = Object.keys(ASSET_PATHS.images).length + Object.keys(ASSET_PATHS.sounds).length;
        this.updateLoadingStatus('Starting asset load...');

        const imagePromises = this._loadImages();
        const soundPromises = this._loadSounds();

        try {
            await Promise.all([...imagePromises, ...soundPromises]);
            this.updateLoadingStatus('All assets loaded!');
            // Transition to main menu after a brief delay
            setTimeout(() => {
                setCurrentGameState(GAME_STATE.MAIN_MENU);
            }, 500);
        } catch (error) {
            console.error('Failed to load assets:', error);
            this.updateLoadingStatus(`Error loading assets: ${error.message}. Please refresh.`);
            // Potentially show an error screen
        }
    }

    /**
     * Loads image assets.
     * @returns {Array<Promise<HTMLImageElement>>} An array of promises for image loading.
     * @private
     */
    _loadImages() {
        const promises = [];
        for (const key in ASSET_PATHS.images) {
            const path = ASSET_PATHS.images[key];
            this.updateLoadingStatus(`Loading image: ${key}...`);
            const promise = new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.images[key] = img;
                    this._assetLoaded();
                    resolve(img);
                };
                img.onerror = () => {
                    console.error(`Failed to load image: ${path}`);
                    reject(new Error(`Failed to load image: ${path}`));
                };
                img.src = path;
            });
            promises.push(promise);
        }
        return promises;
    }

    /**
     * Loads sound assets.
     * @returns {Array<Promise<HTMLAudioElement>>} An array of promises for sound loading.
     * @private
     */
    _loadSounds() {
        const promises = [];
        for (const key in ASSET_PATHS.sounds) {
            const path = ASSET_PATHS.sounds[key];
            this.updateLoadingStatus(`Loading sound: ${key}...`);
            const promise = new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.oncanplaythrough = () => { // Event fires when enough data is loaded to play without interruption
                    this.sounds[key] = audio;
                    this._assetLoaded();
                    resolve(audio);
                };
                audio.onerror = () => {
                    console.error(`Failed to load sound: ${path}`);
                    reject(new Error(`Failed to load sound: ${path}`));
                };
                audio.src = path;
                audio.load(); // Start loading the audio
            });
            promises.push(promise);
        }
        return promises;
    }

    /**
     * Increments the loaded asset count and updates the progress bar.
     * @private
     */
    _assetLoaded() {
        this.loadedAssetsCount++;
        const progress = (this.loadedAssetsCount / this.totalAssets) * 100;
        if (this.loadingProgressBar) {
            this.loadingProgressBar.style.width = `${progress}%`;
        }
        this.updateLoadingStatus(`Loading... (${this.loadedAssetsCount}/${this.totalAssets})`);
    }

    /**
     * Updates the loading status text on the screen.
     * @param {string} message - The message to display.
     */
    updateLoadingStatus(message) {
        if (this.loadingStatusText) {
            this.loadingStatusText.textContent = message;
        }
    }

    /**
     * Get a loaded image by its key.
     * @param {string} key - The key of the image (e.g., 'car1').
     * @returns {HTMLImageElement|undefined} The image element.
     */
    getImage(key) {
        return this.images[key];
    }

    /**
     * Get a loaded sound by its key.
     * @param {string} key - The key of the sound (e.g., 'engineIdle').
     * @returns {HTMLAudioElement|undefined} The audio element.
     */
    getSound(key) {
        return this.sounds[key];
    }
}

// Export a single instance to be used throughout the game
const assetLoader = new AssetLoader();
export default assetLoader;
