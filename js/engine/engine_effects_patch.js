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
    
    // Track if effects are enabled
    let effectsEnabled = true;
    
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
    
    // Update loop — effects/particles/damage-numbers only.
    // Rendering is done by engine.js directly on the main canvas.
    let lastTime = 0;
    function effectsLoop(currentTime) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
        lastTime = currentTime;

        if (Engine.isCanvasMode() && effectsEnabled) {
            let scaledDt = dt;
            if (typeof Effects !== 'undefined') {
                scaledDt = Effects.update(dt);
            }
            if (typeof Particles !== 'undefined') {
                Particles.update(scaledDt);
            }
            if (typeof DamageNumbers !== 'undefined') {
                DamageNumbers.update(scaledDt);
            }
        }

        // Keep overlay canvas clear (engine.js renders effects on main canvas)
        if (effectsOverlay) {
            const ectx = effectsOverlay.getContext('2d');
            ectx.imageSmoothingEnabled = false;
            ectx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
            const x = typeof Player !== 'undefined' ? Player.getX() + 24 : CONFIG.CANVAS_W / 2;
            const y = typeof Player !== 'undefined' ? Player.getY() + 24 : CONFIG.CANVAS_H / 2;
            Particles.blood(x, y);
            Particles.sparks(x, y);
            Particles.shockwave(x, y);
        },
        testDamage: () => {
            const x = typeof Player !== 'undefined' ? Player.getX() + 24 : CONFIG.CANVAS_W / 2;
            const y = typeof Player !== 'undefined' ? Player.getY()      : CONFIG.CANVAS_H / 2;
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