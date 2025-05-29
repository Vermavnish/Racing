// js/car.js

import {
    CAR_MAX_SPEED, CAR_ACCELERATION, CAR_DECELERATION, CAR_BRAKING_POWER,
    CAR_TURN_SPEED, CAR_FRICTION, CAR_REVERSE_SPEED_MULTIPLIER, ASSET_PATHS
} from './constants.js';
import assetLoader from './assetLoader.js'; // Import the asset loader

class Car {
    /**
     * @param {string} type - The type/key of the car (e.g., 'player', 'ai1').
     * @param {number} x - Initial X position.
     * @param {number} y - Initial Y position.
     * @param {number} angle - Initial rotation angle in radians.
     * @param {number} maxSpeed - Max speed for this specific car.
     * @param {string} imageKey - The key for the car image in assetLoader.
     * @param {boolean} isPlayer - True if this is the player's car.
     */
    constructor(type, x, y, angle, maxSpeed, imageKey, isPlayer = false) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.angle = angle; // Radians
        this.speed = 0;
        this.maxSpeed = maxSpeed || CAR_MAX_SPEED;
        this.acceleration = CAR_ACCELERATION;
        this.deceleration = CAR_DECELERATION;
        this.brakingPower = CAR_BRAKING_POWER;
        this.turnSpeed = CAR_TURN_SPEED;
        this.friction = CAR_FRICTION;
        this.isPlayer = isPlayer;

        this.image = assetLoader.getImage(imageKey);
        if (!this.image) {
            console.warn(`Car image not loaded for key: ${imageKey}. Using placeholder.`);
            // Create a small placeholder if image fails to load
            this.image = { width: 50, height: 100, src: '' };
        }
        this.width = this.image.width || 50; // Default if image dimensions not available
        this.height = this.image.height || 100;

        // Additional properties for game logic
        this.lap = 0;
        this.currentSegmentIndex = 0; // Current track segment the car is on
        this.distanceFromSegmentStart = 0; // Distance traveled along the current segment
        this.isAccelerating = false;
        this.isBraking = false;
        this.isTurningLeft = false;
        this.isTurningRight = false;
        this.isSkidding = false; // For visual/audio effects
    }

    /**
     * Updates the car's position and speed based on input/AI and physics.
     * @param {number} deltaTime - Time elapsed since the last update (in milliseconds).
     * @param {function} isKeyPressed - Function to check key press state (for player car).
     * @param {object} track - The current track object.
     */
    update(deltaTime, isKeyPressed, track) {
        const dtSeconds = deltaTime / 1000; // Convert to seconds for physics calculations

        if (this.isPlayer) {
            this.handlePlayerInput(dtSeconds, isKeyPressed);
        } else {
            this.handleAIInput(dtSeconds, track); // AI logic
        }

        // Apply acceleration/deceleration
        if (this.isAccelerating) {
            this.speed += this.acceleration * dtSeconds * 60; // Scale acceleration for smoother feel
        } else if (this.isBraking) {
            this.speed -= this.brakingPower * dtSeconds * 60;
        } else {
            this.speed *= (this.friction ** dtSeconds); // Apply friction
        }

        // Limit speed
        this.speed = Math.max(0, Math.min(this.speed, this.maxSpeed));
        if (this.speed < 0 && !this.isBraking) { // If reversing without brake
            this.speed = Math.max(-this.maxSpeed * CAR_REVERSE_SPEED_MULTIPLIER, this.speed);
        }

        // Apply turning
        if (this.speed > 0.1 || this.speed < -0.1) { // Only turn if moving
            if (this.isTurningLeft) {
                this.angle -= this.turnSpeed * dtSeconds * (this.speed / this.maxSpeed); // Turn slower at low speeds
            }
            if (this.isTurningRight) {
                this.angle += this.turnSpeed * dtSeconds * (this.speed / this.maxSpeed);
            }
            this.angle = this.angle % (2 * Math.PI); // Keep angle within 0 to 2*PI
        }

        // Update position
        this.x += Math.sin(this.angle) * this.speed * dtSeconds;
        this.y -= Math.cos(this.angle) * this.speed * dtSeconds; // Y-axis is inverted for canvas

        // Basic boundary check (e.g., prevent car from leaving track visually if not using full track physics)
        // More robust boundary/collision will be in physics.js
    }

    /**
     * Handles player input and sets acceleration/turning flags.
     * @param {number} dtSeconds - Delta time in seconds.
     * @param {function} isKeyPressed - Function to check key press state.
     */
    handlePlayerInput(dtSeconds, isKeyPressed) {
        this.isAccelerating = isKeyPressed('ArrowUp') || isKeyPressed('KeyW');
        this.isBraking = isKeyPressed('ArrowDown') || isKeyPressed('KeyS');
        this.isTurningLeft = isKeyPressed('ArrowLeft') || isKeyPressed('KeyA');
        this.isTurningRight = isKeyPressed('ArrowRight') || isKeyPressed('KeyD');

        // Simple skid detection (can be more complex)
        if (this.speed > 50 && (this.isTurningLeft || this.isTurningRight) && !this.isAccelerating && !this.isBraking) {
             this.isSkidding = true;
        } else {
            this.isSkidding = false;
        }

        // If both accelerate and brake are pressed, treat as brake
        if (this.isAccelerating && this.isBraking) {
            this.isAccelerating = false;
        }
    }

    /**
     * Handles AI car movement logic. (Very basic AI placeholder)
     * @param {number} dtSeconds - Delta time in seconds.
     * @param {object} track - The current track object.
     */
    handleAIInput(dtSeconds, track) {
        // This is a very simplistic AI: just tries to drive forward.
        // A real AI would need to know its position on the track,
        // follow waypoints, avoid other cars, consider track curves, etc.

        this.isAccelerating = true; // Always try to accelerate
        this.isBraking = false; // Never brake
        this.isTurningLeft = false;
        this.isTurningRight = false;

        // Make AI slightly slower than player to be fair
        this.maxSpeed = CAR_MAX_SPEED * 0.9;

        // Basic AI turning logic (needs proper track awareness)
        // For a simple demo, AI will just drive straight or randomly wobble
        // if (Math.random() > 0.99) { // Small chance to turn
        //     this.isTurningLeft = Math.random() > 0.5;
        //     this.isTurningRight = !this.isTurningLeft;
        // } else {
        //     this.isTurningLeft = false;
        //     this.isTurningRight = false;
        // }
    }

    /**
     * Draws the car on the canvas. This is a placeholder for `rendering.js`.
     * The actual drawing will be handled by the Rendering module.
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
     * @param {object} camera - The camera object, to determine view.
     */
    draw(ctx, camera) {
        if (!this.image) {
            console.warn("Car image not available for drawing.");
            return; // Don't draw if image isn't loaded
        }

        // This drawing function will be moved to rendering.js later,
        // but included here for a complete Car class idea.
        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y); // Translate to world coordinates relative to camera
        ctx.rotate(this.angle); // Rotate to car's angle
        ctx.drawImage(
            this.image,
            -this.width / 2, // Draw from center
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.restore();
    }
}

export { Car };
