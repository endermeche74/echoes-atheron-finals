/*************************************************************
 * input.js — Keyboard Input Handler
 * Handles: ZQSD/arrow movement (AZERTY), interact key, enable/disable
 *************************************************************/

const Input = (function() {

    // === KEY BINDINGS (sourced from CONFIG.KEYS) ===
    let bindings = {
        up:       CONFIG.KEYS.UP,
        down:     CONFIG.KEYS.DOWN,
        left:     CONFIG.KEYS.LEFT,
        right:    CONFIG.KEYS.RIGHT,
        interact: CONFIG.KEYS.INTERACT,
        cancel:   CONFIG.KEYS.CANCEL,
        menu:     CONFIG.KEYS.MENU,
        run:      ['ShiftLeft', 'ShiftRight']
    };

    // === STATE ===
    const heldKeys   = new Set();  // currently held keys (by code)
    const justPressed = new Set(); // keys pressed this frame
    const justReleased = new Set();
    let enabled = false;

    // === EVENT LISTENERS ===
    function onKeyDown(e) {
        if (!enabled) return;
        if (!heldKeys.has(e.code)) {
            justPressed.add(e.code);
        }
        heldKeys.add(e.code);

        // Prevent default for game keys so page doesn't scroll
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.key)) {
            e.preventDefault();
        }
    }

    function onKeyUp(e) {
        heldKeys.delete(e.code);
        justReleased.add(e.code);
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup',   onKeyUp);

    // === HELPERS ===
    function isHeld(action) {
        const keys = bindings[action];
        if (!keys) return false;
        return keys.some(k => heldKeys.has(k));
    }

    function wasPressed(action) {
        const keys = bindings[action];
        if (!keys) return false;
        return keys.some(k => justPressed.has(k));
    }

    // === UPDATE (call once per frame to flush justPressed) ===
    function update() {
        justPressed.clear();
        justReleased.clear();
    }

    // === MOVEMENT VECTOR ===
    function getMovementVector() {
        let x = 0, y = 0;
        if (isHeld('left'))  x -= 1;
        if (isHeld('right')) x += 1;
        if (isHeld('up'))    y -= 1;
        if (isHeld('down'))  y += 1;

        // Normalize diagonal movement
        if (x !== 0 && y !== 0) {
            const len = Math.SQRT2;
            x /= len;
            y /= len;
        }

        return { x, y };
    }

    // === PUBLIC API ===
    return {
        enable()  { enabled = true;  heldKeys.clear(); justPressed.clear(); },
        disable() { enabled = false; heldKeys.clear(); justPressed.clear(); },
        update,
        getMovementVector,
        isHeld,
        wasPressed,

        // Let keyboard_layouts.js override bindings
        setKeyBindings(newBindings) {
            bindings = { ...bindings, ...newBindings };
        },

        // Expose for debugging
        getHeldKeys: () => Array.from(heldKeys),
        isEnabled:   () => enabled
    };
})();
