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

    // All tile art is drawn in 16×16 space; SpriteScaler handles the 3× magnification.
    function renderTile(ctx, tile, px, py, tx, ty) {
        const P = Engine.PALETTE;
        SpriteScaler.renderScaled(ctx, function(c, ox, oy) {
            switch (tile) {
                case TILES.VOID:
                    c.fillStyle = P.void;
                    c.fillRect(ox, oy, 16, 16);
                    break;

                case TILES.FLOOR:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    if ((tx + ty) % 3 === 0) {
                        c.fillStyle = P.shadow;
                        c.fillRect(ox + 2, oy + 2, 2, 2);
                    }
                    c.fillStyle = P.shadow;
                    c.fillRect(ox,      oy, 1, 16);
                    c.fillRect(ox,      oy, 16, 1);
                    break;

                case TILES.WALL:
                    c.fillStyle = P.wall;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.shadow;
                    c.fillRect(ox,           oy + 5,  16, 1);
                    c.fillRect(ox,           oy + 11, 16, 1);
                    c.fillRect(ox + (ty % 2) * 8,              oy,     1, 6);
                    c.fillRect(ox + ((ty % 2) * 8 + 8) % 16,  oy + 6, 1, 5);
                    break;

                case TILES.WALL_TOP:
                    c.fillStyle = P.wallLight;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.wall;
                    c.fillRect(ox, oy + 12, 16, 4);
                    break;

                case TILES.DIRT:
                    c.fillStyle = P.dirt;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.shadow;
                    if ((tx * 7 + ty * 3) % 5 === 0) c.fillRect(ox + 3,  oy + 7, 2, 2);
                    if ((tx * 3 + ty * 11) % 7 === 0) c.fillRect(ox + 10, oy + 4, 1, 1);
                    break;

                case TILES.GRASS:
                    c.fillStyle = P.grass;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = '#2a3f25';
                    c.fillRect(ox + 3,  oy + 2, 1, 3);
                    c.fillRect(ox + 8,  oy + 5, 1, 2);
                    c.fillRect(ox + 12, oy + 3, 1, 3);
                    break;

                case TILES.PATH:
                    c.fillStyle = P.path;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.dirt;
                    c.fillRect(ox + 4, oy + 4, 8, 8);
                    break;

                case TILES.WATER:
                    c.fillStyle = P.water;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = '#253040';
                    c.fillRect(ox + 2 + (tx + ty) % 3 * 4, oy + 6, 4, 1);
                    break;

                case TILES.DOOR:
                    c.fillStyle = P.night;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.wood;
                    c.fillRect(ox,      oy, 2, 16);
                    c.fillRect(ox + 14, oy, 2, 16);
                    c.fillRect(ox,      oy, 16, 2);
                    break;

                case TILES.DOOR_CLOSED:
                    c.fillStyle = P.wood;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.shadow;
                    c.fillRect(ox + 3, oy + 3, 4, 10);
                    c.fillRect(ox + 9, oy + 3, 4, 10);
                    c.fillStyle = P.gold;
                    c.fillRect(ox + 12, oy + 8, 2, 2);
                    break;

                case TILES.PILLAR:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.wallLight;
                    c.fillRect(ox + 3, oy, 10, 16);
                    c.fillStyle = P.wall;
                    c.fillRect(ox + 5, oy, 6, 16);
                    break;

                case TILES.CRATE:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.wood;
                    c.fillRect(ox + 2, oy + 4, 12, 12);
                    c.fillStyle = P.shadow;
                    c.fillRect(ox + 2, oy + 9, 12, 1);
                    c.fillRect(ox + 7, oy + 4,  1, 12);
                    break;

                case TILES.TABLE:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.wood;
                    c.fillRect(ox + 1,  oy + 5, 14, 5);
                    c.fillStyle = P.shadow;
                    c.fillRect(ox + 2,  oy + 10, 2, 4);
                    c.fillRect(ox + 12, oy + 10, 2, 4);
                    break;

                case TILES.CHAIR:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.wood;
                    c.fillRect(ox + 4,  oy + 2,  8, 3);
                    c.fillRect(ox + 4,  oy + 7,  8, 3);
                    c.fillRect(ox + 4,  oy + 10, 2, 4);
                    c.fillRect(ox + 10, oy + 10, 2, 4);
                    break;

                case TILES.BED:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.wood;
                    c.fillRect(ox + 1, oy + 2, 14, 12);
                    c.fillStyle = '#707080';
                    c.fillRect(ox + 2, oy + 3, 5, 4);
                    c.fillStyle = '#404858';
                    c.fillRect(ox + 2, oy + 8, 12, 5);
                    break;

                case TILES.STAIRS_UP:
                case TILES.STAIRS_DOWN:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.wallLight;
                    for (let i = 0; i < 4; i++) {
                        c.fillRect(ox + 2, oy + 2 + i * 3, 12 - i * 2, 2);
                    }
                    break;

                case TILES.EXIT_N:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = 'rgba(180,160,60,0.3)';
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = 'rgba(230,210,90,0.9)';
                    c.fillRect(ox + 7, oy + 3, 2, 8);
                    c.fillRect(ox + 5, oy + 5, 2, 2);
                    c.fillRect(ox + 9, oy + 5, 2, 2);
                    c.fillRect(ox + 4, oy + 7, 1, 1);
                    c.fillRect(ox + 11, oy + 7, 1, 1);
                    break;

                case TILES.EXIT_S:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = 'rgba(180,160,60,0.3)';
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = 'rgba(230,210,90,0.9)';
                    c.fillRect(ox + 7, oy + 5, 2, 8);
                    c.fillRect(ox + 5, oy + 9, 2, 2);
                    c.fillRect(ox + 9, oy + 9, 2, 2);
                    c.fillRect(ox + 4,  oy + 8, 1, 1);
                    c.fillRect(ox + 11, oy + 8, 1, 1);
                    break;

                case TILES.EXIT_E:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = 'rgba(180,160,60,0.3)';
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = 'rgba(230,210,90,0.9)';
                    c.fillRect(ox + 4, oy + 7, 8, 2);
                    c.fillRect(ox + 9, oy + 5, 2, 2);
                    c.fillRect(ox + 9, oy + 9, 2, 2);
                    break;

                case TILES.EXIT_W:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = 'rgba(180,160,60,0.3)';
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = 'rgba(230,210,90,0.9)';
                    c.fillRect(ox + 4, oy + 7, 8, 2);
                    c.fillRect(ox + 4, oy + 5, 2, 2);
                    c.fillRect(ox + 4, oy + 9, 2, 2);
                    break;

                case TILES.BLOOD:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.blood;
                    c.fillRect(ox + 4, oy + 5, 6, 4);
                    c.fillRect(ox + 2, oy + 7, 3, 2);
                    c.fillRect(ox + 9, oy + 4, 2, 3);
                    break;

                case TILES.MOSS:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.moss;
                    c.fillRect(ox + 1, oy + 10, 5, 4);
                    c.fillRect(ox + 8, oy + 12, 4, 3);
                    break;

                case TILES.CRACK:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.shadow;
                    c.fillRect(ox + 6, oy + 2, 1, 5);
                    c.fillRect(ox + 7, oy + 7, 1, 5);
                    c.fillRect(ox + 4, oy + 5, 2, 1);
                    c.fillRect(ox + 8, oy + 9, 3, 1);
                    break;

                case TILES.RUBBLE:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
                    c.fillStyle = P.wall;
                    c.fillRect(ox + 2, oy + 8, 5, 4);
                    c.fillRect(ox + 8, oy + 6, 4, 4);
                    c.fillRect(ox + 5, oy + 11, 5, 2);
                    c.fillStyle = P.shadow;
                    c.fillRect(ox + 3, oy + 9, 2, 2);
                    break;

                default:
                    c.fillStyle = P.stone;
                    c.fillRect(ox, oy, 16, 16);
            }
        }, px, py);
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
