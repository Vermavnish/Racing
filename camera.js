// js/camera.js

import { GAME_HEIGHT, CAMERA_HEIGHT, CAMERA_DEPTH, FIELD_OF_VIEW } from './constants.js';

class Camera {
    /**
     * @param {number} x - The camera's X position (side-to-side offset from track center).
     * @param {number} y - The camera's Y position (vertical offset, typically 0 for flat ground).
     * @param {number} z - The camera's Z position (distance along the track).
     * @param {number} playerX - The player's X position.
     * @param {number} playerY - The player's Y position.
     */
    constructor(x, y, z, playerX, playerY) {
        this.x = x; // Camera's X offset from the track center
        this.y = y; // Camera's Y position (height above ground)
        this.z = z; // Camera's Z position along the track (what's "under" the camera)
        this.playerX = playerX; // Player's X position in world coordinates
        this.playerY = playerY; // Player's Y position in world coordinates (not used much in 2D perspective)

        this.cameraHeight = CAMERA_HEIGHT; // How high the camera is above the ground
        this.cameraDepth = CAMERA_DEPTH; // Influences horizon level and perspective
        this.fieldOfView = FIELD_OF_VIEW; // Horizontal field of view (angle)
    }

    /**
     * Updates the camera's position based on the player's car.
     * In a racing game, the camera usually follows the player car's Z position.
     * The X position can be adjusted for subtle swaying or steering effects.
     * @param {Car} playerCar - The player's car object.
     * @param {number} trackLength - The total length of the track (in world units).
     */
    update(playerCar, trackLength) {
        // The camera's Z position is directly tied to the player car's Y position (since Y is depth in our 2D world)
        // We ensure it wraps around for continuous looping tracks.
        this.z = playerCar.y % trackLength;
        if (this.z < 0) {
            this.z += trackLength; // Handle negative modulo results
        }

        // Camera X can follow player car's X for subtle effects or stay fixed for a more "on rails" feel
        // For a simple setup, we'll keep cameraX tied to playerX for some side-to-side movement.
        this.x = playerCar.x; // Camera's horizontal position matches the car's for now
    }

    /**
     * Gets the current camera's X position.
     * @returns {number} The camera's X world coordinate.
     */
    getX() {
        return this.x;
    }

    /**
     * Gets the current camera's Z position.
     * @returns {number} The camera's Z world coordinate.
     */
    getZ() {
        return this.z;
    }

    /**
     * Gets the effective height of the camera (used in projection).
     * @returns {number} The camera height.
     */
    getHeight() {
        return this.cameraHeight;
    }

    /**
     * Gets the depth factor for the camera (used in projection for horizon).
     * @returns {number} The camera depth factor.
     */
    getDepth() {
        return this.cameraDepth;
    }

    /**
     * Gets the field of view angle.
     * @returns {number} The field of view in radians.
     */
    getFOV() {
        return this.fieldOfView;
    }
}

export { Camera };
