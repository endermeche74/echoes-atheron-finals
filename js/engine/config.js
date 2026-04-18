/*************************************************************
 * config.js — Centralized Game Configuration
 * Load FIRST before all other engine scripts
 *************************************************************/

const CONFIG = {
    // Display
    TILE:    16,
    CANVAS_W: 320,
    CANVAS_H: 240,
    SCALE:   2,
    GRID_W:  20,
    GRID_H:  15,

    // Player
    PLAYER_SPEED: 80,
    PLAYER_HITBOX: { x: 2, y: 4, w: 12, h: 12 },
    INTERACT_RANGE: 1,

    // Keyboard AZERTY
    KEYS: {
        UP:       ['KeyZ', 'ArrowUp'],
        DOWN:     ['KeyS', 'ArrowDown'],
        LEFT:     ['KeyQ', 'ArrowLeft'],
        RIGHT:    ['KeyD', 'ArrowRight'],
        INTERACT: ['KeyE', 'Space'],
        MENU:     ['KeyI'],
        CANCEL:   ['Escape'],
        DEBUG:    ['F1']
    },

    // Solid tile IDs
    SOLID_TILES: [0, 2, 3, 7, 11, 12, 13, 14, 16],

    // Transition tile IDs
    TRANSITION_TILES: [20, 21, 22, 23, 24, 25]
};
