/*************************************************************
 * ui_systems_integration.js — Integrates enhanced UI systems
 * Load LAST after all other engine files
 *************************************************************/

(function() {
    
    // Create overlay canvas for UI systems
    const uiCanvas = document.createElement('canvas');
    uiCanvas.id = 'ui-overlay';
    uiCanvas.width = 320;
    uiCanvas.height = 240;
    uiCanvas.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        image-rendering: pixelated;
    `;
    
    function init() {
        const container = document.getElementById('canvas-container');
        if (container && !document.getElementById('ui-overlay')) {
            container.appendChild(uiCanvas);
            startLoop();
            console.log('[UIIntegration] Overlay added');
            return true;
        }
        return false;
    }
    
    let lastTime = 0;
    function loop(time) {
        const dt = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;
        
        if (typeof Engine === 'undefined' || !Engine.isCanvasMode || !Engine.isCanvasMode()) {
            requestAnimationFrame(loop);
            return;
        }
        
        const ctx = uiCanvas.getContext('2d');
        ctx.clearRect(0, 0, 320, 240);
        
        // Update systems
        if (typeof CombatEnhanced !== 'undefined') CombatEnhanced.update(dt);
        if (typeof InventoryCanvas !== 'undefined') InventoryCanvas.update(dt);
        
        // Render UI layers (order matters)
        if (typeof CombatEnhanced !== 'undefined' && CombatEnhanced.isActive()) {
            CombatEnhanced.render(ctx);
        }
        
        if (typeof InventoryCanvas !== 'undefined' && InventoryCanvas.isActive()) {
            InventoryCanvas.render(ctx);
        }
        
        requestAnimationFrame(loop);
    }
    
    function startLoop() {
        lastTime = performance.now();
        requestAnimationFrame(loop);
    }
    
    // Override tilemap entity rendering to use detailed sprites
    if (typeof Tilemap !== 'undefined') {
        const origRenderEntities = Tilemap.renderEntities;
        Tilemap.renderEntities = function(ctx) {
            const entities = Tilemap.getEntities ? Tilemap.getEntities() : [];
            
            for (const e of entities) {
                const px = e.x * 16;
                const py = e.y * 16;
                
                // Try detailed sprite first
                if (typeof SpriteSheet !== 'undefined' && e.sprite) {
                    SpriteSheet.render(ctx, e.sprite, px, py);
                } else {
                    // Fallback to original
                    origRenderEntities.call(Tilemap, ctx);
                    return;
                }
            }
        };
    }
    
    // Hook combat trigger to use enhanced combat
    if (typeof Engine !== 'undefined') {
        Engine.triggerCombat = function(enemyId) {
            const ENEMIES = {
                wolf: { name: 'Wolf', hp: 35, atk: 8, def: 2, sprite: 'wolf' },
                bandit: { name: 'Bandit', hp: 45, atk: 12, def: 4, sprite: 'bandit' },
                undead: { name: 'Undead', hp: 50, atk: 11, def: 5, sprite: 'undead' },
                spirit: { name: 'Spirit', hp: 30, atk: 14, def: 2, sprite: 'spirit' },
                boss: { name: 'Dark Guardian', hp: 150, atk: 20, def: 10, sprite: 'boss', boss: true }
            };
            
            const data = ENEMIES[enemyId] || { name: enemyId, hp: 40, atk: 10, def: 3, sprite: 'bandit' };
            
            if (typeof CombatEnhanced !== 'undefined') {
                CombatEnhanced.start(data);
            }
        };
    }
    
    // Test function
    window.testEnhancedCombat = function(enemy = 'bandit') {
        Engine.triggerCombat(enemy);
    };
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init() || setTimeout(init, 100));
    } else {
        init() || setTimeout(init, 100);
    }
    
    console.log('[UIIntegration] Ready');
    console.log('  - testEnhancedCombat("bandit") to test combat');
    console.log('  - Press I for inventory');
    
})();