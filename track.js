// js/track.js

import {
    TRACK_WIDTH, SEGMENT_LENGTH, RUMBLE_LENGTH, ROAD_SEGMENTS,
    COLORS, FOG_DENSITY, CAMERA_HEIGHT, CAMERA_DEPTH, FIELD_OF_VIEW
} from './constants.js';

class Track {
    constructor() {
        this.segments = [];
        this.totalLength = 0; // Total length of the track
        this._generateTrack();
        console.log(`Track generated with ${this.segments.length} segments.`);
    }

    /**
     * Generates the track segments. This is a simplified flat track.
     * A real racing game would have curves, hills, etc.
     * @private
     */
    _generateTrack() {
        this.segments = [];
        let z = 0; // Z-coordinate along the track
        let x = 0; // X-coordinate for track center deviations
        let curve = 0; // How much the track curves (for future expansion)
        let dx = 0; // Change in X per segment
        let ddx = 0; // Change in dx per segment (for more gradual curves)

        for (let i = 0; i < ROAD_SEGMENTS; i++) {
            const segment = {
                index: i,
                p1: { x: x - TRACK_WIDTH / 2, y: 0, z: z }, // Left side of road
                p2: { x: x + TRACK_WIDTH / 2, y: 0, z: z }, // Right side of road
                color: this._getSegmentColor(i),
                curve: curve, // Store curve value for this segment
                sprite: null // Placeholder for objects like trees, signs
            };

            this.segments.push(segment);
            z += SEGMENT_LENGTH; // Move to the next segment's start

            // Add simple random variation for demonstration purposes
            // In a real game, you'd define track sections (straight, curve, hill)
            if (i > 20 && i < ROAD_SEGMENTS - 20) { // Keep start/end straight
                if (Math.random() < 0.05) { // 5% chance to add a slight curve
                    ddx = (Math.random() - 0.5) * 0.005; // Small random change in dx
                }
                dx += ddx;
                x += dx * SEGMENT_LENGTH; // Adjust x based on dx for road center
            }
        }
        this.totalLength = z; // The Z-coordinate of the last segment marks the total length

        // Add start and finish lines markers
        this.segments[0].color = { road: COLORS.rumbleWhite, grass: COLORS.grassLight }; // Start line
        this.segments[1].color = { road: COLORS.rumbleRed, grass: COLORS.grassLight };

        this.segments[ROAD_SEGMENTS - 2].color = { road: COLORS.rumbleRed, grass: COLORS.grassDark }; // Finish line
        this.segments[ROAD_SEGMENTS - 1].color = { road: COLORS.rumbleWhite, grass: COLORS.grassDark };

        // Add some basic sprites to random segments
        // For a full game, you'd place these more strategically
        for (let i = 0; i < this.segments.length; i += 20) { // Every 20 segments
            if (i > 50 && i < this.segments.length - 50) { // Don't place near start/end
                const side = Math.random() > 0.5 ? 'left' : 'right';
                const assetKey = Math.random() > 0.5 ? 'tree1' : 'bush1';
                this.segments[i].sprite = {
                    image: assetLoader.getImage(assetKey),
                    offset: side === 'left' ? -TRACK_WIDTH * 0.8 : TRACK_WIDTH * 0.8, // X offset from road center
                    side: side // 'left' or 'right'
                };
            }
        }
    }

    /**
     * Determines the color of a track segment based on its index for alternating stripes.
     * @param {number} index - The index of the segment.
     * @returns {{road: string, grass: string}} An object with road and grass colors.
     * @private
     */
    _getSegmentColor(index) {
        const isRumble = (Math.floor(index / RUMBLE_LENGTH) % 2 === 0);
        const isGrassLight = (Math.floor(index / RUMBLE_LENGTH) % 2 === 0);

        return {
            road: isRumble ? COLORS.roadLight : COLORS.roadDark,
            grass: isGrassLight ? COLORS.grassLight : COLORS.grassDark
        };
    }

    /**
     * Gets a segment by its Z-coordinate. Wraps around for continuous track.
     * @param {number} z - The Z-coordinate.
     * @returns {object} The track segment object.
     */
    getSegment(z) {
        const index = Math.floor(z / SEGMENT_LENGTH) % this.segments.length;
        return this.segments[index < 0 ? index + this.segments.length : index]; // Handle negative indices
    }

    /**
     * Gets a segment by its index.
     * @param {number} index - The index of the segment.
     * @returns {object} The track segment object.
     */
    getSegmentByIndex(index) {
        const wrappedIndex = index % this.segments.length;
        return this.segments[wrappedIndex < 0 ? wrappedIndex + this.segments.length : wrappedIndex];
    }

    /**
     * Draws the track segments on the canvas. This is the core rendering logic.
     * This function should ideally be in rendering.js, but placed here for context.
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context.
     * @param {number} cameraZ - The camera's Z position along the track.
     * @param {number} cameraX - The camera's X position (side-to-side).
     * @param {number} canvasWidth - The width of the canvas.
     * @param {number} canvasHeight - The height of the canvas.
     */
    draw(ctx, cameraZ, cameraX, canvasWidth, canvasHeight) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear the entire canvas

        const baseProjectionScale = canvasWidth / 2 / Math.tan(FIELD_OF_VIEW / 2);
        const startSegmentIndex = Math.floor(cameraZ / SEGMENT_LENGTH);

        let lastProjectedX1 = 0;
        let lastProjectedX2 = canvasWidth;
        let lastProjectedY = canvasHeight;

        for (let i = 0; i < ROAD_SEGMENTS + 10; i++) { // Draw more segments than visible for smooth transitions
            const segment = this.getSegmentByIndex(startSegmentIndex + i);
            const nextSegment = this.getSegmentByIndex(startSegmentIndex + i + 1);

            // Calculate current segment's z-position relative to camera
            const segmentZ = segment.index * SEGMENT_LENGTH - cameraZ;
            const nextSegmentZ = nextSegment.index * SEGMENT_LENGTH - cameraZ;

            // Apply perspective projection (simplified for 2D perspective)
            // This is where a lot of the '3D' magic happens in 2D racers
            const p1 = this._project(segment.p1, segmentZ, cameraX, baseProjectionScale, canvasWidth, canvasHeight);
            const p2 = this._project(segment.p2, segmentZ, cameraX, baseProjectionScale, canvasWidth, canvasHeight);
            const p3 = this._project(nextSegment.p2, nextSegmentZ, cameraX, baseProjectionScale, canvasWidth, canvasHeight);
            const p4 = this._project(nextSegment.p1, nextSegmentZ, cameraX, baseProjectionScale, canvasWidth, canvasHeight);

            // Skip drawing if segments are behind the camera
            if (p1.screenY >= canvasHeight && p4.screenY >= canvasHeight) continue;

            // Draw grass
            ctx.fillStyle = segment.color.grass;
            ctx.fillRect(0, p3.screenY, canvasWidth, p1.screenY - p3.screenY); // Draw from bottom up

            // Draw road
            ctx.fillStyle = segment.color.road;
            ctx.beginPath();
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.lineTo(p3.screenX, p3.screenY);
            ctx.lineTo(p4.screenX, p4.screenY);
            ctx.fill();

            // Draw rumble strips (simplistic for now)
            const rumbleWidth = (p2.screenX - p1.screenX) * 0.1; // 10% of road width
            ctx.fillStyle = (Math.floor(i / RUMBLE_LENGTH) % 2 === 0) ? COLORS.rumbleWhite : COLORS.rumbleRed;
            ctx.fillRect(p1.screenX, p1.screenY, rumbleWidth, p4.screenY - p1.screenY); // Left rumble
            ctx.fillRect(p2.screenX - rumbleWidth, p2.screenY, rumbleWidth, p3.screenY - p2.screenY); // Right rumble

            // Draw road line (center line)
            ctx.fillStyle = COLORS.rumbleWhite; // White line
            const lineThickness = (p2.screenX - p1.screenX) * 0.02; // 2% of road width
            ctx.fillRect(p1.screenX + (p2.screenX - p1.screenX) / 2 - lineThickness / 2, p1.screenY, lineThickness, p4.screenY - p1.screenY);

            // Draw sprites (trees, bushes) if they exist for this segment
            if (segment.sprite) {
                const img = segment.sprite.image;
                if (img && img.naturalWidth > 0) { // Check if image is loaded
                    const spriteX = segment.sprite.offset; // X position relative to road center
                    const projectedSprite = this._project(
                        { x: spriteX, y: 0, z: segmentZ + SEGMENT_LENGTH / 2 }, // Project from middle of segment
                        segmentZ + SEGMENT_LENGTH / 2,
                        cameraX,
                        baseProjectionScale,
                        canvasWidth,
                        canvasHeight
                    );

                    // Scale sprite based on its distance
                    const scale = 1 / projectedSprite.scale; // Inverse of projection scale
                    const spriteWidth = img.naturalWidth * scale * 0.5; // Adjust scale for size
                    const spriteHeight = img.naturalHeight * scale * 0.5;

                    ctx.drawImage(
                        img,
                        projectedSprite.screenX - spriteWidth / 2,
                        projectedSprite.screenY - spriteHeight, // Draw from bottom up
                        spriteWidth,
                        spriteHeight
                    );
                }
            }

            // Apply fog
            const fogAmount = 1 - Math.pow(i / ROAD_SEGMENTS, FOG_DENSITY); // Closer segments are less foggy
            if (fogAmount < 1) {
                ctx.fillStyle = `rgba(173, 216, 230, ${1 - fogAmount})`; // Light blue fog
                ctx.fillRect(0, p3.screenY, canvasWidth, p1.screenY - p3.screenY);
            }

            // Update last projected coordinates for drawing background "sky" (if any)
            lastProjectedX1 = p1.screenX;
            lastProjectedX2 = p2.screenX;
            lastProjectedY = p1.screenY;
        }
    }

    /**
     * Projects a 3D point (x, y, z) onto the 2D canvas.
     * @param {object} point - The 3D point {x, y, z}.
     * @param {number} segmentZ - The Z-coordinate of the current segment relative to the camera.
     * @param {number} cameraX - The camera's X position.
     * @param {number} baseProjectionScale - The base scaling factor for perspective.
     * @param {number} canvasWidth - The width of the canvas.
     * @param {number} canvasHeight - The height of the canvas.
     * @returns {object} An object with screenX, screenY, and scale.
     * @private
     */
    _project(point, segmentZ, cameraX, baseProjectionScale, canvasWidth, canvasHeight) {
        // Z distance from camera is the segment's Z relative to camera plus camera height
        const cameraZ = segmentZ + CAMERA_HEIGHT;

        // Scale factor for perspective (farther objects are smaller)
        const scale = baseProjectionScale / cameraZ;

        // Project X: (point.x - cameraX) shifts relative to camera's X-offset
        const projectedX = (point.x - cameraX) * scale;

        // Project Y: CAMERA_HEIGHT * CAMERA_DEPTH ensures a horizon effect
        const projectedY = (CAMERA_HEIGHT * CAMERA_DEPTH - point.y) * scale;

        // Convert to screen coordinates
        const screenX = (canvasWidth / 2) + projectedX;
        const screenY = (canvasHeight / 2) - projectedY; // Y-axis is inverted on canvas

        return {
            screenX: screenX,
            screenY: screenY,
            scale: scale
        };
    }
}

export { Track };
