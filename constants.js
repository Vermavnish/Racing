// js/constants.js

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

// Game States
const GAME_STATE = {
    LOADING: 'loading',
    MAIN_MENU: 'mainMenu',
    GARAGE: 'garage',
    SETTINGS: 'settings',
    CONTROLS: 'controls',
    ABOUT: 'about',
    IN_GAME: 'inGame',
    PAUSED: 'paused',
    RACE_RESULTS: 'raceResults'
};

// Car Physics Constants (adjust these to change car behavior)
const CAR_MAX_SPEED = 250; // Max speed in units per second (e.g., pixels/sec)
const CAR_ACCELERATION = 0.05; // How quickly car speeds up
const CAR_DECELERATION = 0.03; // How quickly car slows down naturally
const CAR_BRAKING_POWER = 0.1; // How quickly car slows down when braking
const CAR_TURN_SPEED = 0.003; // How quickly car turns (radians per update)
const CAR_FRICTION = 0.98; // Reduces speed over time (1 = no friction, 0 = stops instantly)
const CAR_REVERSE_SPEED_MULTIPLIER = 0.4; // Max speed when reversing

// Track Constants
const TRACK_WIDTH = 800; // Width of the drivable track area
const SEGMENT_LENGTH = 100; // Length of one track segment (controls track detail)
const RUMBLE_LENGTH = 3; // Number of track segments for rumble strips
const ROAD_SEGMENTS = 200; // Total number of segments in the track (influences track length)
const FOG_DENSITY = 0.05; // How quickly fog appears

// Camera Constants
const CAMERA_HEIGHT = 1000; // Distance of the camera from the track
const CAMERA_DEPTH = 0.8; // Perspective depth (higher = more perspective distortion)
const FIELD_OF_VIEW = Math.PI / 3; // Angle of the camera's view

// UI Constants
const UI_UPDATE_INTERVAL = 100; // How often (ms) UI elements like speedometer update

// Asset Paths (Example - you'll need actual images/sounds)
const ASSET_PATHS = {
    images: {
        background:<a href="https://imgbb.com/"><img src="https://i.ibb.co/9jdnQwy/background.jpg" alt="background" border="0"></a>,
        car2 :<a href="https://imgbb.com/"><img src="https://i.ibb.co/bMLbd0vB/car1.png" alt="car1" border="0"></a>

        tree1: 'assets/images/objects/tree1.png',
        bush1: 'assets/images/objects/bush1.png',
        // Add more car images, track textures, obstacles etc.
    },
    sounds: {
        engineIdle: 'assets/audio/engine_idle.mp3',
        engineAccelerate: 'assets/audio/engine_accel.mp3',
        skid: 'assets/audio/skid.mp3',
        collision: 'assets/audio/collision.mp3',
        backgroundMusic: 'assets/audio/bg_music.mp3',
        buttonClick: 'assets/audio/button_click.mp3',
        // Add more sound effects
    }
};

// Other Game Constants
const TOTAL_LAPS = 3;
const FONT_PRIMARY = 'Orbitron, sans-serif';
const FONT_SECONDARY = 'Roboto, sans-serif';
const COLORS = {
    roadLight: '#696969',
    roadDark: '#666666',
    grassLight: '#105B10',
    grassDark: '#0A400A',
    rumbleRed: '#FF0000',
    rumbleWhite: '#FFFFFF',
    fog: '#ADD8E6' // Light blue for fog
};

export {
    GAME_WIDTH, GAME_HEIGHT, GAME_STATE,
    CAR_MAX_SPEED, CAR_ACCELERATION, CAR_DECELERATION, CAR_BRAKING_POWER, CAR_TURN_SPEED, CAR_FRICTION, CAR_REVERSE_SPEED_MULTIPLIER,
    TRACK_WIDTH, SEGMENT_LENGTH, RUMBLE_LENGTH, ROAD_SEGMENTS, FOG_DENSITY,
    CAMERA_HEIGHT, CAMERA_DEPTH, FIELD_OF_VIEW,
    UI_UPDATE_INTERVAL,
    ASSET_PATHS,
    TOTAL_LAPS, FONT_PRIMARY, FONT_SECONDARY, COLORS
};
