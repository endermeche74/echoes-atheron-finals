/*************************************************************
 * engine_effects_patch.js — Patches Engine for Effects
 * 
 * This modifies the Engine's render loop to include effects.
 * Load AFTER all other engine files including effects_integration.js
 *************************************************************/

(function() {
    
    if (typeof Engine === 'undefined') {
        console.warn('[EnginePatch] Engine not found');
        return;
    }
    
    // Get references we need
    const CANVAS_WIDTH  = CONFIG.CANVAS_W;
    const CANVAS_HEIGHT = CONFIG.CANVAS_H;
    const PALETTE = Engine.PALETTE;
    
    // Store original functions if they exist
    const originalGetCtx = Engine.getCtx;
    
    // Track if we're in canvas mode
    let effectsEnabled = true;
    
    // Override the internal render (we need to inject into game loop)
    // Since Engine uses requestAnimationFrame internally, we'll wrap it
    
    const originalRAF = window.requestAnimationFrame;
    let frameCount = 0;
    
    window.requestAnimationFrame = function(callback) {
        return originalRAF(function(timestamp) {
            // Inject our effects update before the callback
            // This is called every frame
            callback(timestamp);
        });
    };
    
    // Create a render overlay that runs after Engine's render
    const effectsOverlay = document.createElement('canvas');
    effectsOverlay.id = 'effects-overlay';
    effectsOverlay.width = CANVAS_WIDTH;
    effectsOverlay.height = CANVAS_HEIGHT;
    effectsOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
    `;
    
    // Try to add overlay when canvas container exists
    function addOverlay() {
        const container = document.getElementById('canvas-container');
        if (container && !document.getElementById('effects-overlay')) {
            container.appendChild(effectsOverlay);
            console.log('[EnginePatch] Effects overlay added');
            return true;
        }
        return false;
    }
    
    // Render effects on overlay
    function renderEffects() {
        if (!effectsEnabled) return;
        if (!Engine.isCanvasMode()) return;
        
        const ctx = effectsOverlay.getContext('2d');
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Screen effects
        if (typeof Effects !== 'undefined') {
            Effects.render(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }
    
    // Hook into animation frame
    let lastTime = 0;
    function effectsLoop(currentTime) {
        const dt = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        
        if (Engine.isCanvasMode()) {
            // Update effects
            if (typeof Effects !== 'undefined') {
                Effects.update(dt);
            }
            if (typeof Particles !== 'undefined') {
                Particles.update(dt);
            }
            if (typeof DamageNumbers !== 'undefined') {
                DamageNumbers.update(dt);
            }
            
            // Render overlay
            renderEffects();
        }
        
        requestAnimationFrame(effectsLoop);
    }
    
    // Start effects loop
    function init() {
        if (addOverlay()) {
            lastTime = performance.now();
            effectsLoop(lastTime);
            console.log('[EnginePatch] Effects loop started');
        } else {
            // Retry until canvas exists
            setTimeout(init, 100);
        }
    }
    
    // Also need to render particles in world space
    // This requires modifying Engine's render or using EffectsHooks
    
    // Expose control
    window.EngineEffects = {
        enable: () => { effectsEnabled = true; },
        disable: () => { effectsEnabled = false; },
        isEnabled: () => effectsEnabled,
        
        // Manual trigger for testing
        testShake: () => Effects.startShake(5, 0.3),
        testFlash: () => Effects.startFlash('#ff0000', 0.2, 0.5),
        testFade: () => Effects.fadeToBlack(0.5, () => Effects.fadeFromBlack(0.5)),
        testParticles: () => {
            const x = Player ? Player.getX() + 8 : 160;
            const y = Player ? Player.getY() + 8 : 120;
            Particles.blood(x, y);
            Particles.sparks(x, y);
        },
        testDamage: () => {
            const x = Player ? Player.getX() + 8 : 160;
            const y = Player ? Player.getY() : 120;
            DamageNumbers.damage(x, y, 42);
            DamageNumbers.crit(x + 20, y - 10, 99);
        },
        testHit: () => {
            if (Player && Player.onHit) Player.onHit(25, false);
        },
        testCrit: () => {
            if (Player && Player.onHit) Player.onHit(50, true);
        }
    };
    
    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('[EnginePatch] Loaded - use EngineEffects.testShake() etc. to test');
    
})();