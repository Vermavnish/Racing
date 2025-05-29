// js/car.js

import {
    CAR_MAX_SPEED,
    CAR_ACCELERATION,
    CAR_DECELERATION,
    CAR_BRAKING_POWER,
    CAR_FRICTION,
    CAR_TURN_SPEED,
    CAR_REVERSE_SPEED_MULTIPLIER,
    SEGMENT_LENGTH,
    TRACK_WIDTH
} from './constants.js';

class Car {
    /**
     * @param {string} type - 'player' or 'ai'.
     * @param {number} x - Initial X position (horizontal offset from track center).
     * @param {number} y - Initial Y position (depth along the track).
     * @param {number} angle - Initial angle of the car (in radians).
     * @param {HTMLImageElement} [image] - The image object for the car.
     * @param {string} color - The color of the car (used when no image).
     * @param {boolean} isPlayer - True if this is the player's car.
     */
    constructor(type, x, y, angle, image, color, isPlayer = false) {
        this.type = type;
        this.x = x; // Horizontal position on the track (world units)
        this.y = y; // Vertical position on the track (depth in world units)
        this.angle = angle; // Current angle of the car (radians)
        this.speed = 0; // Current speed
        this.maxSpeed = CAR_MAX_SPEED;
        this.acceleration = CAR_ACCELERATION;
        this.deceleration = CAR_DECELERATION;
        this.brakingPower = CAR_BRAKING_POWER;
        this.friction = CAR_FRICTION;
        this.turnSpeed = CAR_TURN_SPEED;
        this.reverseSpeedMultiplier = CAR_REVERSE_SPEED_MULTIPLIER;

        this.width = 60; // Visual width (scaled by projection)
        this.height = 100; // Visual height (scaled by projection)
        this.color = color; // Color for drawing if no image is used
        // this.image = image; // Removed image property as we are not using assets

        this.isPlayer = isPlayer; // True if this is the player's car
        this.isAccelerating = false;
        this.isBraking = false;
        this.isTurningLeft = false;
        this.isTurningRight = false;
        this.isSkidding = false; // For visual/audio effects

        this.lap = 0; // Current lap number
        this.currentSegmentIndex = 0; // The index of the track segment the car is currently on
        this.distanceFromSegmentStart = 0; // Distance of the car from the start of its current segment
        this.lastCrossedZ = 0; // To help with lap detection

        // AI specific properties (if this is an AI car)
        if (!this.isPlayer) {
            this.targetLane = 0; // -1 for left, 0 for center, 1 for right
            this.laneOffset = 0; // Current offset from track center for AI
            this.targetSpeed = this.maxSpeed * (0.8 + Math.random() * 0.2); // AI target speed
            this.changeLaneTimer = 0;
            this.changeLaneInterval = 2000 + Math.random() * 3000; // AI changes lane every 2-5 seconds
        }
    }

    /**
     * Updates the car's state based on input and delta time.
     * @param {number} deltaTime - Time elapsed since last update in milliseconds.
     * @param {Function} isKeyPressed - Function from inputHandler to check key state.
     * @param {Track} track - The game track object.
     */
    update(deltaTime, isKeyPressed, track) {
        const dt = deltaTime / 1000; // Convert to seconds

        this.isAccelerating = false;
        this.isBraking = false;
        this.isTurningLeft = false;
        this.isTurningRight = false;
        this.isSkidding = false;

        if (this.isPlayer) {
            // Player Input Handling
            if (isKeyPressed('ArrowUp') || isKeyPressed('w')) {
                this.speed += this.acceleration * dt;
                this.isAccelerating = true;
            } else if (isKeyPressed('ArrowDown') || isKeyPressed('s')) {
                // If moving forward, brake. If stationary or reversing, accelerate backward.
                if (this.speed > 0) {
                    this.speed -= this.brakingPower * dt;
                    this.isBraking = true;
                } else {
                    this.speed -= this.acceleration * CAR_REVERSE_SPEED_MULTIPLIER * dt;
                    this.isAccelerating = true; // Still "accelerating" but in reverse
                }
            } else {
                // Decelerate if no acceleration/braking input
                if (this.speed > 0) {
                    this.speed -= this.deceleration * dt;
                } else if (this.speed < 0) {
                    this.speed += this.deceleration * dt;
                }
            }

            if (isKeyPressed('ArrowLeft') || isKeyPressed('a')) {
                if (this.speed !== 0) {
                    this.angle -= this.turnSpeed * (this.speed / this.maxSpeed) * dt;
                    this.isTurningLeft = true;
                    if (Math.abs(this.speed) > 50) this.isSkidding = true; // Skid if turning at speed
                }
            }
            if (isKeyPressed('ArrowRight') || isKeyPressed('d')) {
                if (this.speed !== 0) {
                    this.angle += this.turnSpeed * (this.speed / this.maxSpeed) * dt;
                    this.isTurningRight = true;
                    if (Math.abs(this.speed) > 50) this.isSkidding = true; // Skid if turning at speed
                }
            }
        } else {
            // AI Input Handling
            this._handleAIInput(dt, track);
        }

        // Apply friction
        this.speed *= (this.friction ** dt); // Friction over time

        // Clamp speed
        this.speed = Math.max(-this.maxSpeed * this.reverseSpeedMultiplier, Math.min(this.speed, this.maxSpeed));

        // Update position based on speed and angle
        // In this 2D perspective, car.y is depth (Z), car.x is horizontal.
        // Car's movement along the track is primarily on the Y axis.
        this.y += this.speed * dt; // Move along the track (depth)

        // Adjust X position based on angle and speed for steering effect
        // A simple steering model: car moves horizontally on its local X axis
        this.x += Math.sin(this.angle) * this.speed * 0.001 * dt; // Small horizontal drift based on angle

        // Keep angle within -PI to PI
        if (this.angle > Math.PI) this.angle -= Math.PI * 2;
        if (this.angle < -Math.PI) this.angle += Math.PI * 2;

        // Update current segment index based on car's Y position
        this.currentSegmentIndex = Math.floor(this.y / SEGMENT_LENGTH);
        // Ensure index wraps around if track is looping
        this.currentSegmentIndex = this.currentSegmentIndex % track.segments.length;
        if (this.currentSegmentIndex < 0) {
            this.currentSegmentIndex += track.segments.length;
        }

        // Calculate distance from segment start for accurate road rendering
        this.distanceFromSegmentStart = this.y % SEGMENT_LENGTH;
        if (this.distanceFromSegmentStart < 0) {
            this.distanceFromSegmentStart += SEGMENT_LENGTH;
        }
    }

    /**
     * Basic AI behavior.
     * @param {number} dt - Delta time in seconds.
     * @param {Track} track - The track object.
     * @private
     */
    _handleAIInput(dt, track) {
        // Accelerate towards target speed
        if (this.speed < this.targetSpeed) {
            this.speed += this.acceleration * dt;
        } else {
            this.speed -= this.deceleration * dt;
        }

        // Clamp speed
        this.speed = Math.max(0, Math.min(this.speed, this.maxSpeed));

        // Basic lane keeping and changing
        const currentSegment = track.getSegment(this.y);
        const roadCenter = (currentSegment.p1.x + currentSegment.p2.x) / 2; // Center of the road at current segment
        const targetX = roadCenter + this.targetLane * (TRACK_WIDTH / 4); // Target X based on lane

        // Steer towards targetX
        const steerFactor = 0.005; // How strongly AI steers
        if (this.x < targetX - 5) {
            this.angle += this.turnSpeed * steerFactor * dt;
            this.isTurningRight = true;
        } else if (this.x > targetX + 5) {
            this.angle -= this.turnSpeed * steerFactor * dt;
            this.isTurningLeft = true;
        }

        // Randomly change lane target
        this.changeLaneTimer += dt * 1000;
        if (this.changeLaneTimer >= this.changeLaneInterval) {
            // Randomly choose a new lane: -1 (left), 0 (center), 1 (right)
            this.targetLane = Math.floor(Math.random() * 3) - 1;
            this.changeLaneTimer = 0;
            this.changeLaneInterval = 2000 + Math.random() * 3000;
        }
    }
}

export { Car };
