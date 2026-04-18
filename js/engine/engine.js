/*************************************************************
 * engine.js — Core Canvas Engine for Echoes of Aethon
 * Handles: canvas setup, game loop, mode switching
 * Style: Fear & Hunger inspired dark pixel aesthetic
 *************************************************************/

const Engine = (function() {
    // === CONFIGURATION ===
    const TILE_SIZE = 16;
    const CANVAS_TILES_X = 20;  // 320px wide
    const CANVAS_TILES_Y = 15;  // 240px tall
    const CANVAS_WIDTH = CANVAS_TILES_X * TILE_SIZE;
    const CANVAS_HEIGHT = CANVAS_TILES_Y * TILE_SIZE;
    const SCALE = 2;  // 2x upscale for crisp pixels (640x480 display)
    const TARGET_FPS = 60;
    const FRAME_TIME = 1000 / TARGET_FPS;

    // === DARK PALETTE (Fear & Hunger inspired) ===
    const PALETTE = {
        // Backgrounds
        void:       '#0a0a0f',
        night:      '#12111a',
        shadow:     '#1a1820',
        stone:      '#2a2833',
        
        // Walls & structures
        wall:       '#3d3a4a',
        wallLight:  '#4a4658',
        brick:      '#4a3c3c',
        wood:       '#3d3020',
        
        // Ground
        dirt:       '#2d2418',
        grass:      '#1d2a1a',
        path:       '#3a3428',
        water:      '#1a2030',
        
        // Accents
        blood:      '#6a1a1a',
        rust:       '#5a3020',
        moss:       '#2a3a20',
        gold:       '#8a7030',
        
        // Entities
        player:     '#9a8a7a',
        npc:        '#7a6a5a',
        enemy:      '#5a3030',
        item:       '#7a7040',
        
        // UI
        uiBg:       '#151318',
        uiBorder:   '#3a3545',
        uiText:     '#a09a90',
        uiHighlight:'#c0b8a0'
    };

    // === STATE ===
    let canvas = null;
    let ctx = null;
    let isRunning = false;
    let lastTime = 0;
    let accumulator = 0;
    let currentMode = 'text';  // 'text' or 'canvas'
    let canvasContainer = null;
    let textContainer = null;

    // === INITIALIZATION ===
    function init() {
        createCanvas();
        createModeToggle();
        
        // Don't auto-start — wait for mode switch
        console.log('[Engine] Initialized. Press [M] or click toggle to enter canvas mode.');
        
        // Global keyboard listener for mode toggle
        document.addEventListener('keydown', (e) => {
            if (e.key === 'm' || e.key === 'M') {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    toggleMode();
                }
            }
        });
    }

    function createCanvas() {
        // Fullscreen overlay container
        canvasContainer = document.createElement('div');
        canvasContainer.id = 'canvas-container';
        canvasContainer.style.cssText = `
            display: none;
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            z-index: 500;
            background: ${PALETTE.void};
            image-rendering: pixelated;
            image-rendering: crisp-edges;
        `;

        // Canvas fills the container — CSS scales it, keeping pixel art sharp
        canvas = document.createElement('canvas');
        canvas.id = 'game-canvas';
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
        `;

        canvasContainer.appendChild(canvas);
        document.body.appendChild(canvasContainer);

        // Remember the page UI so we can hide/show it
        textContainer = document.getElementById('app') ||
                        document.getElementById('body') ||
                        document.querySelector('header')?.parentElement;

        // Get context
        ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
    }

    function createModeToggle() {
        const toggle = document.createElement('button');
        toggle.id = 'mode-toggle';
        toggle.textContent = '🎮 Canvas Mode [M]';
        toggle.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 16px;
            background: ${PALETTE.uiBg};
            color: ${PALETTE.uiText};
            border: 1px solid ${PALETTE.uiBorder};
            border-radius: 4px;
            cursor: pointer;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            transition: all 0.2s;
        `;
        toggle.addEventListener('mouseenter', () => {
            toggle.style.background = PALETTE.wall;
        });
        toggle.addEventListener('mouseleave', () => {
            toggle.style.background = PALETTE.uiBg;
        });
        toggle.addEventListener('click', toggleMode);
        document.body.appendChild(toggle);
    }

    // === MODE SWITCHING ===
    function toggleMode() {
        if (currentMode === 'text') {
            enterCanvasMode();
        } else {
            enterTextMode();
        }
    }

    function enterCanvasMode() {
        currentMode = 'canvas';
        
        // Hide text UI, show canvas
        if (textContainer) textContainer.style.display = 'none';
        canvasContainer.style.display = 'block';
        
        // Update toggle button
        const toggle = document.getElementById('mode-toggle');
        if (toggle) toggle.textContent = '📜 Text Mode [M]';
        
        // Start game loop
        if (!isRunning) {
            isRunning = true;
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
        
        // Load initial area
        if (typeof Tilemap !== 'undefined') {
            const startArea = (typeof state !== 'undefined' && state.area) ? state.area : 'verath_arch';
            Tilemap.loadArea(startArea);
        }
        
        // Initialize player position from current area
        if (typeof Player !== 'undefined') {
            Player.syncFromState();
        }
        
        // Enable input
        if (typeof Input !== 'undefined') {
            Input.enable();
        }
        
        console.log('[Engine] Entered canvas mode');
    }

    function enterTextMode() {
        currentMode = 'text';
        
        // Hide canvas, show text UI
        canvasContainer.style.display = 'none';
        if (textContainer) textContainer.style.display = 'block';
        
        // Update toggle button
        const toggle = document.getElementById('mode-toggle');
        if (toggle) toggle.textContent = '🎮 Canvas Mode [M]';
        
        // Disable input (let text UI handle it)
        if (typeof Input !== 'undefined') {
            Input.disable();
        }
        
        // Keep game loop running for background updates? Or pause?
        // For now, let it run but skip rendering
        
        console.log('[Engine] Entered text mode');
    }

    // === GAME LOOP ===
    function gameLoop(currentTime) {
        if (!isRunning) return;

        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        accumulator += deltaTime;

        // Fixed timestep updates
        while (accumulator >= FRAME_TIME) {
            update(FRAME_TIME / 1000);  // Convert to seconds
            accumulator -= FRAME_TIME;
        }

        // Render
        if (currentMode === 'canvas') {
            render();
        }

        requestAnimationFrame(gameLoop);
    }

    function update(dt) {
        if (currentMode !== 'canvas') return;

        // Update player (reads Input before clearing justPressed)
        if (typeof Player !== 'undefined') {
            Player.update(dt);
        }

        // Update camera
        if (typeof Camera !== 'undefined') {
            Camera.update(dt);
        }

        // Clear per-frame input state AFTER systems have consumed it
        if (typeof Input !== 'undefined') {
            Input.update();
        }
    }

    function render() {
        // Clear with void color
        ctx.fillStyle = PALETTE.void;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Save context for camera transform
        ctx.save();
        
        // Apply camera offset
        if (typeof Camera !== 'undefined') {
            const cam = Camera.getOffset();
            ctx.translate(-cam.x, -cam.y);
        }
        
        // Render tilemap
        if (typeof Tilemap !== 'undefined') {
            Tilemap.render(ctx);
        }
        
        // Render entities (NPCs, items)
        if (typeof Tilemap !== 'undefined') {
            Tilemap.renderEntities(ctx);
        }
        
        // Render player
        if (typeof Player !== 'undefined') {
            Player.render(ctx);
        }
        
        // Restore context
        ctx.restore();
        
        // Render UI overlay (not affected by camera)
        renderUI();
    }

    function renderUI() {
        // Area name
        const areaName = typeof state !== 'undefined' ? 
            (state.area || 'Unknown').replace(/_/g, ' ').toUpperCase() : 
            'UNKNOWN';
        
        ctx.fillStyle = PALETTE.uiBg + 'cc';
        ctx.fillRect(4, 4, 120, 18);
        ctx.strokeStyle = PALETTE.uiBorder;
        ctx.strokeRect(4, 4, 120, 18);
        
        ctx.fillStyle = PALETTE.uiText;
        ctx.font = '10px monospace';
        ctx.fillText(areaName, 8, 16);
        
        // Controls hint
        ctx.fillStyle = PALETTE.uiBg + '99';
        ctx.fillRect(4, CANVAS_HEIGHT - 22, 140, 18);
        ctx.fillStyle = PALETTE.uiText;
        ctx.font = '8px monospace';
        ctx.fillText('WASD:Move E:Interact M:Menu', 6, CANVAS_HEIGHT - 10);
    }

    // === PUBLIC API ===
    return {
        init,
        toggleMode,
        enterCanvasMode,
        enterTextMode,
        getMode: () => currentMode,
        getCtx: () => ctx,
        getCanvas: () => canvas,
        isCanvasMode: () => currentMode === 'canvas',
        
        // Constants
        TILE_SIZE,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        CANVAS_TILES_X,
        CANVAS_TILES_Y,
        PALETTE,
        
        // Trigger game systems from canvas events
        triggerCombat: (enemyId) => {
            console.log('[Engine] Combat triggered:', enemyId);
            enterTextMode();
            if (typeof startCombat === 'function') {
                startCombat(enemyId);
            }
        },
        
        triggerDialogue: (npcId) => {
            console.log('[Engine] Dialogue triggered:', npcId);
            enterTextMode();
            if (typeof startDialogue === 'function') {
                startDialogue(npcId);
            }
        },
        
        triggerAreaChange: (areaId, spawnX, spawnY) => {
            console.log('[Engine] Area change:', areaId, spawnX, spawnY);
            if (typeof goArea === 'function') {
                goArea(areaId);
            }
            if (typeof Tilemap !== 'undefined') {
                Tilemap.loadArea(areaId);
            }
            if (typeof Player !== 'undefined') {
                if (spawnX !== undefined && spawnY !== undefined) {
                    Player.setPosition(spawnX, spawnY);
                } else {
                    Player.syncFromState();
                }
            }
            if (typeof Camera !== 'undefined') {
                Camera.snapToPlayer();
            }
        }
    };
})();

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Engine.init());
} else {
    Engine.init();
}