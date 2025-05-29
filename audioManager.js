// js/audioManager.js

import { ASSET_PATHS } from './constants.js';
import assetLoader from './assetLoader.js'; // To get loaded audio elements

class AudioManager {
    constructor() {
        this.backgroundMusic = null;
        this.soundEffects = {};
        this.sfxVolume = 0.7; // Default sound effect volume
        this.musicVolume = 0.4; // Default music volume
        this.isMusicPlaying = false;
        this.isMuted = false;

        this._initializeAudioElements();
        console.log('Audio Manager initialized.');
    }

    /**
     * Initializes audio elements by retrieving them from the asset loader.
     * @private
     */
    _initializeAudioElements() {
        // Retrieve background music
        this.backgroundMusic = assetLoader.getSound('backgroundMusic');
        if (this.backgroundMusic) {
            this.backgroundMusic.loop = true; // Loop background music
            this.backgroundMusic.volume = this.musicVolume;
            this.backgroundMusic.autoplay = false; // Don't autoplay on load
        } else {
            console.warn('Background music not loaded.');
        }

        // Retrieve sound effects
        for (const key in ASSET_PATHS.sounds) {
            if (key !== 'backgroundMusic') { // Exclude background music from sfx
                this.soundEffects[key] = assetLoader.getSound(key);
                if (this.soundEffects[key]) {
                    this.soundEffects[key].volume = this.sfxVolume;
                } else {
                    console.warn(`Sound effect '${key}' not loaded.`);
                }
            }
        }
    }

    /**
     * Plays the background music.
     */
    playBackgroundMusic() {
        if (this.backgroundMusic && !this.isMusicPlaying && !this.isMuted) {
            this.backgroundMusic.play().catch(e => console.error("Failed to play background music:", e));
            this.isMusicPlaying = true;
        }
    }

    /**
     * Pauses the background music.
     */
    pauseBackgroundMusic() {
        if (this.backgroundMusic && this.isMusicPlaying) {
            this.backgroundMusic.pause();
            this.isMusicPlaying = false;
        }
    }

    /**
     * Plays a specific sound effect.
     * @param {string} soundKey - The key of the sound effect to play (e.g., 'buttonClick').
     * @param {number} [volume=this.sfxVolume] - Optional volume for this specific sound.
     */
    playSound(soundKey, volume = this.sfxVolume) {
        if (this.isMuted) return;

        const sound = this.soundEffects[soundKey];
        if (sound) {
            // Create a clone to allow multiple instances to play simultaneously
            const soundInstance = sound.cloneNode();
            soundInstance.volume = volume;
            soundInstance.play().catch(e => console.warn(`Failed to play sound '${soundKey}':`, e));
        } else {
            console.warn(`Sound effect '${soundKey}' not found.`);
        }
    }

    /**
     * Sets the volume for all sound effects.
     * @param {number} volume - A value between 0 and 1.
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        for (const key in this.soundEffects) {
            if (this.soundEffects[key]) {
                this.soundEffects[key].volume = this.sfxVolume;
            }
        }
    }

    /**
     * Sets the volume for background music.
     * @param {number} volume - A value between 0 and 1.
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }

    /**
     * Toggles mute state for all audio.
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.backgroundMusic) {
            this.backgroundMusic.muted = this.isMuted;
        }
        for (const key in this.soundEffects) {
            if (this.soundEffects[key]) {
                this.soundEffects[key].muted = this.isMuted;
            }
        }
        console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}.`);
    }

    /**
     * Checks if audio is currently muted.
     * @returns {boolean} True if muted, false otherwise.
     */
    isAudioMuted() {
        return this.isMuted;
    }
}

// Export a single instance to be used throughout the game
const audioManager = new AudioManager();
export default audioManager;
