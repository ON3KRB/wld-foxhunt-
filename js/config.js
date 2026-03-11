/**
 * config.js - Global configuration
 * WLD FoxWave ARDF
 */
"use strict";

const CONFIG = {
    // World
    WORLD_WIDTH:  80,
    WORLD_HEIGHT: 60,

    // Player start (tile coords)
    PLAYER_START_X: 5,
    PLAYER_START_Y: 54,

    // 3D movement
    RC_MOVE_SPEED:   0.07,
    RC_ROT_SPEED:    0.045,
    RC_STRAFE_SPEED: 0.05,
    RC_FOV_DEG:      66,

    // Fox beacons
    FOX_COUNT:                    5,   // set at game start (3 or 5)
    FOX_DETECTION_RADIUS:       2.0,
    FOX_AUDIO_RADIUS:            35,   // large range so distant beacons still audible
    FOX_MIN_DIST_FROM_START:     10,
    FOX_MIN_DIST_FROM_EACH_OTHER: 8,

    FOX_CODES:  ['MOE','MOI','MOS','MOH','MO5'],
    FOX_COLORS: ['#ff5555','#ffcc00','#44ff88','#44aaff','#ff66ff'],

    // Receiver
    RECEIVER_ROTATE_STEP: 5,
    RECEIVER_BEAMWIDTH:   65,       // wider beam = more forgiving

    // Morse CW (80m ARDF)
    MORSE_UNIT_MS:      90,
    MORSE_FREQUENCY:   700,
    MORSE_REPEAT_PAUSE: 2200,
    AUDIO_MAX_VOLUME:   0.9,
    AUDIO_MIN_SIGNAL:   0.005,      // play even extremely faint signals

    // ON4BB hint - CORRECTED club frequency
    ON4BB_CALLSIGN:  'ON4BB',
    WLD_VHF_FREQ:    '144.675',     // CORRECT WLD club frequency
    HINT_COOLDOWN_MS: 15000,

    // Bearing lines
    BEARING_COLORS: [
        '#ff4444','#44ff88','#4499ff','#ffcc00','#ff44ff',
        '#44ffcc','#ff8800','#88ff00','#ff0088','#00ccff'
    ],

    // NPCs
    NPC_COUNT:     3,
    NPC_CALLSIGNS: ['ON3AB','ON4XY','OT5WLD'],
    NPC_MOVE_DELAY: 380,

    // 2D map tile size (mini-map and map view)
    TILE_SIZE_MAP: 8,
};

// Tile types
const TILE = {
    GRASS:0, PATH:1, TREE:2, WATER:3, BUILDING:4,
    PLAYGROUND:5, FOUNTAIN:6, TRAIN:7, ZOO:8, START:9,
    DENSE_TREE:10, FLOWER:11, SHRUB:12,
};

// Walkable (for 2D collision / fox placement / NPC)
const WALKABLE_TILES = new Set([TILE.PATH, TILE.TRAIN, TILE.START]);

// Solid walls in 3D raycaster
const SOLID3D = new Set([TILE.TREE, TILE.DENSE_TREE, TILE.SHRUB, TILE.WATER, TILE.BUILDING]);

// Game states
const STATE = {
    SPLASH:'splash', REGISTRATION:'registration', BRIEFING:'briefing',
    HUNTING:'hunting', RECEIVER:'receiver', MAP_VIEW:'map_view',
    FINISHED:'finished', CERTIFICATE:'certificate',
};
