/*************************************************************
 * debug_mode.js — Developer Debug / God Mode
 * Toggle: F1
 * Works on AZERTY (Z/Q/S/D movement, IJKL free-cam)
 *************************************************************/

const DebugMode = (function () {
    'use strict';

    // ─────────────────────────────────────────────────
    //  FLAGS
    // ─────────────────────────────────────────────────
    let enabled      = false;
    let noClip       = false;
    let speed3x      = false;
    let showGrid     = false;
    let showColl     = false;   // collision overlay
    let showHitbox   = false;
    let showTrans    = false;   // transition tiles
    let showEntInfo  = false;   // entity labels
    let invincible   = false;
    let freeCamera   = false;
    let mapSelOpen   = false;

    // ─────────────────────────────────────────────────
    //  TIMERS / COUNTERS
    // ─────────────────────────────────────────────────
    let blinkT   = 0;           // for yellow blink effect
    let fpsCount = 0;
    let fps      = 0;
    let fpsAccum = 0;
    let lastT    = performance.now();

    // ─────────────────────────────────────────────────
    //  FREE CAMERA STATE
    // ─────────────────────────────────────────────────
    const FC_SPEED = 160;   // px per second
    const fcKeys   = new Set();   // held keys for free-cam movement
    let   _origCamUpdate = null;

    // ─────────────────────────────────────────────────
    //  FAVORITE MAPS  (keys 1–9)
    // ─────────────────────────────────────────────────
    const FAVS = {
        'Digit1': 'verath_arch',
        'Digit2': 'road',
        'Digit3': 'ashwood_edge',
        'Digit4': 'verath_market',
        'Digit5': 'verath_inn',
        'Digit6': 'verath_smithy',
        'Digit7': 'crossroads',
        'Digit8': 'verath_undercity',
        'Digit9': 'ashwood_hollow'
    };

    // ─────────────────────────────────────────────────
    //  OVERLAY CANVAS  (renders debug visuals)
    // ─────────────────────────────────────────────────
    let overlay    = null;
    let octx       = null;
    let mapSelDiv  = null;

    function createOverlay() {
        const container = document.getElementById('canvas-container');
        if (!container || document.getElementById('debug-overlay')) return;

        overlay = document.createElement('canvas');
        overlay.id = 'debug-overlay';
        overlay.width  = CONFIG.CANVAS_W;
        overlay.height = CONFIG.CANVAS_H;
        overlay.style.cssText = `
            position: absolute; top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            image-rendering: pixelated;
            z-index: 20;
        `;
        container.appendChild(overlay);
        octx = overlay.getContext('2d');

        // Teleport on click
        container.addEventListener('click', onCanvasClick);

        // Map selector div
        mapSelDiv = document.createElement('div');
        mapSelDiv.id = 'debug-map-sel';
        mapSelDiv.style.cssText = `
            display: none;
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: #0d0b18;
            border: 1px solid #4a4870;
            padding: 8px;
            z-index: 30;
            max-height: 80%;
            overflow-y: auto;
            pointer-events: all;
            font-family: monospace;
            font-size: 11px;
            color: #b0accc;
            min-width: 180px;
        `;
        container.appendChild(mapSelDiv);

        startLoop();
    }

    // ─────────────────────────────────────────────────
    //  RENDER LOOP
    // ─────────────────────────────────────────────────
    function startLoop() {
        requestAnimationFrame(loop);
    }

    function loop(now) {
        const dt = Math.min((now - lastT) / 1000, 0.1);
        lastT = now;

        // FPS
        fpsAccum += dt;
        fpsCount++;
        if (fpsAccum >= 0.5) {
            fps = Math.round(fpsCount / fpsAccum);
            fpsCount = 0;
            fpsAccum = 0;
        }

        blinkT += dt;

        octx.clearRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

        if (enabled && typeof Engine !== 'undefined' && Engine.isCanvasMode()) {
            drawWorldOverlays();
            drawHUD();
        }

        requestAnimationFrame(loop);
    }

    // ─────────────────────────────────────────────────
    //  WORLD-SPACE OVERLAYS  (apply camera transform)
    // ─────────────────────────────────────────────────
    function drawWorldOverlays() {
        const cam = (typeof Camera !== 'undefined') ? Camera.getOffset() : { x: 0, y: 0 };
        octx.save();
        octx.translate(-cam.x, -cam.y);

        if (typeof Tilemap !== 'undefined') {
            const W  = (typeof Engine !== 'undefined') ? Engine.CANVAS_TILES_X + 2 : 22;
            const H  = (typeof Engine !== 'undefined') ? Engine.CANVAS_TILES_Y + 2 : 17;
            const T  = CONFIG.TILE;
            const TX = Math.floor(cam.x / T);
            const TY = Math.floor(cam.y / T);

            for (let ty = TY; ty < TY + H; ty++) {
                for (let tx = TX; tx < TX + W; tx++) {
                    const px = tx * T, py = ty * T;

                    if (showColl && Tilemap.isSolid(tx, ty)) {
                        octx.fillStyle = 'rgba(220,40,40,0.28)';
                        octx.fillRect(px, py, T, T);
                    }

                    if (showTrans && typeof Tilemap.getTransitionAt === 'function') {
                        const tr = Tilemap.getTransitionAt(tx, ty);
                        if (tr) {
                            const a = 0.35 + Math.sin(blinkT * 6) * 0.25;
                            octx.fillStyle = `rgba(220,200,40,${a})`;
                            octx.fillRect(px, py, T, T);
                        }
                    }

                    if (showGrid) {
                        octx.strokeStyle = 'rgba(100,90,160,0.30)';
                        octx.lineWidth = 0.5;
                        octx.strokeRect(px, py, T, T);
                        // Tile number
                        if (typeof Tilemap.getTile === 'function') {
                            const tid = Tilemap.getTile(tx, ty);
                            octx.fillStyle = 'rgba(160,150,200,0.55)';
                            octx.font = '5px monospace';
                            octx.fillText(tid, px + 1, py + 6);
                        }
                    }
                }
            }

            // Entity labels & hitboxes
            if ((showEntInfo || showHitbox) && typeof Tilemap.getEntities === 'function') {
                for (const e of Tilemap.getEntities()) {
                    const ex = e.x * T, ey = e.y * T;
                    if (showHitbox) {
                        octx.strokeStyle = '#44ff88';
                        octx.lineWidth = 1;
                        octx.strokeRect(ex, ey, T, T);
                    }
                    if (showEntInfo) {
                        octx.fillStyle = 'rgba(8,6,18,0.75)';
                        octx.fillRect(ex - 4, ey - 12, 48, 10);
                        octx.fillStyle = '#88ffaa';
                        octx.font = '6px monospace';
                        octx.fillText((e.id || e.type) + ' ' + e.x + ',' + e.y, ex - 2, ey - 4);
                    }
                }
            }
        }

        // Player hitbox
        if (showHitbox && typeof Player !== 'undefined') {
            const px = Player.getX(), py = Player.getY();
            octx.strokeStyle = '#ffff44';
            octx.lineWidth = 1;
            const hb = CONFIG.PLAYER_HITBOX;
            octx.strokeRect(px + hb.x, py + hb.y, hb.w, hb.h);   // collision box
            octx.strokeStyle = 'rgba(255,255,60,0.35)';
            octx.strokeRect(px, py, CONFIG.TILE, CONFIG.TILE);     // full tile
        }

        octx.restore();
    }

    // ─────────────────────────────────────────────────
    //  SCREEN-SPACE HUD
    // ─────────────────────────────────────────────────
    function drawHUD() {
        let px = 0, py = 0, tx = 0, ty = 0;
        if (typeof Player !== 'undefined') {
            px = Math.round(Player.getX());
            py = Math.round(Player.getY());
            tx = Player.getTileX();
            ty = Player.getTileY();
        }

        let areaName = '—';
        if (typeof Tilemap !== 'undefined' && Tilemap.getCurrentArea) {
            const id = Tilemap.getCurrentArea();
            if (id) {
                const map = (typeof Maps !== 'undefined') ? Maps.get(id) : null;
                areaName = map ? map.name : id;
            }
        }

        let entCount = 0;
        if (typeof Tilemap !== 'undefined' && Tilemap.getEntities) {
            entCount = Tilemap.getEntities().length;
        }

        // Build badge list
        const badges = [];
        if (noClip)     badges.push('[NO-CLIP]');
        if (speed3x)    badges.push('[SPEED×3]');
        if (invincible) badges.push('[INVINCIBLE]');
        if (freeCamera) badges.push('[FREE-CAM]');

        const lines = [
            '◆ DEBUG MODE',
            'FPS: ' + fps + '   Ents: ' + entCount,
            'POS: ' + px + ',' + py + '  T:' + tx + ',' + ty,
            'Area: ' + areaName,
        ];
        if (badges.length) lines.push(badges.join(' '));

        const panW = 175, lineH = 9;
        const panH = lines.length * lineH + 6;

        octx.fillStyle = 'rgba(8,6,18,0.82)';
        octx.fillRect(2, 2, panW, panH);
        octx.strokeStyle = '#4a4870';
        octx.lineWidth = 1;
        octx.strokeRect(2, 2, panW, panH);

        octx.font = '7px monospace';
        for (let i = 0; i < lines.length; i++) {
            octx.fillStyle = i === 0 ? '#d6bc48'
                           : i === lines.length - 1 && badges.length ? '#88ccff'
                           : '#b0accc';
            octx.fillText(lines[i], 5, 5 + lineH + i * lineH);
        }

        // Shortcut hints at bottom
        octx.fillStyle = 'rgba(8,6,18,0.7)';
        octx.fillRect(2, 228, 316, 10);
        octx.fillStyle = '#585470';
        octx.font = '6px monospace';
        octx.fillText('F2:NoClip  F3:Grid  F4:Coll  F5:Maps  F6:FreeCam  1-9:FavMap', 4, 236);
    }

    // ─────────────────────────────────────────────────
    //  MAP SELECTOR
    // ─────────────────────────────────────────────────
    function openMapSelector() {
        if (!mapSelDiv) return;
        mapSelOpen = true;
        mapSelDiv.style.display = 'block';
        mapSelDiv.innerHTML = '';

        const title = document.createElement('div');
        title.textContent = '— MAP SELECT —';
        title.style.cssText = 'color:#d6bc48;margin-bottom:6px;text-align:center;';
        mapSelDiv.appendChild(title);

        let mapList = [];
        if (typeof Maps !== 'undefined' && Maps.list) {
            mapList = Maps.list();
        }
        if (!mapList.length) {
            // Fallback hardcoded list
            mapList = [
                'verath_arch','verath_market','verath_inn','verath_smithy',
                'verath_columns','verath_undercity','road','crossroads',
                'ashwood_edge','ashwood_hollow','ashwood_shrine',
                'iron_pass','iron_fort','vault_entrance','vault_inner',
                'deep_ruins','arena_floor','catacombs_entry',
            ];
        }

        for (const id of mapList) {
            const btn = document.createElement('button');
            btn.textContent = id;
            btn.style.cssText = `
                display: block; width: 100%; margin: 2px 0;
                background: #181628; color: #b0accc;
                border: 1px solid #363450; padding: 3px 6px;
                cursor: pointer; font-family: monospace; font-size: 10px;
                text-align: left;
            `;
            btn.addEventListener('mouseenter', () => btn.style.background = '#2e2a4a');
            btn.addEventListener('mouseleave', () => btn.style.background = '#181628');
            btn.addEventListener('click', () => { loadMap(id); closeMapSelector(); });
            mapSelDiv.appendChild(btn);
        }

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕ Close';
        closeBtn.style.cssText = `
            display: block; width: 100%; margin-top: 6px;
            background: #2a1a1a; color: #cc8888;
            border: 1px solid #552222; padding: 3px 6px;
            cursor: pointer; font-family: monospace; font-size: 10px;
        `;
        closeBtn.addEventListener('click', closeMapSelector);
        mapSelDiv.appendChild(closeBtn);
    }

    function closeMapSelector() {
        mapSelOpen = false;
        if (mapSelDiv) mapSelDiv.style.display = 'none';
    }

    function loadMap(areaId) {
        console.log('[Debug] Loading map:', areaId);
        if (typeof Tilemap !== 'undefined') Tilemap.loadArea(areaId);
        if (typeof Player !== 'undefined')  Player.syncFromState();
        if (typeof Camera !== 'undefined')  Camera.snapToPlayer();
        if (typeof Engine !== 'undefined' && typeof P !== 'undefined') P.area = areaId;
    }

    // ─────────────────────────────────────────────────
    //  TELEPORT (canvas click)
    // ─────────────────────────────────────────────────
    function onCanvasClick(e) {
        if (!enabled || mapSelOpen) return;

        const container = document.getElementById('canvas-container');
        if (!container) return;

        const rect = container.getBoundingClientRect();
        // Screen position → internal canvas coords (320×240 space)
        const sx = (e.clientX - rect.left) / rect.width  * CONFIG.CANVAS_W;
        const sy = (e.clientY - rect.top)  / rect.height * CONFIG.CANVAS_H;

        // Apply camera offset → world coords
        const cam = (typeof Camera !== 'undefined') ? Camera.getOffset() : { x: 0, y: 0 };
        const wx  = sx + cam.x;
        const wy  = sy + cam.y;

        const ttx = Math.floor(wx / CONFIG.TILE);
        const tty = Math.floor(wy / CONFIG.TILE);

        if (typeof Player !== 'undefined') {
            Player.setPosition(ttx, tty);
            console.log('[Debug] Teleport → tile', ttx, tty);
        }
    }

    // ─────────────────────────────────────────────────
    //  PATCHES
    // ─────────────────────────────────────────────────
    let _origIsSolid    = null;
    let _origGetMov     = null;

    function applyPatches() {
        // No-clip: make Tilemap.isSolid return false
        if (typeof Tilemap !== 'undefined' && !_origIsSolid) {
            _origIsSolid = Tilemap.isSolid;
            Tilemap.isSolid = function (x, y) {
                if (noClip && enabled) return false;
                return _origIsSolid(x, y);
            };
        }

        // Speed ×3: multiply movement vector
        if (typeof Input !== 'undefined' && !_origGetMov) {
            _origGetMov = Input.getMovementVector;
            Input.getMovementVector = function () {
                const v = _origGetMov.call(this);
                if (speed3x && enabled) {
                    return { x: v.x * 3, y: v.y * 3 };
                }
                return v;
            };
        }

        // Free camera: override Camera.update
        if (typeof Camera !== 'undefined' && !_origCamUpdate) {
            _origCamUpdate = Camera.update;
            Camera.update = function (dt) {
                if (freeCamera && enabled) {
                    freeCamUpdate(dt);
                } else {
                    _origCamUpdate.call(this, dt);
                }
            };
        }
    }

    // ─────────────────────────────────────────────────
    //  FREE CAMERA UPDATE
    // ─────────────────────────────────────────────────
    function freeCamUpdate(dt) {
        const cam   = Camera.getOffset();
        let   cx    = cam.x;
        let   cy    = cam.y;
        const speed = FC_SPEED * dt;

        // IJKL movement (layout-independent via e.code)
        if (fcKeys.has('KeyI')) cy -= speed;
        if (fcKeys.has('KeyK')) cy += speed;
        if (fcKeys.has('KeyJ')) cx -= speed;
        if (fcKeys.has('KeyL')) cx += speed;

        // Clamp to map bounds (rough estimate)
        const mw = (typeof Tilemap !== 'undefined' && Tilemap.getWidth)
            ? Tilemap.getWidth()  * CONFIG.TILE : 9999;
        const mh = (typeof Tilemap !== 'undefined' && Tilemap.getHeight)
            ? Tilemap.getHeight() * CONFIG.TILE : 9999;
        cx = Math.max(0, Math.min(cx, mw - CONFIG.CANVAS_W));
        cy = Math.max(0, Math.min(cy, mh - CONFIG.CANVAS_H));

        Camera.setOffset(cx, cy);
    }

    // ─────────────────────────────────────────────────
    //  INVINCIBLE HOOK  (global flag — combat checks this)
    // ─────────────────────────────────────────────────
    // combat_enhanced.js can call DebugMode.isInvincible() to skip damage
    function isInvincible() { return enabled && invincible; }

    // ─────────────────────────────────────────────────
    //  TOGGLE HELPERS
    // ─────────────────────────────────────────────────
    function toggle(key) {
        if      (key === 'main')   { enabled = !enabled; if (!enabled) closeMapSelector(); }
        else if (key === 'noclip') noClip     = !noClip;
        else if (key === 'speed')  speed3x    = !speed3x;
        else if (key === 'grid')   showGrid   = !showGrid;
        else if (key === 'coll')   showColl   = !showColl;
        else if (key === 'hbox')   showHitbox = !showHitbox;
        else if (key === 'trans')  showTrans  = !showTrans;
        else if (key === 'ents')   showEntInfo= !showEntInfo;
        else if (key === 'invinc') invincible = !invincible;
        else if (key === 'cam')    { freeCamera = !freeCamera; if (!freeCamera && typeof Camera !== 'undefined') Camera.snapToPlayer(); }
        savePrefs();
        console.log('[Debug] Toggle:', key, '→', getFlags()[key]);
    }

    function getFlags() {
        return { main: enabled, noclip: noClip, speed: speed3x, grid: showGrid, coll: showColl, hbox: showHitbox, trans: showTrans, ents: showEntInfo, invinc: invincible, cam: freeCamera };
    }

    // ─────────────────────────────────────────────────
    //  PERSISTENCE
    // ─────────────────────────────────────────────────
    function savePrefs() {
        try {
            localStorage.setItem('dbg_prefs', JSON.stringify({
                noClip, speed3x, showGrid, showColl, showHitbox,
                showTrans, showEntInfo, invincible, freeCamera
            }));
        } catch (e) {}
    }

    function loadPrefs() {
        try {
            const p = JSON.parse(localStorage.getItem('dbg_prefs') || '{}');
            noClip      = p.noClip      || false;
            speed3x     = p.speed3x     || false;
            showGrid    = p.showGrid    || false;
            showColl    = p.showColl    || false;
            showHitbox  = p.showHitbox  || false;
            showTrans   = p.showTrans   || false;
            showEntInfo = p.showEntInfo || false;
            invincible  = p.invincible  || false;
            freeCamera  = p.freeCamera  || false;
        } catch (e) {}
    }

    // ─────────────────────────────────────────────────
    //  KEYBOARD HANDLER
    // ─────────────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        // Free-cam keys (tracked independently)
        if (['KeyI', 'KeyJ', 'KeyK', 'KeyL'].includes(e.code)) {
            if (enabled && freeCamera) {
                fcKeys.add(e.code);
                e.preventDefault();
            }
        }

        // F-key shortcuts — only when canvas is in focus / not typing
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'F1':
                e.preventDefault();
                toggle('main');
                console.log('[Debug] Debug mode:', enabled ? 'ON' : 'OFF');
                break;

            case 'F2':
                if (!enabled) break;
                e.preventDefault();
                toggle('noclip');
                break;

            case 'F3':
                if (!enabled) break;
                e.preventDefault();
                // Cycle: grid → grid+collisions → hitboxes → entities → all → none
                if (!showGrid && !showColl && !showHitbox && !showEntInfo && !showTrans) {
                    showGrid = true;
                } else if (showGrid && !showColl) {
                    showColl = true;
                } else if (showColl && !showHitbox) {
                    showHitbox = true; showTrans = true;
                } else if (showHitbox && !showEntInfo) {
                    showEntInfo = true;
                } else {
                    showGrid = showColl = showHitbox = showTrans = showEntInfo = false;
                }
                savePrefs();
                break;

            case 'F4':
                if (!enabled) break;
                e.preventDefault();
                showColl = !showColl;
                savePrefs();
                break;

            case 'F5':
                if (!enabled) break;
                e.preventDefault();
                mapSelOpen ? closeMapSelector() : openMapSelector();
                break;

            case 'F6':
                if (!enabled) break;
                e.preventDefault();
                toggle('cam');
                break;

            case 'F7':
                if (!enabled) break;
                e.preventDefault();
                toggle('invinc');
                break;

            case 'F8':
                if (!enabled) break;
                e.preventDefault();
                toggle('speed');
                break;

            default:
                // 1–9 digit keys: teleport to favourite map
                if (enabled && FAVS[e.code] && !mapSelOpen) {
                    e.preventDefault();
                    loadMap(FAVS[e.code]);
                }
        }

        // Auto-disable if switching back to text mode
        if (e.key === 'm' || e.key === 'M') {
            if (enabled && typeof Engine !== 'undefined' && !Engine.isCanvasMode()) {
                enabled = false;
                closeMapSelector();
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        fcKeys.delete(e.code);
    });

    // ─────────────────────────────────────────────────
    //  INIT
    // ─────────────────────────────────────────────────
    function init() {
        loadPrefs();
        applyPatches();

        const container = document.getElementById('canvas-container');
        if (container) {
            createOverlay();
        } else {
            // canvas-container created after DOMContentLoaded — poll briefly
            let tries = 0;
            const wait = setInterval(() => {
                if (document.getElementById('canvas-container') || ++tries > 30) {
                    clearInterval(wait);
                    createOverlay();
                    applyPatches();
                }
            }, 100);
        }

        console.log('[Debug] Loaded — F1 to toggle, F2–F8 for options');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ─────────────────────────────────────────────────
    //  PUBLIC API
    // ─────────────────────────────────────────────────
    return {
        isEnabled:     () => enabled,
        isNoClip:      () => enabled && noClip,
        isInvincible,
        isSpeedBoost:  () => enabled && speed3x,
        toggle,
        loadMap,

        // Expose for on-screen toggle buttons (optional)
        getFlags,
    };

})();
