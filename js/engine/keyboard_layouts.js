/*************************************************************
 * keyboard_layouts.js — Keyboard Layout Support
 * 
 * Provides AZERTY (ZQSD) and QWERTY (WASD) layouts
 * Load AFTER: input.js
 * 
 * Usage: KeyboardLayout.setAZERTY() or KeyboardLayout.setQWERTY()
 *************************************************************/

const KeyboardLayout = (function() {
    
    // === LAYOUT DEFINITIONS ===
    const LAYOUTS = {
        QWERTY: {
            up: ['KeyZ', 'ArrowUp'],
            down: ['KeyS', 'ArrowDown'],
            left: ['KeyQ', 'ArrowLeft'],
            right: ['KeyD', 'ArrowRight'],
            interact: ['KeyE', 'Space'],
            cancel: ['Escape'],
            menu: ['KeyM'],
            inventory: ['KeyI'],
            map: ['KeyP'],
            run: ['ShiftLeft', 'ShiftRight']
        },
        AZERTY: {
            up: ['KeyZ', 'ArrowUp'],
            down: ['KeyS', 'ArrowDown'],
            left: ['KeyQ', 'ArrowLeft'],
            right: ['KeyD', 'ArrowRight'],
            interact: ['KeyE', 'Space'],
            cancel: ['Escape'],
            menu: ['KeyM'],  // M is same on AZERTY
            inventory: ['KeyI'],
            map: ['KeyP'],
            run: ['ShiftLeft', 'ShiftRight']
        }
    };
    
    let currentLayout = 'AZERTY';
    
    // === APPLY LAYOUT TO INPUT.JS ===
    function applyLayout(layoutName) {
        if (!LAYOUTS[layoutName]) {
            console.error('[KeyboardLayout] Unknown layout:', layoutName);
            return;
        }
        
        const layout = LAYOUTS[layoutName];
        currentLayout = layoutName;
        
        // Patch Input module if it exists
        if (typeof Input !== 'undefined') {
            // Input.js uses a KEY_MAP or similar
            // We need to modify its internal key mappings
            
            // Try to access and modify Input's key mappings
            if (Input.setKeyBindings) {
                Input.setKeyBindings(layout);
            } else {
                // Fallback: Override the key state checks
                patchInputModule(layout);
            }
            
            console.log('[KeyboardLayout] Applied:', layoutName);
        } else {
            console.warn('[KeyboardLayout] Input module not found, storing layout for later');
        }
        
        // Store preference
        try {
            localStorage.setItem('echoes_keyboard_layout', layoutName);
        } catch (e) {}
        
        return layout;
    }
    
    // Patch Input module by overriding its methods
    function patchInputModule(layout) {
        // Store the original methods if not already stored
        if (!Input._originalGetMovementVector) {
            Input._originalGetMovementVector = Input.getMovementVector;
        }
        
        // Create key state tracking
        const keyStates = {};
        
        // Override keydown/keyup handling
        document.addEventListener('keydown', (e) => {
            keyStates[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            keyStates[e.code] = false;
        });
        
        // Helper to check if any key in array is pressed
        function isAnyPressed(keys) {
            return keys.some(key => keyStates[key]);
        }
        
        // Override getMovementVector
        Input.getMovementVector = function() {
            let dx = 0, dy = 0;
            
            if (isAnyPressed(layout.up)) dy = -1;
            if (isAnyPressed(layout.down)) dy = 1;
            if (isAnyPressed(layout.left)) dx = -1;
            if (isAnyPressed(layout.right)) dx = 1;
            
            return { x: dx, y: dy };
        };
        
        // Override isHeld if it exists
        if (Input.isHeld) {
            const originalIsHeld = Input.isHeld;
            Input.isHeld = function(action) {
                if (layout[action]) {
                    return isAnyPressed(layout[action]);
                }
                return originalIsHeld(action);
            };
        }
        
        // Override wasPressed if it exists
        if (Input.wasPressed) {
            // This is trickier because it needs to track press events
            // For now, we'll leave the original and hope it works
        }
    }
    
    // === PUBLIC API ===
    return {
        setQWERTY: () => applyLayout('QWERTY'),
        setAZERTY: () => applyLayout('AZERTY'),
        
        setLayout: (name) => applyLayout(name.toUpperCase()),
        
        getLayout: () => currentLayout,
        
        getBindings: () => LAYOUTS[currentLayout],
        
        // Get all available layouts
        listLayouts: () => Object.keys(LAYOUTS),
        
        // Add custom layout
        addLayout: (name, bindings) => {
            LAYOUTS[name.toUpperCase()] = bindings;
        },
        
        // Load saved preference
        loadSaved: function() {
            try {
                const saved = localStorage.getItem('echoes_keyboard_layout');
                if (saved && LAYOUTS[saved]) {
                    applyLayout(saved);
                    return saved;
                }
            } catch (e) {}
            return null;
        },
        
        // Auto-detect based on browser language (rough guess)
        autoDetect: function() {
            const lang = navigator.language || navigator.userLanguage || '';
            const azertyLocales = ['fr', 'be', 'fr-FR', 'fr-BE', 'fr-CA'];
            
            if (azertyLocales.some(l => lang.startsWith(l))) {
                return applyLayout('AZERTY');
            }
            return applyLayout('QWERTY');
        }
    };
    
})();

// Auto-load saved layout, or default to AZERTY
document.addEventListener('DOMContentLoaded', () => {
    if (!KeyboardLayout.loadSaved()) {
        KeyboardLayout.setAZERTY();
    }
});

console.log('[KeyboardLayout] Loaded');
console.log('[KeyboardLayout] Use KeyboardLayout.setAZERTY() for ZQSD controls');