// js/rendering.js

import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './constants.js';
import assetLoader from './assetLoader.js'; // To get images

class Rendering {
    /**
     * @param {HTMLCanvasElement} canvas - The main game canvas element.
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Failed to get 2D rendering context for canvas.');
        }
        this.offscreenCanvas = document.createElement('canvas'); // For offscreen rendering (optimization)
        this.offscreenCanvas.width = GAME_WIDTH;
        this.offscreenCanvas.height = GAME_HEIGHT;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        console.log('Rendering module initialized.');
    }

    /**
     * Clears the entire canvas.
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Renders the entire game scene.
     * @param {Track} track - The game track object.
     * @param {Camera} camera - The camera object.
     * @param {Array<Car>} cars - Array of car objects.
     * @param {Car} playerCar - The player's car object.
     */
    render(track, camera, cars, playerCar) {
        // Use offscreen canvas for complex scenes to optimize
        this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

        // 1. Draw Background (sky/horizon)
        this.drawBackground(this.offscreenCtx);

        // 2. Draw Track (Road, Grass, Rumble strips, Objects)
        // The track.draw method handles perspective projection and drawing segments
        track.draw(this.offscreenCtx, camera.getZ(), camera.getX(), GAME_WIDTH, GAME_HEIGHT);

        // 3. Draw Cars (player car always last to be on top)
        // Sort cars by their Z position (player car's Y value) to draw farther cars first
        const sortedCars = [...cars].sort((a, b) => a.y - b.y);

        sortedCars.forEach(car => {
            this.drawCar(this.offscreenCtx, car, camera);
        });

        // 4. Overlay the offscreen canvas onto the main canvas
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);

        // This is where you might draw a minimap, or other UI elements that are always on top
        // (though we have HTML UI elements, some might be drawn directly on canvas)
        this.drawMinimap(this.ctx, playerCar, track);
    }

    /**
     * Draws the background (sky) for the game.
     * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
     */
    drawBackground(ctx) {
        // Simple gradient sky
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(0.5, '#ADD8E6'); // Lighter blue at horizon
        gradient.addColorStop(1, COLORS.grassLight); // Blends into grass at horizon
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // You could draw a separate background image here if ASSET_PATHS.images.background exists
        // const backgroundImage = assetLoader.getImage('background');
        // if (backgroundImage) {
        //     ctx.drawImage(backgroundImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);
        // }
    }


    /**
     * Draws a single car on the canvas, handling its position and rotation.
     * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
     * @param {Car} car - The car object to draw.
     * @param {Camera} camera - The camera object.
     */
    drawCar(ctx, car, camera) {
        if (!car.image) {
            console.warn("Car image not available for drawing.");
            return;
        }

        // Project the car's 3D world position onto the 2D screen
        // This is a simplified projection for the car, assuming it's always on the track
        // The Y position for cars is actually their Z-world coordinate in this setup.
        // We project the car's X and current Z (Y) to screen space relative to camera.
        const baseProjectionScale = GAME_WIDTH / 2 / Math.tan(camera.getFOV() / 2);
        const carZRelativeToCamera = (car.y - camera.getZ()) + camera.getHeight(); // Adjust Z for camera height

        // If car is behind the camera or too far, don't draw
        if (carZRelativeToCamera <= 0 || carZRelativeToCamera > camera.getHeight() + 2000) { // Limit drawing distance
             return;
        }

        const scale = baseProjectionScale / carZRelativeToCamera;

        const projectedCarX = (car.x - camera.getX()) * scale;
        const projectedCarY = (camera.getHeight() * camera.getDepth()) * scale; // Y is fixed for flat ground plane

        const screenX = (GAME_WIDTH / 2) + projectedCarX;
        const screenY = (GAME_HEIGHT / 2) - projectedCarY;

        const carWidth = car.width * scale * 0.5; // Scale car width
        const carHeight = car.height * scale * 0.5; // Scale car height

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(car.angle); // Rotate the car sprite

        ctx.drawImage(
            car.image,
            -carWidth / 2, // Draw from center
            -carHeight / 2,
            carWidth,
            carHeight
        );
        ctx.restore();

        // Optional: Draw a debug rectangle for collision
        // ctx.strokeStyle = 'red';
        // ctx.strokeRect(screenX - carWidth / 2, screenY - carHeight / 2, carWidth, carHeight);
    }

    /**
     * Draws a simple minimap.
     * @param {CanvasRenderingContext2D} ctx - The main canvas context.
     * @param {Car} playerCar - The player's car.
     * @param {Track} track - The track object.
     */
    drawMinimap(ctx, playerCar, track) {
        const minimapCanvas = document.createElement('canvas'); // Create a temporary canvas for minimap
        minimapCanvas.width = 200; // As per HTML
        minimapCanvas.height = 150;
        const minimapCtx = minimapCanvas.getContext('2d');

        const mapScale = minimapCanvas.width / (track.totalLength / 5); // Adjust scale to fit track
        const xOffset = minimapCanvas.width / 2;
        const yOffset = minimapCanvas.height / 2;

        // Draw track outline on minimap
        minimapCtx.strokeStyle = COLORS.rumbleWhite;
        minimapCtx.lineWidth = 2;
        minimapCtx.beginPath();
        minimapCtx.moveTo(xOffset + track.segments[0].p1.x * mapScale * 0.1, yOffset + track.segments[0].p1.z * mapScale * 0.1);

        track.segments.forEach(segment => {
            // Draw both sides of the road for the track outline
            minimapCtx.lineTo(xOffset + segment.p1.x * mapScale * 0.1, yOffset + segment.p1.z * mapScale * 0.1);
        });
        minimapCtx.stroke();

        minimapCtx.beginPath();
        minimapCtx.moveTo(xOffset + track.segments[0].p2.x * mapScale * 0.1, yOffset + track.segments[0].p2.z * mapScale * 0.1);
        track.segments.forEach(segment => {
            minimapCtx.lineTo(xOffset + segment.p2.x * mapScale * 0.1, yOffset + segment.p2.z * mapScale * 0.1);
        });
        minimapCtx.stroke();


        // Draw player car on minimap
        minimapCtx.fillStyle = 'blue';
        const playerMapX = xOffset + playerCar.x * mapScale * 0.1;
        const playerMapY = yOffset + playerCar.y * mapScale * 0.1;
        minimapCtx.beginPath();
        minimapCtx.arc(playerMapX, playerMapY, 5, 0, Math.PI * 2);
        minimapCtx.fill();

        // Draw AI cars on minimap (example for one AI car)
        // You'd loop through all AI cars
        // minimapCtx.fillStyle = 'red';
        // minimapCtx.beginPath();
        // minimapCtx.arc(xOffset + aiCar.x * mapScale * 0.1, yOffset + aiCar.y * mapScale * 0.1, 4, 0, Math.PI * 2);
        // minimapCtx.fill();

        // Get the minimap container from HTML
        const minimapContainer = document.getElementById('minimapContainer');
        if (minimapContainer) {
            // Clear previous minimap content
            while (minimapContainer.firstChild) {
                minimapContainer.removeChild(minimapContainer.firstChild);
            }
            minimapContainer.appendChild(minimapCanvas); // Append the rendered minimap canvas
        }
    }
}

export { Rendering };
