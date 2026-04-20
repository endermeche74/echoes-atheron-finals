/*************************************************************
 * engine.js — Core Canvas Engine for Echoes of Aethon
 * 100 % canvas — no text mode.
 *************************************************************/

const Engine = (function() {

    // === CONFIGURATION ===
    const TILE_SIZE      = CONFIG.TILE;
    const CANVAS_TILES_X = CONFIG.GRID_W;
    const CANVAS_TILES_Y = CONFIG.GRID_H;
    const CANVAS_WIDTH   = CONFIG.CANVAS_W;
    const CANVAS_HEIGHT  = CONFIG.CANVAS_H;
    const SCALE          = CONFIG.SCALE;
    const TARGET_FPS     = 60;
    const FRAME_TIME     = 1000 / TARGET_FPS;

    // === PALETTE ===
    const PALETTE = {
        void:        '#0a0a0f',
        night:       '#12111a',
        shadow:      '#1a1820',
        stone:       '#2a2833',
        wall:        '#3d3a4a',
        wallLight:   '#4a4658',
        brick:       '#4a3c3c',
        wood:        '#3d3020',
        dirt:        '#2d2418',
        grass:       '#1d2a1a',
        path:        '#3a3428',
        water:       '#1a2030',
        blood:       '#6a1a1a',
        rust:        '#5a3020',
        moss:        '#2a3a20',
        gold:        '#8a7030',
        player:      '#9a8a7a',
        npc:         '#7a6a5a',
        enemy:       '#5a3030',
        item:        '#7a7040',
        uiBg:        '#151318',
        uiBorder:    '#3a3545',
        uiText:      '#a09a90',
        uiHighlight: '#c0b8a0'
    };

    // === STATE ===
    let canvas          = null;
    let ctx             = null;
    let isRunning       = false;
    let lastTime        = 0;
    let accumulator     = 0;
    let canvasContainer = null;

    // === INIT ===
    function init() {
        _createCanvas();

        // Load starting area
        const startArea = (typeof P !== 'undefined' && P.area) ? P.area : 'verath_arch';
        if (typeof Tilemap !== 'undefined') Tilemap.loadArea(startArea);
        if (typeof Player  !== 'undefined') Player.syncFromState();
        if (typeof Camera  !== 'undefined') Camera.snapToPlayer();

        // Enable input
        if (typeof Input !== 'undefined') Input.enable();

        // Start loop
        isRunning = true;
        lastTime  = performance.now();
        requestAnimationFrame(gameLoop);

        console.log('[Engine] Started — canvas 100 %');
    }

    function _createCanvas() {
        canvasContainer = document.createElement('div');
        canvasContainer.id = 'canvas-container';
        canvasContainer.style.cssText = `
            display: block;
            position: relative;
            width: ${CANVAS_WIDTH * SCALE}px;
            height: ${CANVAS_HEIGHT * SCALE}px;
            margin: 0 auto;
            background: ${PALETTE.void};
        `;

        canvas = document.createElement('canvas');
        canvas.id    = 'game-canvas';
        canvas.width  = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
            display: block;
        `;

        canvasContainer.appendChild(canvas);
        document.body.appendChild(canvasContainer);

        ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
    }

    // === GAME LOOP ===
    function gameLoop(currentTime) {
        if (!isRunning) return;

        const deltaTime = currentTime - lastTime;
        lastTime        = currentTime;
        accumulator    += deltaTime;

        // Cap to avoid spiral-of-death after tab-switch
        if (accumulator > FRAME_TIME * 5) accumulator = FRAME_TIME * 5;

        while (accumulator >= FRAME_TIME) {
            update(FRAME_TIME / 1000);
            accumulator -= FRAME_TIME;
        }

        render();
        requestAnimationFrame(gameLoop);
    }

    // === UPDATE ===
    function update(dt) {
        // Overlay systems pause normal gameplay — highest priority first
        if (typeof CombatFull !== 'undefined' && CombatFull.isActive()) {
            CombatFull.update(dt);
            if (typeof Input !== 'undefined') Input.update();
            return;
        }
        if (typeof DialogueCanvas !== 'undefined' && DialogueCanvas.isActive()) {
            DialogueCanvas.update(dt);
            if (typeof Input !== 'undefined') Input.update();
            return;
        }
        if (typeof InventoryCanvas !== 'undefined' && InventoryCanvas.isActive()) {
            if (typeof Input !== 'undefined') Input.update();
            return;
        }

        // Normal gameplay
        if (typeof Player  !== 'undefined') Player.update(dt);
        if (typeof Camera  !== 'undefined') Camera.update(dt);
        if (typeof Input   !== 'undefined') Input.update();
    }

    // === RENDER ===
    function render() {
        ctx.fillStyle = PALETTE.void;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // ── World space (camera + shake + zoom) ──────────────
        ctx.save();

        if (typeof Effects !== 'undefined') {
            const sh = Effects.getShakeOffset();
            if (sh.x !== 0 || sh.y !== 0) ctx.translate(sh.x, sh.y);
            Effects.applyZoom(ctx, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        }

        if (typeof Camera !== 'undefined') {
            const cam = Camera.getOffset();
            ctx.translate(-cam.x, -cam.y);
        }

        if (typeof Tilemap !== 'undefined') {
            Tilemap.render(ctx);
            Tilemap.renderEntities(ctx);
        }
        if (typeof Player !== 'undefined') Player.render(ctx);

        // Particles & damage numbers live in world space
        if (typeof Particles     !== 'undefined') Particles.render(ctx);
        if (typeof DamageNumbers !== 'undefined') DamageNumbers.render(ctx);

        ctx.restore();

        // ── Screen space UI ───────────────────────────────────
        renderUI();

        // ── Screen overlay effects (flash, vignette, fade, wipe) ─
        if (typeof Effects !== 'undefined') Effects.render(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

        // ── Canvas overlays (drawn on top of everything) ──────
        if (typeof DialogueCanvas !== 'undefined' && DialogueCanvas.isActive())
            DialogueCanvas.render(ctx);
        if (typeof CombatFull !== 'undefined' && CombatFull.isActive())
            CombatFull.render(ctx);
        // InventoryCanvas is self-rendering on its own overlay canvas (z-index 16)
    }

    // === HUD ===
    function renderUI() {
        // Area name — top left
        let areaName = '';
        if (typeof Tilemap !== 'undefined' && Tilemap.getCurrentArea) {
            const id = Tilemap.getCurrentArea();
            if (id) {
                const m = (typeof Maps !== 'undefined') ? Maps.get(id) : null;
                areaName = m ? m.name.toUpperCase() : id.replace(/_/g, ' ').toUpperCase();
            }
        } else if (typeof P !== 'undefined' && P.area) {
            areaName = P.area.replace(/_/g, ' ').toUpperCase();
        }

        if (areaName) {
            ctx.fillStyle = 'rgba(21,19,24,0.82)';
            ctx.fillRect(4, 4, 154, 22);
            ctx.strokeStyle = PALETTE.uiBorder;
            ctx.lineWidth   = 1;
            ctx.strokeRect(4, 4, 154, 22);
            ctx.fillStyle = PALETTE.uiText;
            ctx.font      = '13px monospace';
            ctx.fillText(areaName, 10, 19);
        }

        // HP / MP bars — bottom left
        if (typeof P !== 'undefined' && typeof UI_HD !== 'undefined') {
            const hp    = P.hp    || 0, maxHp = P.maxHp || P.hpMax || 1;
            const mp    = P.mp    || 0, maxMp = P.maxMp || P.mpMax || 1;
            UI_HD.drawBar(ctx, 4, CANVAS_HEIGHT - 44, 128, 13, hp, maxHp, 'health', 'HP');
            UI_HD.drawBar(ctx, 4, CANVAS_HEIGHT - 28, 128, 13, mp, maxMp, 'mana',   'MP');
        }

        // Controls hint — bottom (avoids bars)
        ctx.fillStyle = 'rgba(21,19,24,0.55)';
        ctx.fillRect(136, CANVAS_HEIGHT - 16, 248, 13);
        ctx.fillStyle = '#686868';
        ctx.font      = '9px monospace';
        ctx.fillText('ZQSD Move  E Interact  I Inventory  F1 Debug', 140, CANVAS_HEIGHT - 6);

        // Minimap
        if (typeof Minimap !== 'undefined') Minimap.render(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // === PUBLIC API ===
    return {
        init,
        getCtx:    () => ctx,
        getCanvas: () => canvas,
        isCanvasMode: () => true,   // always canvas

        // Constants
        TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_TILES_X, CANVAS_TILES_Y, PALETTE,

        // Game triggers — stay in canvas
        triggerCombat: (enemyId) => {
            console.log('[Engine] Combat →', enemyId);
            // combat_enhanced.js overwrites this; fallback stub below
            if (typeof startCombat === 'function') startCombat(enemyId);
        },

        triggerDialogue: (npcId) => {
            console.log('[Engine] Dialogue →', npcId);
            if (typeof startDialogue === 'function') startDialogue(npcId);
        },

        triggerAreaChange: (areaId, spawnX, spawnY) => {
            console.log('[Engine] Area →', areaId);
            if (typeof goArea === 'function') goArea(areaId);
            else if (typeof P !== 'undefined') P.area = areaId;
            if (typeof Tilemap !== 'undefined') Tilemap.loadArea(areaId);
            if (typeof Player  !== 'undefined') {
                (spawnX !== undefined && spawnY !== undefined)
                    ? Player.setPosition(spawnX, spawnY)
                    : Player.syncFromState();
            }
            if (typeof Camera !== 'undefined') Camera.snapToPlayer();
        }
    };

})();

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Engine.init());
} else {
    Engine.init();
}
