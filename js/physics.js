// js/physics.js

class Physics {
    constructor() {
        console.log('Physics module initialized.');
    }

    /**
     * Updates physics for all game entities (cars).
     * @param {Array<Car>} cars - An array of all car objects.
     * @param {Track} track - The track object.
     * @param {number} deltaTime - Time elapsed since last update in milliseconds.
     */
    update(cars, track, deltaTime) {
        this.handleCarToCarCollisions(cars);
        this.handleCarToTrackCollisions(cars, track);
        // Add more physics interactions here (e.g., gravity, off-road slowdown)
    }

    /**
     * Handles collisions between cars. (Very basic implementation)
     * @param {Array<Car>} cars - An array of all car objects.
     */
    handleCarToCarCollisions(cars) {
        for (let i = 0; i < cars.length; i++) {
            for (let j = i + 1; j < cars.length; j++) {
                const carA = cars[i];
                const carB = cars[j];

                // Simple AABB (Axis-Aligned Bounding Box) collision detection
                // This is a rough estimate and doesn't account for rotation or complex shapes.
                // For accurate collision, you'd use separating axis theorem (SAT) or more advanced libraries.
                if (
                    carA.x < carB.x + carB.width &&
                    carA.x + carA.width > carB.x &&
                    carA.y < carB.y + carB.height &&
                    carA.y + carA.height > carB.y
                ) {
                    // Collision detected!
                    // A simple response: reduce speed and slightly push apart.
                    const overlapX = Math.min(carA.x + carA.width - carB.x, carB.x + carB.width - carA.x);
                    const overlapY = Math.min(carA.y + carA.height - carB.y, carB.y + carB.height - carA.y);

                    const collisionForce = 0.5; // How much speed is reduced on collision

                    carA.speed *= collisionForce;
                    carB.speed *= collisionForce;

                    // Rudimentary push-back (can be improved with vectors)
                    if (overlapX < overlapY) {
                        if (carA.x < carB.x) carA.x -= overlapX / 2;
                        else carB.x -= overlapX / 2;
                    } else {
                        if (carA.y < carB.y) carA.y -= overlapY / 2;
                        else carB.y -= overlapY / 2;
                    }
                    // console.log(`Collision between ${carA.type} and ${carB.type}`);
                    // Play collision sound
                    // audioManager.playSound('collision'); // Will add audioManager later
                }
            }
        }
    }

    /**
     * Handles collisions between cars and the track boundaries. (Simplified)
     * This will check if the car is within the road's X boundaries for its current segment.
     * @param {Array<Car>} cars - An array of car objects.
     * @param {Track} track - The track object.
     */
    handleCarToTrackCollisions(cars, track) {
        cars.forEach(car => {
            // Find the track segment the car is currently over
            const currentSegment = track.getSegment(car.y); // Using car.y as its Z position on the track

            // Get the road's left and right boundaries for this segment
            const roadLeftX = currentSegment.p1.x;
            const roadRightX = currentSegment.p2.x;

            // Car's boundaries (considering its width and position)
            const carLeftEdge = car.x - car.width / 2;
            const carRightEdge = car.x + car.width / 2;

            let offRoad = false;

            // Check if car is off the left side of the road
            if (carLeftEdge < roadLeftX) {
                car.x = roadLeftX + car.width / 2; // Snap back to road
                offRoad = true;
            }
            // Check if car is off the right side of the road
            if (carRightEdge > roadRightX) {
                car.x = roadRightX - car.width / 2; // Snap back to road
                offRoad = true;
            }

            if (offRoad) {
                // Apply a slowdown effect for being off-road
                car.speed *= 0.9; // Reduce speed by 10%
                car.isSkidding = true; // Can trigger skid audio/visuals
                // console.log(`${car.type} is off road!`);
            } else {
                // car.isSkidding = false; // Reset skid state if back on road, unless other conditions apply
            }
        });
    }

    // You could add methods for:
    // - Gravity effects (if track has hills/jumps)
    // - Air resistance
    // - More complex friction based on surface (grass, road, dirt)
    // - Rotational physics
}

export { Physics };
