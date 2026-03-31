/*************************************************************
 * input.js — Keyboard Input Handler
 * Handles: WASD/Arrow movement, E to interact, ESC to exit
 *************************************************************/

const Input = (function() {
    // === STATE ===
    const keys = {};
    const justPressed = {};
    const justReleased = {};
    let enabled = false;
    
    // === KEY MAPPINGS ===
    const ACTIONS = {
        // Movement
        UP:    ['w', 'W', 'ArrowUp'],
        DOWN:  ['s', 'S', 'ArrowDown'],
        LEFT:  ['a', 'A', 'ArrowLeft'],
        RIGHT: ['d', 'D', 'ArrowRight'],
        
        // Actions
        INTERACT: ['e', 'E', ' '],  // E or Space
        CANCEL:   ['Escape', 'q', 'Q'],
        MENU:     ['i', 'I', 'Tab'],
        
        // Debug
        DEBUG: ['`', '~']
    };

    // === INITIALIZATION ===
    function init() {
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        
        // Prevent arrow key scrolling
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                if (enabled) {
                    e.preventDefault();
                }
            }
        });
        
        console.log('[Input] Initialized');
    }

    function onKeyDown(e) {
        if (!enabled) return;
        
        // Ignore if typing in input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const key = e.key;
        
        if (!keys[key]) {
            justPressed[key] = true;
        }
        keys[key] = true;
    }

    function onKeyUp(e) {
        const key = e.key;
        keys[key] = false;
        justReleased[key] = true;
    }

    // === UPDATE (call once per frame) ===
    function update() {
        // Clear justPressed/justReleased at end of frame
        // (called by engine after all systems have had a chance to read)
        Object.keys(justPressed).forEach(k => delete justPressed[k]);
        Object.keys(justReleased).forEach(k => delete justReleased[k]);
    }

    // === QUERIES ===
    function isHeld(action) {
        const bindings = ACTIONS[action];
        if (!bindings) return false;
        return bindings.some(key => keys[key]);
    }

    function wasPressed(action) {
        const bindings = ACTIONS[action];
        if (!bindings) return false;
        return bindings.some(key => justPressed[key]);
    }

    function wasReleased(action) {
        const bindings = ACTIONS[action];
        if (!bindings) return false;
        return bindings.some(key => justReleased[key]);
    }

    function getMovementVector() {
        let dx = 0, dy = 0;
        
        if (isHeld('UP'))    dy -= 1;
        if (isHeld('DOWN'))  dy += 1;
        if (isHeld('LEFT'))  dx -= 1;
        if (isHeld('RIGHT')) dx += 1;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }
        
        return { x: dx, y: dy };
    }

    function enable() {
        enabled = true;
        // Clear any stale key states
        Object.keys(keys).forEach(k => keys[k] = false);
        console.log('[Input] Enabled');
    }

    function disable() {
        enabled = false;
        // Clear all key states
        Object.keys(keys).forEach(k => keys[k] = false);
        console.log('[Input] Disabled');
    }

    // === PUBLIC API ===
    return {
        init,
        update,
        enable,
        disable,
        isHeld,
        wasPressed,
        wasReleased,
        getMovementVector,
        isEnabled: () => enabled,
        
        // Raw access for edge cases
        isKeyHeld: (key) => !!keys[key],
        wasKeyPressed: (key) => !!justPressed[key]
    };
})();

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Input.init());
} else {
    Input.init();
}