// js/constants.js

// Game Configuration
const GAME_WIDTH = 1280; // Width of the game canvas
const GAME_HEIGHT = 720; // Height of the game canvas

// Game Loop Settings
const FPS = 60; // Frames per second
const FRAME_INTERVAL = 1000 / FPS; // Milliseconds per frame

// UI Update Interval (to prevent excessive DOM manipulation)
const UI_UPDATE_INTERVAL = 100; // Update UI every 100ms

// Car Physics Constants
const CAR_MAX_SPEED = 300; // Max speed in units/second (e.g., pixels/second, scaled for projection)
const CAR_ACCELERATION = 250; // Acceleration rate in units/second^2
const CAR_DECELERATION = 150; // Deceleration rate when not accelerating
const CAR_BRAKING_POWER = 400; // Braking rate
const CAR_FRICTION = 0.98; // Friction applied every second (0.98 means 2% speed loss per second if no input)
const CAR_TURN_SPEED = 3.5; // Radians per second at full speed
const CAR_REVERSE_SPEED_MULTIPLIER = 0.3; // Max reverse speed is 30% of max forward speed

// Track Generation Constants
const SEGMENT_LENGTH = 100; // Length of a single road segment in world units
const TRACK_WIDTH = 500; // Width of the road in world units
const RUMBLE_LENGTH = 3; // Number of segments for one rumble strip pattern (e.g., 3 segments white, 3 segments red)
const ROAD_SEGMENTS = 1000; // Total number of road segments (determines track length)
const TOTAL_LAPS = 3; // Total laps to complete the race

// Camera & Projection Constants
const CAMERA_HEIGHT = 1000; // Height of the camera above the road
const CAMERA_DEPTH = 0.92; // Camera's distance from the projection plane (influences horizon position and perspective)
const FIELD_OF_VIEW = 1.1; // Horizontal field of view in radians (approx 63 degrees)
const FOG_DENSITY = 3; // How quickly fog intensifies with distance (higher means more fog closer)


// Colors (Hexadecimal or RGB)
const COLORS = {
    roadLight: '#6B6B6B', // Light grey for road
    roadDark: '#626262',  // Dark grey for road
    grassLight: '#106B10', // Light green for grass
    grassDark: '#0A400A',  // Dark green for grass
    rumbleWhite: '#FFFFFF', // White for rumble strips
    rumbleRed: '#BB0000',   // Red for rumble strips
    sky: '#87CEEB' // Sky blue
};

// ASSET_PATHS object removed entirely as we're not using assets

// Game State Definitions
const GAME_STATE = {
    LOADING: 'LOADING', // Still good to have a loading state for initial setup
    MAIN_MENU: 'MAIN_MENU',
    IN_GAME: 'IN_GAME',
    PAUSED: 'PAUSED',
    RACE_RESULTS: 'RACE_RESULTS',
    SETTINGS: 'SETTINGS',
    CONTROLS: 'CONTROLS',
    ABOUT: 'ABOUT',
    GARAGE: 'GARAGE'
};

export {
    GAME_WIDTH,
    GAME_HEIGHT,
    FPS,
    FRAME_INTERVAL,
    UI_UPDATE_INTERVAL,
    CAR_MAX_SPEED,
    CAR_ACCELERATION,
    CAR_DECELERATION,
    CAR_BRAKING_POWER,
    CAR_FRICTION,
    CAR_TURN_SPEED,
    CAR_REVERSE_SPEED_MULTIPLIER,
    SEGMENT_LENGTH,
    TRACK_WIDTH,
    RUMBLE_LENGTH,
    ROAD_SEGMENTS,
    TOTAL_LAPS,
    CAMERA_HEIGHT,
    CAMERA_DEPTH,
    FIELD_OF_VIEW,
    FOG_DENSITY,
    COLORS,
    GAME_STATE
};
