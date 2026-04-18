/*************************************************************
 * engine.js — Core Canvas Engine for Echoes of Aethon
 * Handles: canvas setup, game loop, mode switching
 * Style: Fear & Hunger inspired dark pixel aesthetic
 *************************************************************/

const Engine = (function() {
    // === CONFIGURATION (sourced from CONFIG) ===
    const TILE_SIZE      = CONFIG.TILE;
    const CANVAS_TILES_X = CONFIG.GRID_W;
    const CANVAS_TILES_Y = CONFIG.GRID_H;
    const CANVAS_WIDTH   = CONFIG.CANVAS_W;
    const CANVAS_HEIGHT  = CONFIG.CANVAS_H;
    const SCALE          = CONFIG.SCALE;
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
    let canvasEverEntered = false;  // guard: only sync player on very first entry

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
        // Fixed-size centered container, scaled up by CONFIG.SCALE
        canvasContainer = document.createElement('div');
        canvasContainer.id = 'canvas-container';
        canvasContainer.style.cssText = `
            display: none;
            position: relative;
            width: ${CANVAS_WIDTH * SCALE}px;
            height: ${CANVAS_HEIGHT * SCALE}px;
            margin: 0 auto;
            background: ${PALETTE.void};
            border: 2px solid #3a3545;
        `;

        // Internal canvas at native resolution; CSS scales it 2× keeping pixels sharp
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

        // Only load/sync on very first entry — subsequent presses of M keep player where they are
        if (!canvasEverEntered) {
            canvasEverEntered = true;

            // Use P.area (the game's actual state variable) not 'state'
            const startArea = (typeof P !== 'undefined' && P.area) ? P.area : 'verath_arch';
            if (typeof Tilemap !== 'undefined') {
                Tilemap.loadArea(startArea);
            }
            if (typeof Player !== 'undefined') {
                Player.syncFromState();
            }
        }

        // Snap camera to player AFTER player is positioned
        if (typeof Camera !== 'undefined') {
            Camera.snapToPlayer();
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

        // Cap accumulator — prevents cooldowns draining after tab-switch/pause
        if (accumulator > FRAME_TIME * 5) accumulator = FRAME_TIME * 5;

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
        // Resolve area name: prefer map's human-readable name, fall back to ID
        let areaName = 'UNKNOWN';
        if (typeof Tilemap !== 'undefined' && Tilemap.getCurrentArea) {
            const areaId = Tilemap.getCurrentArea();
            if (areaId) {
                const mapObj = (typeof Maps !== 'undefined') ? Maps.get(areaId) : null;
                areaName = mapObj ? mapObj.name.toUpperCase()
                                  : areaId.replace(/_/g, ' ').toUpperCase();
            }
        } else if (typeof P !== 'undefined' && P.area) {
            areaName = P.area.replace(/_/g, ' ').toUpperCase();
        }

        // Zone name — top left
        ctx.fillStyle = 'rgba(21, 19, 24, 0.8)';
        ctx.fillRect(4, 4, 150, 24);
        ctx.strokeStyle = PALETTE.uiBorder;
        ctx.strokeRect(4, 4, 150, 24);
        ctx.fillStyle = PALETTE.uiText;
        ctx.font = '14px monospace';
        ctx.fillText(areaName, 10, 20);

        // Controls hint — bottom left
        ctx.fillStyle = 'rgba(21, 19, 24, 0.6)';
        ctx.fillRect(4, CANVAS_HEIGHT - 28, 260, 24);
        ctx.fillStyle = '#808080';
        ctx.font = '12px monospace';
        ctx.fillText('ZQSD:Move  E:Interact  I:Inventory', 8, CANVAS_HEIGHT - 12);

        // Minimap
        if (typeof Minimap !== 'undefined') {
            Minimap.render(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
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
            // Update game state area (P is the state object, goArea wraps it)
            if (typeof goArea === 'function') {
                goArea(areaId);
            } else if (typeof P !== 'undefined') {
                P.area = areaId;
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