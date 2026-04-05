/*************************************************************
 * polish_integration.js — Hooks polish systems into game
 *************************************************************/

(function() {
    
    // Create overlay canvas
    const overlay = document.createElement('canvas');
    overlay.id = 'polish-overlay';
    overlay.width = 320;
    overlay.height = 240;
    overlay.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        image-rendering: pixelated;
    `;
    
    function init() {
        const container = document.getElementById('canvas-container');
        if (container && !document.getElementById('polish-overlay')) {
            container.appendChild(overlay);
            startLoop();
            return true;
        }
        return false;
    }
    
    let lastTime = 0;
    function loop(t) {
        const dt = Math.min((t - lastTime) / 1000, 0.1);
        lastTime = t;
        
        if (typeof Engine !== 'undefined' && Engine.isCanvasMode && Engine.isCanvasMode()) {
            const ctx = overlay.getContext('2d');
            ctx.clearRect(0, 0, 320, 240);
            
            let camX = 0, camY = 0;
            if (typeof Camera !== 'undefined' && Camera.getOffset) {
                const c = Camera.getOffset();
                camX = c.x; camY = c.y;
            }
            
            // Update
            if (typeof UIPolish !== 'undefined') UIPolish.update(dt);
            if (typeof Cutscene !== 'undefined') Cutscene.update(dt);
            
            // Render
            if (typeof Minimap !== 'undefined') Minimap.render(ctx, 320, 240);
            if (typeof UIPolish !== 'undefined') UIPolish.render(ctx, 320, 240, camX, camY);
            if (typeof Cutscene !== 'undefined') Cutscene.render(ctx, 320, 240);
        }
        
        requestAnimationFrame(loop);
    }
    
    function startLoop() {
        lastTime = performance.now();
        requestAnimationFrame(loop);
    }
    
    // Hook interaction prompt into player
    if (typeof Player !== 'undefined' && typeof UIPolish !== 'undefined') {
        const origUpdate = Player.update;
        Player.update = function(dt) {
            origUpdate(dt);
            
            if (typeof Tilemap !== 'undefined') {
                const tx = Player.getTileX();
                const ty = Player.getTileY();
                const facing = Player.getFacing();
                let cx = tx, cy = ty;
                if (facing === 'up') cy--;
                else if (facing === 'down') cy++;
                else if (facing === 'left') cx--;
                else if (facing === 'right') cx++;
                
                const entity = Tilemap.getEntityAt(cx, cy);
                UIPolish.setInteractTarget(entity);
            }
        };
    }
    
    // Hook boss intro into combat
    if (typeof CombatCanvas !== 'undefined' && typeof Cutscene !== 'undefined') {
        const origStart = CombatCanvas.start;
        CombatCanvas.start = function(data) {
            if (data.boss) {
                Cutscene.showBossIntro(data.name, data.subtitle || 'Prepare yourself');
                Cutscene.setOnComplete(() => origStart(data));
            } else {
                origStart(data);
            }
        };
    }
    
    // Global helpers
    window.say = (speaker, text) => Cutscene.showDialogue(speaker, text);
    window.notify = (text, type) => UIPolish.notify(text, type);
    window.bubble = (x, y, text) => UIPolish.showBubble(x, y, text);
    
    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init() || setTimeout(init, 100));
    } else {
        init() || setTimeout(init, 100);
    }
    
    console.log('[PolishIntegration] Ready');
    
})();