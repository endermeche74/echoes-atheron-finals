/*************************************************************
 * tilemap.js — Tilemap Renderer & Collision
 * Handles: tile rendering, collision detection, entity placement
 *************************************************************/

const Tilemap = (function() {
    const TILE = CONFIG.TILE;
    
    // === TILE TYPES ===
    const TILES = {
        // Basic terrain
        VOID:      0,   // Empty/out of bounds
        FLOOR:     1,   // Walkable stone floor
        WALL:      2,   // Solid wall
        WALL_TOP:  3,   // Wall top (decorative)
        DIRT:      4,   // Walkable dirt
        GRASS:     5,   // Walkable grass
        PATH:      6,   // Walkable path
        WATER:     7,   // Blocking water
        
        // Structures
        DOOR:      10,  // Walkable door
        DOOR_CLOSED: 11,  // Blocking closed door
        PILLAR:    12,  // Blocking pillar
        CRATE:     13,  // Blocking crate
        TABLE:     14,  // Blocking table
        CHAIR:     15,  // Walkable chair
        BED:       16,  // Blocking bed
        
        // Special
        STAIRS_UP:   20,  // Transition tile
        STAIRS_DOWN: 21,
        EXIT_N:    22,  // Area exit north
        EXIT_S:    23,
        EXIT_E:    24,
        EXIT_W:    25,
        
        // Decorative
        BLOOD:     30,
        MOSS:      31,
        CRACK:     32,
        RUBBLE:    33
    };
    
    // === STATE ===
    let currentMap = null;
    let currentAreaId = null;
    let mapWidth = 0;
    let mapHeight = 0;
    let tileData = [];
    let entities = [];
    let transitions = [];
    
    // === LOAD MAP ===
    function loadArea(areaId) {
        console.log('[Tilemap] Loading area:', areaId);
        
        if (typeof Maps === 'undefined') {
            console.error('[Tilemap] Maps module not found!');
            generateFallbackMap();
            return;
        }
        
        const map = Maps.get(areaId);
        if (!map) {
            console.warn('[Tilemap] No map data for:', areaId);
            generateFallbackMap();
            return;
        }
        
        currentMap = map;
        currentAreaId = areaId;
        mapWidth = map.width;
        mapHeight = map.height;
        tileData = map.tiles.slice();  // Copy array
        entities = (map.entities || []).map(e => ({...e}));  // Deep copy
        transitions = map.transitions || [];
        
        // Update camera bounds and snap to player's current position
        if (typeof Camera !== 'undefined') {
            Camera.setMapBounds(mapWidth * TILE, mapHeight * TILE);
            Camera.snapToPlayer();
        }
        
        console.log(`[Tilemap] Loaded ${mapWidth}x${mapHeight} map with ${entities.length} entities`);
    }
    
    function generateFallbackMap() {
        // Generate a simple test room
        mapWidth = 20;
        mapHeight = 15;
        tileData = [];
        entities = [];
        transitions = [];
        
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                // Border walls
                if (x === 0 || y === 0 || x === mapWidth-1 || y === mapHeight-1) {
                    tileData.push(TILES.WALL);
                } else {
                    tileData.push(TILES.FLOOR);
                }
            }
        }
        
        // Add some test entities
        entities.push({ type: 'npc', id: 'test_npc', x: 10, y: 7, sprite: 'npc' });
        
        if (typeof Camera !== 'undefined') {
            Camera.setMapBounds(mapWidth * TILE, mapHeight * TILE);
            Camera.snapToPlayer();
        }
    }

    // === TILE QUERIES ===
    function getTile(x, y) {
        if (x < 0 || y < 0 || x >= mapWidth || y >= mapHeight) {
            return TILES.VOID;
        }
        return tileData[y * mapWidth + x];
    }
    
    function setTile(x, y, tile) {
        if (x < 0 || y < 0 || x >= mapWidth || y >= mapHeight) return;
        tileData[y * mapWidth + x] = tile;
    }
    
    function isSolid(x, y) {
        const tile = getTile(x, y);

        if (CONFIG.SOLID_TILES.includes(tile)) return true;

        const entity = getEntityAt(x, y);
        if (!entity) return false;
        if (entity.type === 'enemy') return true;
        return entity.solid === true;
    }
    
    // === ENTITY MANAGEMENT ===
    function getEntityAt(x, y) {
        return entities.find(e => e.x === x && e.y === y);
    }
    
    function removeEntity(entity) {
        const idx = entities.indexOf(entity);
        if (idx >= 0) {
            entities.splice(idx, 1);
        }
    }
    
    function addEntity(entity) {
        entities.push(entity);
    }
    
    // === TRANSITIONS ===
    function getTransitionAt(x, y) {
        return transitions.find(t => t.x === x && t.y === y);
    }
    
    // === RENDERING ===
    function render(ctx) {
        const cam = typeof Camera !== 'undefined' ? Camera.getOffset() : { x: 0, y: 0 };

        const startX = Math.floor(cam.x / TILE);
        const startY = Math.floor(cam.y / TILE);
        const endX   = startX + CONFIG.GRID_W + 1;
        const endY   = startY + CONFIG.GRID_H + 1;

        for (let ty = startY; ty <= endY; ty++) {
            for (let tx = startX; tx <= endX; tx++) {
                if (tx < 0 || ty < 0 || tx >= mapWidth || ty >= mapHeight) continue;
                renderTile(ctx, getTile(tx, ty), tx * TILE, ty * TILE, tx, ty);
            }
        }
    }

    // Tiles drawn natively at 48×48 in world space — no SpriteScaler.
    function renderTile(ctx, tile, px, py, tx, ty) {
        const P = Engine.PALETTE;
        const T = CONFIG.TILE;   // 48
        const H = T >> 1;        // 24
        const Q = T >> 2;        // 12
        const S = T / 3 | 0;     // 16  (row height for bricks)

        // Deterministic per-tile seeds for variation
        const seed  = (tx * 7  + ty * 13) % 5;
        const seed2 = (tx * 11 + ty * 7)  % 7;
        const seed3 = (tx * 3  + ty * 17) % 9;

        switch (tile) {

            // ── VOID ─────────────────────────────────────────
            case TILES.VOID:
                ctx.fillStyle = P.void;
                ctx.fillRect(px, py, T, T);
                break;

            // ── FLOOR — stone slabs with mortar joints ───────
            case TILES.FLOOR: {
                // Base
                ctx.fillStyle = '#2a2833';
                ctx.fillRect(px, py, T, T);

                // 2×2 stone slabs (each ~22×22 with 2px mortar)
                const slab = [
                    '#2e2c3a', '#28263a', '#2c2a38', '#30283a',
                    '#262436', '#2a2836', '#2e2638'
                ];
                ctx.fillStyle = slab[seed];
                ctx.fillRect(px + 2,    py + 2,    21, 21);
                ctx.fillStyle = slab[(seed + 2) % 7];
                ctx.fillRect(px + 25,   py + 2,    21, 21);
                ctx.fillStyle = slab[(seed + 4) % 7];
                ctx.fillRect(px + 2,    py + 25,   21, 21);
                ctx.fillStyle = slab[(seed + 1) % 7];
                ctx.fillRect(px + 25,   py + 25,   21, 21);

                // Mortar (dark joints)
                ctx.fillStyle = '#18161e';
                ctx.fillRect(px,      py,      T, 2);   // top
                ctx.fillRect(px,      py,      2, T);   // left
                ctx.fillRect(px + 23, py,      2, T);   // center-v
                ctx.fillRect(px,      py + 23, T, 2);   // center-h

                // Subtle highlight corner on each slab
                ctx.fillStyle = 'rgba(255,255,255,0.04)';
                ctx.fillRect(px + 2,  py + 2,  8, 2);
                ctx.fillRect(px + 25, py + 2,  8, 2);
                ctx.fillRect(px + 2,  py + 25, 8, 2);
                ctx.fillRect(px + 25, py + 25, 8, 2);

                // Crack overlay — ~1 in 5 tiles
                if (seed === 0) {
                    ctx.fillStyle = '#18161e';
                    ctx.fillRect(px + 14 + seed2, py + 8,  2, 12);
                    ctx.fillRect(px + 16 + seed2, py + 16, 6,  2);
                } else if (seed === 3) {
                    ctx.fillRect(px + 28, py + 28, 2, 9);
                }
                break;
            }

            // ── WALL — 3-row running-bond brickwork ──────────
            case TILES.WALL: {
                // Base stone fill
                ctx.fillStyle = '#3d3a4a';
                ctx.fillRect(px, py, T, T);

                // Three rows of bricks (S=16px per row)
                const brickLight  = ['#42404e', '#464452', '#403e4c'];
                const brickShadow = '#2a2838';
                const mortarCol   = '#1e1c28';

                for (let row = 0; row < 3; row++) {
                    const ry  = py + row * S;
                    const off = (row % 2) * H;  // 0 or 24 — running bond offset

                    // Two brick faces per row at this offset
                    for (let col = -1; col < 3; col++) {
                        const bx = px + col * H + off;
                        if (bx + H <= px || bx >= px + T) continue;
                        const bx1 = Math.max(bx + 2, px);
                        const bx2 = Math.min(bx + H - 2, px + T);
                        if (bx2 <= bx1) continue;

                        // Brick body
                        ctx.fillStyle = brickLight[(row + col + seed) % 3];
                        ctx.fillRect(bx1, ry + 2, bx2 - bx1, S - 3);

                        // Brick shadow (bottom)
                        ctx.fillStyle = brickShadow;
                        ctx.fillRect(bx1, ry + S - 3, bx2 - bx1, 2);

                        // Brick highlight (top)
                        ctx.fillStyle = 'rgba(255,255,255,0.06)';
                        ctx.fillRect(bx1, ry + 2, bx2 - bx1, 2);
                    }

                    // Horizontal mortar
                    ctx.fillStyle = mortarCol;
                    ctx.fillRect(px, ry,     T, 2);
                    ctx.fillRect(px, ry + S - 1, T, 1);

                    // Vertical mortar seams
                    ctx.fillStyle = mortarCol;
                    for (let col = 0; col < 3; col++) {
                        ctx.fillRect(px + col * H + off, ry, 2, S);
                    }
                }

                // Cast shadow at base
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                ctx.fillRect(px, py + T - 6, T, 6);
                break;
            }

            // ── WALL_TOP — cap of wall, lighter ──────────────
            case TILES.WALL_TOP: {
                ctx.fillStyle = '#4a4658';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#565268';
                ctx.fillRect(px + 2, py + 2, T - 4, T / 2);
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.fillRect(px + 3, py + 3, T - 6, 4);
                // Edge shadow
                ctx.fillStyle = '#3a3848';
                ctx.fillRect(px, py + T - 10, T, 10);
                // Notch hint (crenelation top edge)
                ctx.fillStyle = '#3a3848';
                ctx.fillRect(px,      py, Q,  8);
                ctx.fillRect(px + H,  py, Q,  8);
                ctx.fillStyle = '#565268';
                ctx.fillRect(px + Q,  py, Q, 8);
                ctx.fillRect(px + 36, py, Q, 8);
                break;
            }

            // ── DIRT — loose earth with pebbles ──────────────
            case TILES.DIRT: {
                ctx.fillStyle = '#2d2418';
                ctx.fillRect(px, py, T, T);

                // Texture patches
                const dirt2 = ['#332a1e', '#2a2016', '#362c20', '#302618'];
                ctx.fillStyle = dirt2[seed % 4];
                ctx.fillRect(px + seed * 4 + 2,  py + seed2 * 3 + 2, 18, 14);
                ctx.fillStyle = dirt2[(seed + 2) % 4];
                ctx.fillRect(px + 22 + seed2,    py + 18 + seed,     16, 12);

                // Pebbles
                const pebble = '#1e1810';
                if (seed2 % 3 === 0) {
                    ctx.fillStyle = '#3a3020';
                    ctx.fillRect(px + 10 + seed * 3, py + 14 + seed2 * 2, 5, 4);
                    ctx.fillStyle = pebble;
                    ctx.fillRect(px + 11 + seed * 3, py + 15 + seed2 * 2, 3, 2);
                }
                if (seed3 % 4 === 0) {
                    ctx.fillStyle = '#3a3020';
                    ctx.fillRect(px + 28 + seed2,  py + 8 + seed3,  4, 3);
                    ctx.fillStyle = pebble;
                    ctx.fillRect(px + 29 + seed2,  py + 8 + seed3,  2, 2);
                }
                // Subtle groove lines
                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                ctx.fillRect(px + seed * 4,       py + 6,  T - seed * 4, 1);
                ctx.fillRect(px + seed2 * 2,      py + 22, T - seed2 * 2, 1);
                ctx.fillRect(px + seed3,          py + 36, T - seed3, 1);
                break;
            }

            // ── GRASS — textured with blades & details ────────
            case TILES.GRASS: {
                ctx.fillStyle = '#1d2a1a';
                ctx.fillRect(px, py, T, T);

                // Dark-green base clumps
                ctx.fillStyle = '#223020';
                ctx.fillRect(px + 4,  py + 4,  22, 20);
                ctx.fillRect(px + 28, py + 20, 16, 18);
                ctx.fillRect(px + 6,  py + 26, 18, 16);

                // Mid-green scatter
                ctx.fillStyle = '#2d3f28';
                ctx.fillRect(px + 8,        py + seed * 3 + 2,   14, 10);
                ctx.fillRect(px + 24 + seed, py + 4,             12,  8);
                ctx.fillRect(px + 10,        py + 30 + seed2,    18,  8);

                // Grass blades (thin vertical strokes)
                ctx.fillStyle = '#3a4e30';
                const bladePos = [
                    [6,  5], [14, 3], [22, 7], [30, 4], [38, 6],
                    [4, 18], [12,20], [20,16], [28,22], [40,18],
                    [8, 32], [16,36], [26,30], [36,34], [44,32]
                ];
                for (const [bx, by] of bladePos) {
                    const h = 5 + ((bx + by + seed) % 5);
                    ctx.fillRect(px + bx, py + by, 2, h);
                    // Lighter tip
                    ctx.fillStyle = '#4a6038';
                    ctx.fillRect(px + bx, py + by, 2, 2);
                    ctx.fillStyle = '#3a4e30';
                }

                // Flower (occasional)
                if ((tx + ty) % 7 === 0) {
                    ctx.fillStyle = '#b09040';
                    ctx.fillRect(px + 20 + seed, py + 14 + seed2, 5, 5);
                    ctx.fillStyle = '#d4b858';
                    ctx.fillRect(px + 21 + seed, py + 15 + seed2, 3, 3);
                    ctx.fillStyle = '#f0d060';
                    ctx.fillRect(px + 22 + seed, py + 16 + seed2, 2, 2);
                } else if ((tx * 3 + ty) % 11 === 0) {
                    // Small white flower
                    ctx.fillStyle = '#c8c8c0';
                    ctx.fillRect(px + 32 + seed2, py + 10 + seed3, 4, 4);
                    ctx.fillStyle = '#e8e8e0';
                    ctx.fillRect(px + 33 + seed2, py + 11 + seed3, 2, 2);
                }
                break;
            }

            // ── PATH — worn cobblestone ───────────────────────
            case TILES.PATH: {
                ctx.fillStyle = '#3a3428';
                ctx.fillRect(px, py, T, T);

                // Irregular cobbles (8 random stones)
                const cobbles = [
                    [2,  2,  14, 10], [18, 2,  16, 12], [36, 2,  10, 10],
                    [4,  14, 12, 12], [18, 16, 14, 10], [34, 14, 12, 12],
                    [2,  28, 16, 10], [20, 28, 12, 12], [34, 28, 12, 10],
                    [4,  40, 14, 6],  [20, 40, 14, 6],  [36, 40, 10, 6],
                ];
                const cLight = ['#453e30', '#4a4235', '#3e3828', '#483c30'];
                const cDark  = ['#302a20', '#2a2418', '#342e24'];
                for (let i = 0; i < cobbles.length; i++) {
                    const [cx, cy, cw, ch] = cobbles[i];
                    ctx.fillStyle = cLight[(i + seed) % 4];
                    ctx.fillRect(px + cx, py + cy, cw, ch);
                    // Shadow (right+bottom of each stone)
                    ctx.fillStyle = cDark[(i + seed2) % 3];
                    ctx.fillRect(px + cx + cw - 2, py + cy, 2, ch);
                    ctx.fillRect(px + cx, py + cy + ch - 2, cw, 2);
                    // Highlight (top-left)
                    ctx.fillStyle = 'rgba(255,255,255,0.04)';
                    ctx.fillRect(px + cx, py + cy, cw, 2);
                }
                // Mortar gaps (dark)
                ctx.fillStyle = '#201c14';
                ctx.fillRect(px,      py,      T, 2);
                ctx.fillRect(px,      py,      2, T);
                ctx.fillRect(px + 16, py,      2, T);
                ctx.fillRect(px + 34, py,      2, T);
                ctx.fillRect(px,      py + 12, T, 2);
                ctx.fillRect(px,      py + 26, T, 2);
                ctx.fillRect(px,      py + 38, T, 2);
                break;
            }

            // ── WATER — animated ripples & reflections ────────
            case TILES.WATER: {
                const t = performance.now() / 800;

                ctx.fillStyle = '#1a2030';
                ctx.fillRect(px, py, T, T);

                // Depth gradient
                ctx.fillStyle = '#16182a';
                ctx.fillRect(px + 4, py + 4, T - 8, T - 8);

                // Three wave bands
                const waveColors = ['#253040', '#2a3848', '#1e2c3c'];
                for (let w = 0; w < 3; w++) {
                    const wy = py + 8 + w * 13 + Math.sin(t + tx * 0.7 + w * 2.1) * 4 | 0;
                    ctx.fillStyle = waveColors[w];
                    ctx.fillRect(px + 3, wy, T - 6, 4);
                    // Wave crest lighter line
                    ctx.fillStyle = 'rgba(80,120,160,0.3)';
                    ctx.fillRect(px + 3, wy, T - 6, 1);
                }

                // Foam/sparkle on wave crests
                ctx.fillStyle = 'rgba(180,210,240,0.25)';
                const fwx = px + 8 + (Math.sin(t * 1.3 + ty) * 8 + 8 | 0);
                ctx.fillRect(fwx,      py + 10, 6, 2);
                ctx.fillRect(fwx + 14, py + 23, 4, 2);
                ctx.fillRect(fwx + 6,  py + 36, 8, 2);

                // Sky reflection (bright streak)
                ctx.fillStyle = 'rgba(100,150,200,0.15)';
                const rx = px + 6 + (Math.sin(t * 0.8 + tx) * 6 + 6 | 0);
                ctx.fillRect(rx, py + 4, 4, T - 8);

                // Tile edge darkening (water depth)
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(px,      py,      T, 3);
                ctx.fillRect(px,      py,      3, T);
                ctx.fillRect(px + T - 3, py,   3, T);
                ctx.fillRect(px,      py + T - 3, T, 3);
                break;
            }

            // ── DOOR (open) — dark archway ────────────────────
            case TILES.DOOR: {
                // Floor through doorway
                ctx.fillStyle = '#18161e';
                ctx.fillRect(px, py, T, T);

                // Door frame (wood)
                ctx.fillStyle = '#3d3020';
                ctx.fillRect(px,      py, 8, T);       // left jamb
                ctx.fillRect(px + T - 8, py, 8, T);   // right jamb
                ctx.fillRect(px,      py, T, 8);       // lintel

                // Frame highlight
                ctx.fillStyle = '#4d4028';
                ctx.fillRect(px + 1,      py + 1, 6, T - 1);
                ctx.fillRect(px + T - 7,  py + 1, 6, T - 1);
                ctx.fillRect(px + 1,      py + 1, T - 2, 6);

                // Frame shadow
                ctx.fillStyle = '#2a1e0c';
                ctx.fillRect(px + 6,      py + 6, 2, T - 6);
                ctx.fillRect(px + T - 8,  py + 6, 2, T - 6);

                // Iron nail/hinge hint
                ctx.fillStyle = '#5a5060';
                ctx.fillRect(px + 2, py + 10, 4, 4);
                ctx.fillRect(px + 2, py + 30, 4, 4);
                ctx.fillRect(px + T - 6, py + 10, 4, 4);
                ctx.fillRect(px + T - 6, py + 30, 4, 4);
                break;
            }

            // ── DOOR_CLOSED — solid wood door ─────────────────
            case TILES.DOOR_CLOSED: {
                ctx.fillStyle = '#3d3020';
                ctx.fillRect(px, py, T, T);

                // Door panels (2 large panels)
                ctx.fillStyle = '#4d3c28';
                ctx.fillRect(px + 4,      py + 4,  17, 18);
                ctx.fillRect(px + 4,      py + 26, 17, 18);
                ctx.fillRect(px + 27,     py + 4,  17, 18);
                ctx.fillRect(px + 27,     py + 26, 17, 18);

                // Panel highlight
                ctx.fillStyle = '#5a4830';
                ctx.fillRect(px + 5,  py + 5,  8, 4);
                ctx.fillRect(px + 28, py + 5,  8, 4);
                ctx.fillRect(px + 5,  py + 27, 8, 4);
                ctx.fillRect(px + 28, py + 27, 8, 4);

                // Panel shadow
                ctx.fillStyle = '#2a1e0c';
                ctx.fillRect(px + 19,     py + 4,  2, 18);
                ctx.fillRect(px + 4,      py + 20, 40, 2);
                ctx.fillRect(px + 42,     py + 4,  2, 18);
                ctx.fillRect(px + 19,     py + 26, 2, 18);
                ctx.fillRect(px + 42,     py + 26, 2, 18);

                // Center divider
                ctx.fillStyle = '#3d3020';
                ctx.fillRect(px + 22, py + 2, 4, T - 4);
                ctx.fillStyle = '#5a4830';
                ctx.fillRect(px + 23, py + 2, 2, T - 4);

                // Door knob / lock
                ctx.fillStyle = '#9a8030';
                ctx.fillRect(px + 35, py + 21, 6, 7);
                ctx.fillStyle = '#c0a040';
                ctx.fillRect(px + 36, py + 22, 4, 5);
                ctx.fillStyle = '#e0c060';
                ctx.fillRect(px + 37, py + 23, 2, 3);
                // Keyhole
                ctx.fillStyle = '#1a1208';
                ctx.fillRect(px + 37, py + 25, 2, 3);
                ctx.fillRect(px + 36, py + 27, 4, 2);
                break;
            }

            // ── PILLAR — carved stone column ──────────────────
            case TILES.PILLAR: {
                // Base floor
                ctx.fillStyle = '#2a2833';
                ctx.fillRect(px, py, T, T);

                // Column base/cap
                ctx.fillStyle = '#3a3848';
                ctx.fillRect(px + 8, py,     32, 6);
                ctx.fillRect(px + 8, py + 42, 32, 6);

                // Column shaft
                ctx.fillStyle = '#343242';
                ctx.fillRect(px + 12, py + 6, 24, 36);

                // Fluting (3 vertical channels)
                ctx.fillStyle = '#28263a';
                ctx.fillRect(px + 14, py + 6, 4, 36);
                ctx.fillRect(px + 22, py + 6, 4, 36);
                ctx.fillRect(px + 30, py + 6, 4, 36);

                // Highlight edges
                ctx.fillStyle = '#4a4858';
                ctx.fillRect(px + 12, py + 6,  3, 36);
                ctx.fillRect(px + 33, py + 6,  3, 36);

                // Cap highlight
                ctx.fillStyle = '#4a4858';
                ctx.fillRect(px + 8, py, 32, 3);
                // Shadow at base
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                ctx.fillRect(px + 8, py + 42, 32, 6);
                ctx.fillRect(px + 36, py + 6, 4, 36);
                break;
            }

            // ── CRATE — wooden box ────────────────────────────
            case TILES.CRATE: {
                ctx.fillStyle = '#2a2833';
                ctx.fillRect(px, py, T, T);

                // Crate body
                ctx.fillStyle = '#3d3020';
                ctx.fillRect(px + 4, py + 6, 40, 38);
                ctx.fillStyle = '#4d3c28';
                ctx.fillRect(px + 5, py + 7, 38, 36);

                // Wood plank lines
                ctx.fillStyle = '#3d3020';
                ctx.fillRect(px + 5, py + 19, 38, 2);
                ctx.fillRect(px + 5, py + 31, 38, 2);
                ctx.fillRect(px + 22, py + 7, 2, 36);

                // Metal straps
                ctx.fillStyle = '#585060';
                ctx.fillRect(px + 4,  py + 6,  40, 5);
                ctx.fillRect(px + 4,  py + 39, 40, 5);
                ctx.fillRect(px + 4,  py + 6,  5,  38);
                ctx.fillRect(px + 39, py + 6,  5,  38);
                ctx.fillStyle = '#6a6070';
                ctx.fillRect(px + 5,  py + 6,  38, 3);
                ctx.fillRect(px + 5,  py + 40, 38, 3);

                // Strap rivets
                ctx.fillStyle = '#909090';
                const rpts = [[4,8],[40,8],[4,40],[40,40],[22,8],[22,40]];
                for (const [rx, ry] of rpts) {
                    ctx.fillRect(px + rx, py + ry, 3, 3);
                }

                // Wood highlight
                ctx.fillStyle = '#5a4c34';
                ctx.fillRect(px + 6, py + 8, 14, 10);
                ctx.fillRect(px + 25, py + 8, 14, 10);

                // Shadow (right+bottom of crate)
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                ctx.fillRect(px + 38, py + 10, 6, 34);
                ctx.fillRect(px + 4,  py + 38, 40, 6);
                break;
            }

            // ── TABLE — wooden table with legs ────────────────
            case TILES.TABLE: {
                ctx.fillStyle = '#2a2833';
                ctx.fillRect(px, py, T, T);

                // Table legs (shadow first)
                ctx.fillStyle = '#1e1408';
                ctx.fillRect(px + 7,  py + 28, 6, 18);
                ctx.fillRect(px + 35, py + 28, 6, 18);

                // Table legs (front)
                ctx.fillStyle = '#3d3020';
                ctx.fillRect(px + 6,  py + 26, 6, 18);
                ctx.fillRect(px + 36, py + 26, 6, 18);
                ctx.fillStyle = '#5a4428';
                ctx.fillRect(px + 7,  py + 26, 3, 16);
                ctx.fillRect(px + 37, py + 26, 3, 16);

                // Tabletop (surface)
                ctx.fillStyle = '#3d3020';
                ctx.fillRect(px + 3, py + 12, 42, 16);
                ctx.fillStyle = '#5a4428';
                ctx.fillRect(px + 4, py + 12, 40, 14);

                // Plank grain lines
                ctx.fillStyle = '#4a3818';
                ctx.fillRect(px + 4, py + 17, 40, 1);
                ctx.fillRect(px + 4, py + 20, 40, 1);

                // Tabletop highlight
                ctx.fillStyle = '#6a5438';
                ctx.fillRect(px + 4, py + 12, 40, 3);

                // Tabletop shadow
                ctx.fillStyle = '#2a1e0e';
                ctx.fillRect(px + 3, py + 24, 42, 4);
                ctx.fillRect(px + 43, py + 12, 2, 14);
                break;
            }

            // ── CHAIR — simple wooden chair ───────────────────
            case TILES.CHAIR: {
                ctx.fillStyle = '#2a2833';
                ctx.fillRect(px, py, T, T);

                // Back legs
                ctx.fillStyle = '#2e2010';
                ctx.fillRect(px + 12, py + 6,  5, 38);
                ctx.fillRect(px + 31, py + 6,  5, 38);

                // Back rest
                ctx.fillStyle = '#3d3020';
                ctx.fillRect(px + 10, py + 4, 28, 5);
                ctx.fillRect(px + 10, py + 14, 28, 5);
                ctx.fillStyle = '#5a4428';
                ctx.fillRect(px + 11, py + 4, 26, 4);
                ctx.fillRect(px + 11, py + 14, 26, 4);
                // Backrest spindles
                ctx.fillStyle = '#4a3418';
                ctx.fillRect(px + 18, py + 8,  4, 7);
                ctx.fillRect(px + 26, py + 8,  4, 7);

                // Seat
                ctx.fillStyle = '#3d3020';
                ctx.fillRect(px + 8,  py + 20, 32, 8);
                ctx.fillStyle = '#5a4428';
                ctx.fillRect(px + 9,  py + 20, 30, 6);

                // Front legs
                ctx.fillStyle = '#3d3020';
                ctx.fillRect(px + 10, py + 28, 6, 18);
                ctx.fillRect(px + 32, py + 28, 6, 18);
                ctx.fillStyle = '#5a4428';
                ctx.fillRect(px + 11, py + 28, 3, 16);
                ctx.fillRect(px + 33, py + 28, 3, 16);
                break;
            }

            // ── BED — stone-framed bed ────────────────────────
            case TILES.BED: {
                ctx.fillStyle = '#2a2833';
                ctx.fillRect(px, py, T, T);

                // Bed frame
                ctx.fillStyle = '#3d3020';
                ctx.fillRect(px + 2, py + 4, T - 4, T - 8);
                ctx.fillStyle = '#5a4428';
                ctx.fillRect(px + 3, py + 5, T - 6, T - 10);

                // Headboard
                ctx.fillStyle = '#3d3020';
                ctx.fillRect(px + 2, py + 4, T - 4, 10);
                ctx.fillStyle = '#4a3c28';
                ctx.fillRect(px + 3, py + 4, T - 6, 8);
                ctx.fillStyle = '#6a5434';
                ctx.fillRect(px + 4, py + 4, T - 8, 4);

                // Pillow
                ctx.fillStyle = '#9090a4';
                ctx.fillRect(px + 5, py + 15, 22, 12);
                ctx.fillStyle = '#a0a0b8';
                ctx.fillRect(px + 6, py + 16, 20, 9);
                ctx.fillStyle = '#b0b0c8';
                ctx.fillRect(px + 7, py + 16, 10, 5);
                // Pillow crease
                ctx.fillStyle = '#808090';
                ctx.fillRect(px + 6, py + 22, 20, 1);

                // Blanket
                ctx.fillStyle = '#3a4060';
                ctx.fillRect(px + 4, py + 27, T - 8, 16);
                ctx.fillStyle = '#4a5070';
                ctx.fillRect(px + 5, py + 27, T - 10, 13);
                // Blanket fold lines
                ctx.fillStyle = '#3a4060';
                ctx.fillRect(px + 5, py + 30, T - 10, 1);
                ctx.fillRect(px + 5, py + 34, T - 10, 1);
                // Blanket highlight
                ctx.fillStyle = '#5a6080';
                ctx.fillRect(px + 5, py + 27, T - 10, 3);
                break;
            }

            // ── STAIRS ────────────────────────────────────────
            case TILES.STAIRS_UP:
            case TILES.STAIRS_DOWN: {
                ctx.fillStyle = '#28263a';
                ctx.fillRect(px, py, T, T);

                const goUp = (tile === TILES.STAIRS_UP);
                // Draw 5 steps
                for (let i = 0; i < 5; i++) {
                    const sw = T - 8 - i * 6;
                    const sx = px + 4 + i * 3;
                    const sy = py + 4 + i * 8;
                    const col = goUp
                        ? ['#4a4858', '#3a3848', '#343244', '#2e2c3e', '#282638']
                        : ['#282638', '#2e2c3e', '#343244', '#3a3848', '#4a4858'];

                    ctx.fillStyle = col[i];
                    ctx.fillRect(sx, sy, sw, 8);
                    // Riser highlight
                    ctx.fillStyle = 'rgba(255,255,255,0.07)';
                    ctx.fillRect(sx, sy, sw, 2);
                    // Tread shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.25)';
                    ctx.fillRect(sx, sy + 6, sw, 2);
                }

                // Arrow indicator
                ctx.fillStyle = goUp ? '#8060d0' : '#608030';
                ctx.fillRect(px + 20, py + 44, 8, 2);  // base
                if (goUp) {
                    ctx.fillRect(px + 20, py + 38, 8, 6);
                    ctx.fillRect(px + 16, py + 40, 4, 2);
                    ctx.fillRect(px + 28, py + 40, 4, 2);
                } else {
                    ctx.fillRect(px + 20, py + 44, 8, 6);
                    ctx.fillRect(px + 16, py + 46, 4, 2);
                    ctx.fillRect(px + 28, py + 46, 4, 2);
                }
                break;
            }

            // ── EXITS — directional portal tiles ─────────────
            case TILES.EXIT_N:
            case TILES.EXIT_S:
            case TILES.EXIT_E:
            case TILES.EXIT_W: {
                // Floor base
                ctx.fillStyle = '#3a3428';
                ctx.fillRect(px, py, T, T);

                // Portal glow area
                const glowA = 0.25 + Math.sin(performance.now() / 500) * 0.08;
                ctx.fillStyle = `rgba(200,180,60,${glowA})`;
                ctx.fillRect(px + 6, py + 6, T - 12, T - 12);

                // Glow border (brighter ring)
                ctx.fillStyle = `rgba(240,220,80,${glowA * 1.5})`;
                ctx.fillRect(px + 6,      py + 6,      T - 12, 3);
                ctx.fillRect(px + 6,      py + T - 9,  T - 12, 3);
                ctx.fillRect(px + 6,      py + 6,      3, T - 12);
                ctx.fillRect(px + T - 9,  py + 6,      3, T - 12);

                // Directional arrow (filled triangle)
                ctx.fillStyle = '#c8a030';
                ctx.beginPath();
                if (tile === TILES.EXIT_N) {
                    ctx.moveTo(px + H,      py + 9);
                    ctx.lineTo(px + H - 10, py + 28);
                    ctx.lineTo(px + H + 10, py + 28);
                } else if (tile === TILES.EXIT_S) {
                    ctx.moveTo(px + H,      py + T - 9);
                    ctx.lineTo(px + H - 10, py + T - 28);
                    ctx.lineTo(px + H + 10, py + T - 28);
                } else if (tile === TILES.EXIT_E) {
                    ctx.moveTo(px + T - 9,  py + H);
                    ctx.lineTo(px + T - 28, py + H - 10);
                    ctx.lineTo(px + T - 28, py + H + 10);
                } else {  // EXIT_W
                    ctx.moveTo(px + 9,  py + H);
                    ctx.lineTo(px + 28, py + H - 10);
                    ctx.lineTo(px + 28, py + H + 10);
                }
                ctx.closePath();
                ctx.fill();

                // Arrow highlight
                ctx.fillStyle = '#e8c048';
                ctx.beginPath();
                if (tile === TILES.EXIT_N) {
                    ctx.moveTo(px + H,      py + 11);
                    ctx.lineTo(px + H - 5,  py + 22);
                    ctx.lineTo(px + H + 5,  py + 22);
                } else if (tile === TILES.EXIT_S) {
                    ctx.moveTo(px + H,      py + T - 11);
                    ctx.lineTo(px + H - 5,  py + T - 22);
                    ctx.lineTo(px + H + 5,  py + T - 22);
                } else if (tile === TILES.EXIT_E) {
                    ctx.moveTo(px + T - 11, py + H);
                    ctx.lineTo(px + T - 22, py + H - 5);
                    ctx.lineTo(px + T - 22, py + H + 5);
                } else {
                    ctx.moveTo(px + 11, py + H);
                    ctx.lineTo(px + 22, py + H - 5);
                    ctx.lineTo(px + 22, py + H + 5);
                }
                ctx.closePath();
                ctx.fill();
                break;
            }

            // ── BLOOD — dried blood splatter ──────────────────
            case TILES.BLOOD: {
                // Floor base
                ctx.fillStyle = '#2a2833';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#28263a';
                ctx.fillRect(px + 2, py + 2, 21, 21);
                ctx.fillRect(px + 25, py + 2, 21, 21);
                ctx.fillRect(px + 2, py + 25, 21, 21);
                ctx.fillRect(px + 25, py + 25, 21, 21);
                ctx.fillStyle = '#18161e';
                ctx.fillRect(px, py, T, 2);
                ctx.fillRect(px, py, 2, T);
                ctx.fillRect(px + 23, py, 2, T);
                ctx.fillRect(px, py + 23, T, 2);

                // Main blood pool
                ctx.fillStyle = '#5a1010';
                ctx.fillRect(px + 12, py + 14, 20, 14);
                ctx.fillStyle = '#6a1818';
                ctx.fillRect(px + 14, py + 14, 16, 12);
                ctx.fillStyle = '#7a1818';
                ctx.fillRect(px + 16, py + 16, 10, 8);

                // Splatter droplets
                ctx.fillStyle = '#5a1010';
                ctx.fillRect(px + 8,  py + 10, 5, 5);
                ctx.fillRect(px + 28, py + 8,  4, 4);
                ctx.fillRect(px + 34, py + 20, 5, 5);
                ctx.fillRect(px + 6,  py + 26, 6, 4);
                ctx.fillRect(px + 30, py + 30, 4, 6);

                // Dried/darker edges on main pool
                ctx.fillStyle = '#3a0a0a';
                ctx.fillRect(px + 12, py + 26, 20, 2);
                ctx.fillRect(px + 30, py + 14, 2, 12);

                // Highlight (wet center)
                ctx.fillStyle = '#8a2020';
                ctx.fillRect(px + 18, py + 17, 5, 5);
                break;
            }

            // ── MOSS — stone covered in moss ──────────────────
            case TILES.MOSS: {
                // Stone base
                ctx.fillStyle = '#2a2833';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#28263a';
                ctx.fillRect(px + 2, py + 2, 21, 21);
                ctx.fillRect(px + 25, py + 2, 21, 21);
                ctx.fillRect(px + 2, py + 25, 21, 21);
                ctx.fillRect(px + 25, py + 25, 21, 21);
                ctx.fillStyle = '#18161e';
                ctx.fillRect(px, py, T, 2);
                ctx.fillRect(px, py, 2, T);
                ctx.fillRect(px + 23, py, 2, T);
                ctx.fillRect(px, py + 23, T, 2);

                // Moss patches (varied greens)
                ctx.fillStyle = '#243820';
                ctx.fillRect(px + 2,  py + 26, 16, 18);
                ctx.fillRect(px + 28, py + 28, 18, 16);
                ctx.fillRect(px + 4,  py + 4,  12, 10);

                ctx.fillStyle = '#2e4828';
                ctx.fillRect(px + 4,  py + 28, 12, 14);
                ctx.fillRect(px + 30, py + 30, 14, 12);
                ctx.fillRect(px + 5,  py + 5,  9,  7);

                ctx.fillStyle = '#385830';
                ctx.fillRect(px + 6,  py + 30, 8, 10);
                ctx.fillRect(px + 32, py + 32, 10, 8);

                // Moss texture (tiny bumps)
                ctx.fillStyle = '#425e38';
                const mossBumps = [[4,32],[8,28],[12,34],[16,30],[20,36],[24,32],
                                   [30,30],[34,26],[38,34],[36,38],[26,38]];
                for (const [mx, my] of mossBumps) {
                    ctx.fillRect(px + mx, py + my, 3, 2);
                }

                // Moisture sheen
                ctx.fillStyle = 'rgba(60,100,60,0.2)';
                ctx.fillRect(px + 2, py + 26, 20, 20);
                ctx.fillRect(px + 28, py + 28, 18, 18);
                break;
            }

            // ── CRACK — cracked flagstone ─────────────────────
            case TILES.CRACK: {
                const slabVars = ['#2e2c3a','#28263a','#2c2a38','#30283a','#262436','#2a2836','#2e2638'];
                ctx.fillStyle = '#2a2833';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = slabVars[(seed + seed2) % 7];
                ctx.fillRect(px + 2, py + 2, 44, 44);
                ctx.fillStyle = '#18161e';
                ctx.fillRect(px, py, T, 2);
                ctx.fillRect(px, py, 2, T);

                // Main crack (branching)
                ctx.fillStyle = '#0e0c18';
                ctx.fillRect(px + 20, py + 4,  3, 16);
                ctx.fillRect(px + 22, py + 18, 3, 14);
                ctx.fillRect(px + 24, py + 30, 3, 12);

                // Branch cracks
                ctx.fillRect(px + 14, py + 12, 7, 2);
                ctx.fillRect(px + 10, py + 14, 5, 2);
                ctx.fillRect(px + 26, py + 22, 8, 2);
                ctx.fillRect(px + 33, py + 24, 6, 2);
                ctx.fillRect(px + 20, py + 34, 8, 2);

                // Crack bright edge (chalk/splinter)
                ctx.fillStyle = '#3e3c4e';
                ctx.fillRect(px + 23, py + 4,  1, 38);
                ctx.fillRect(px + 15, py + 12, 6, 1);
                ctx.fillRect(px + 27, py + 22, 7, 1);

                // Chip/debris at crack ends
                ctx.fillStyle = '#383646';
                ctx.fillRect(px + 18, py + 6,  4, 3);
                ctx.fillRect(px + 26, py + 38, 5, 3);
                ctx.fillRect(px + 32, py + 26, 4, 3);
                break;
            }

            // ── RUBBLE — broken stones ────────────────────────
            case TILES.RUBBLE: {
                ctx.fillStyle = '#2a2833';
                ctx.fillRect(px, py, T, T);

                // Rubble chunks (5 chunks, various sizes and angles)
                const chunks = [
                    { x: 6,  y: 22, w: 16, h: 12, c: '#3a3848', hi: '#4a4858' },
                    { x: 24, y: 18, w: 12, h: 14, c: '#343242', hi: '#44425a' },
                    { x: 32, y: 28, w: 10, h: 10, c: '#3e3c4c', hi: '#4e4c5e' },
                    { x: 10, y: 34, w: 14, h: 8,  c: '#363446', hi: '#464458' },
                    { x: 22, y: 32, w: 10, h: 12, c: '#3a3848', hi: '#4a4858' },
                ];
                for (const ch of chunks) {
                    ctx.fillStyle = ch.c;
                    ctx.fillRect(px + ch.x, py + ch.y, ch.w, ch.h);
                    ctx.fillStyle = ch.hi;
                    ctx.fillRect(px + ch.x, py + ch.y, ch.w, 3);
                    ctx.fillRect(px + ch.x, py + ch.y, 3, ch.h);
                    // Chunk shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.4)';
                    ctx.fillRect(px + ch.x + ch.w - 3, py + ch.y + 3, 3, ch.h - 3);
                    ctx.fillRect(px + ch.x + 3, py + ch.y + ch.h - 3, ch.w - 3, 3);
                }

                // Dust/fine debris scatter
                ctx.fillStyle = '#2e2c3c';
                for (let i = 0; i < 8; i++) {
                    const dx = (seed * 5 + i * 9 + tx * 3) % 38 + 4;
                    const dy = (seed2 * 7 + i * 11 + ty * 5) % 38 + 4;
                    ctx.fillRect(px + dx, py + dy, 3, 2);
                }

                // Small sharp shards
                ctx.fillStyle = '#4a4858';
                ctx.fillRect(px + 18, py + 14, 3, 6);
                ctx.fillRect(px + 36, py + 20, 2, 5);
                ctx.fillRect(px + 8,  py + 30, 4, 2);
                break;
            }

            // ── DEFAULT ───────────────────────────────────────
            default:
                ctx.fillStyle = '#1e1c2a';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#2e2c3a';
                ctx.fillRect(px + 1, py + 1, T - 2, T - 2);
        }
    }
    
    function renderEntities(ctx) {
        const P = Engine.PALETTE;
        
        for (const entity of entities) {
            const px = entity.x * TILE;
            const py = entity.y * TILE;
            
            switch (entity.type) {
                case 'npc':
                    renderNPC(ctx, entity, px, py);
                    break;
                    
                case 'enemy':
                    renderEnemy(ctx, entity, px, py);
                    break;
                    
                case 'item':
                    renderItem(ctx, entity, px, py);
                    break;
                    
                case 'exit':
                    // Exit markers
                    ctx.fillStyle = P.gold + '66';
                    ctx.fillRect(px + 4, py + 4, 8, 8);
                    break;
            }
        }
    }
    
    // Map entity sprite ids to SPRITES_48 names
    const NPC_SPRITES    = { merchant: 'merchant', guard: 'guard', elder: 'elder', smith: 'smith', monk: 'monk' };
    const ENEMY_SPRITES  = { enemy_wolf: 'wolf', enemy_bandit: 'bandit', enemy_undead: 'undead',
                              enemy_spirit: 'spirit', enemy_boss: 'boss_guardian' };
    const ITEM_SPRITES   = { potion: 'potion_health', potion_health: 'potion_health',
                              potion_mana: 'potion_mana', sword: 'sword', key: 'key', chest: 'chest' };

    function renderNPC(ctx, entity, px, py) {
        const spriteName = NPC_SPRITES[entity.sprite] || NPC_SPRITES[entity.id] || 'merchant';
        if (typeof SPRITES_48 !== 'undefined' && SPRITES_48.has(spriteName)) {
            SPRITES_48.draw(spriteName, ctx, px, py, 0);
        } else {
            SpriteScaler.renderScaled(ctx, function(c, ox, oy) {
                const P = Engine.PALETTE;
                c.fillStyle = 'rgba(0,0,0,0.3)';
                c.beginPath(); c.ellipse(ox+8,oy+14,5,2,0,0,Math.PI*2); c.fill();
                c.fillStyle = entity.color || P.npc;
                c.fillRect(ox+3,oy+5,10,9);
                c.fillStyle = '#a09080'; c.fillRect(ox+4,oy+1,8,6);
                c.fillStyle = '#202020'; c.fillRect(ox+5,oy+3,2,2); c.fillRect(ox+9,oy+3,2,2);
                if (entity.hasQuest) { c.fillStyle=P.gold; c.font='bold 10px monospace'; c.fillText('!',ox+6,oy-2); }
            }, px, py);
        }
        // Quest marker (native 48px space)
        if (entity.hasQuest && typeof SPRITES_48 !== 'undefined') {
            const P = Engine.PALETTE;
            ctx.fillStyle = P.gold;
            ctx.font = 'bold 14px monospace';
            ctx.fillText('!', px + 20, py - 4);
        }
    }

    function renderEnemy(ctx, entity, px, py) {
        const spriteName = ENEMY_SPRITES[entity.sprite] || 'bandit';
        if (typeof SPRITES_48 !== 'undefined' && SPRITES_48.has(spriteName)) {
            SPRITES_48.draw(spriteName, ctx, px, py, 0);
        } else {
            SpriteScaler.renderScaled(ctx, function(c, ox, oy) {
                const P = Engine.PALETTE;
                c.fillStyle = 'rgba(0,0,0,0.4)';
                c.beginPath(); c.ellipse(ox+8,oy+14,6,2,0,0,Math.PI*2); c.fill();
                c.fillStyle = entity.color || P.enemy;
                c.fillRect(ox+2,oy+4,12,10);
                c.fillStyle = '#3a2020'; c.fillRect(ox+3,oy+1,10,5);
                c.fillStyle = '#ff3030'; c.fillRect(ox+4,oy+2,2,2); c.fillRect(ox+10,oy+2,2,2);
            }, px, py);
        }
    }

    function renderItem(ctx, entity, px, py) {
        const spriteName = ITEM_SPRITES[entity.sprite] || ITEM_SPRITES[entity.id] || 'potion_health';
        if (typeof SPRITES_48 !== 'undefined' && SPRITES_48.has(spriteName)) {
            SPRITES_48.draw(spriteName, ctx, px, py, 0);
        } else {
            SpriteScaler.renderScaled(ctx, function(c, ox, oy) {
                const P = Engine.PALETTE;
                c.fillStyle = 'rgba(120,110,60,0.3)';
                c.beginPath(); c.arc(ox+8,oy+10,6,0,Math.PI*2); c.fill();
                c.fillStyle = entity.color || P.item;
                c.fillRect(ox+5,oy+6,6,6);
                c.fillStyle = P.uiHighlight; c.fillRect(ox+6,oy+4,2,2);
            }, px, py);
        }
    }
    
    // === PUBLIC API ===
    return {
        loadArea,
        render,
        renderEntities,
        
        // Queries
        getTile,
        setTile,
        isSolid,
        getEntityAt,
        getTransitionAt,
        
        // Entity management
        addEntity,
        removeEntity,
        getEntities: () => entities,
        
        // Map info
        getCurrentArea: () => currentAreaId,
        getCurrentMap: () => currentMap,
        getWidth: () => mapWidth,
        getHeight: () => mapHeight,
        
        // Tile constants
        TILES
    };
})();
