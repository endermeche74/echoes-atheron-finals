/*************************************************************
 * config.js — Centralized Game Configuration
 * Load FIRST before all other engine scripts
 *************************************************************/

const CONFIG = {
    // Display
    TILE:          48,
    TILE_SIZE:     48,
    CANVAS_W:      624,   // 13 * 48
    CANVAS_H:      336,   //  7 * 48
    SCALE:         2,     // affichage 1248x672
    DISPLAY_SCALE: 2,
    GRID_W:   13,
    GRID_H:   7,

    // Player
    PLAYER_SPEED: 120,
    PLAYER_HITBOX: { x: 6, y: 12, w: 36, h: 36 },
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
