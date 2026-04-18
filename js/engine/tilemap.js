/*************************************************************
 * tilemap.js — Tilemap Renderer & Collision
 * Handles: tile rendering, collision detection, entity placement
 *************************************************************/

const Tilemap = (function() {
    const TILE = 16;
    
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
    
    // Which tiles block movement
    const SOLID_TILES = new Set([
        TILES.VOID, TILES.WALL, TILES.WALL_TOP, TILES.WATER,
        TILES.DOOR_CLOSED, TILES.PILLAR, TILES.CRATE, 
        TILES.TABLE, TILES.BED
    ]);
    
    // === STATE ===
    let currentMap = null;
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
        mapWidth = map.width;
        mapHeight = map.height;
        tileData = map.tiles.slice();  // Copy array
        entities = (map.entities || []).map(e => ({...e}));  // Deep copy
        transitions = map.transitions || [];
        
        // Set camera bounds
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
        
        // Check if tile itself is solid
        if (SOLID_TILES.has(tile)) return true;
        
        // Check if blocking entity is there
        const entity = getEntityAt(x, y);
        if (entity && entity.solid) return true;
        
        return false;
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
        const P = Engine.PALETTE;
        
        // Get visible tile range
        const cam = typeof Camera !== 'undefined' ? Camera.getOffset() : {x: 0, y: 0};
        const startX = Math.floor(cam.x / TILE);
        const startY = Math.floor(cam.y / TILE);
        const endX = startX + Engine.CANVAS_TILES_X + 1;
        const endY = startY + Engine.CANVAS_TILES_Y + 1;
        
        // Render tiles
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const tile = getTile(x, y);
                const px = x * TILE;
                const py = y * TILE;
                
                renderTile(ctx, tile, px, py, x, y);
            }
        }
    }
    
    function renderTile(ctx, tile, px, py, tx, ty) {
        const P = Engine.PALETTE;
        
        switch (tile) {
            case TILES.VOID:
                ctx.fillStyle = P.void;
                ctx.fillRect(px, py, TILE, TILE);
                break;
                
            case TILES.FLOOR:
                ctx.fillStyle = P.stone;
                ctx.fillRect(px, py, TILE, TILE);
                // Add subtle variation
                if ((tx + ty) % 3 === 0) {
                    ctx.fillStyle = P.shadow;
                    ctx.fillRect(px + 2, py + 2, 2, 2);
                }
                // Grid lines
                ctx.fillStyle = P.shadow;
                ctx.fillRect(px, py, 1, TILE);
                ctx.fillRect(px, py, TILE, 1);
                break;
                
            case TILES.WALL:
                ctx.fillStyle = P.wall;
                ctx.fillRect(px, py, TILE, TILE);
                // Brick pattern
                ctx.fillStyle = P.shadow;
                ctx.fillRect(px, py + 5, TILE, 1);
                ctx.fillRect(px, py + 11, TILE, 1);
                ctx.fillRect(px + ((ty % 2) * 8), py, 1, 6);
                ctx.fillRect(px + ((ty % 2) * 8 + 8) % 16, py + 6, 1, 5);
                break;
                
            case TILES.WALL_TOP:
                ctx.fillStyle = P.wallLight;
                ctx.fillRect(px, py, TILE, TILE);
                // Cap detail
                ctx.fillStyle = P.wall;
                ctx.fillRect(px, py + TILE - 4, TILE, 4);
                break;
                
            case TILES.DIRT:
                ctx.fillStyle = P.dirt;
                ctx.fillRect(px, py, TILE, TILE);
                // Texture
                ctx.fillStyle = P.shadow;
                if ((tx * 7 + ty * 3) % 5 === 0) ctx.fillRect(px + 3, py + 7, 2, 2);
                if ((tx * 3 + ty * 11) % 7 === 0) ctx.fillRect(px + 10, py + 4, 1, 1);
                break;
                
            case TILES.GRASS:
                ctx.fillStyle = P.grass;
                ctx.fillRect(px, py, TILE, TILE);
                // Grass blades
                ctx.fillStyle = '#2a3f25';
                ctx.fillRect(px + 3, py + 2, 1, 3);
                ctx.fillRect(px + 8, py + 5, 1, 2);
                ctx.fillRect(px + 12, py + 3, 1, 3);
                break;
                
            case TILES.PATH:
                ctx.fillStyle = P.path;
                ctx.fillRect(px, py, TILE, TILE);
                // Worn texture
                ctx.fillStyle = P.dirt;
                ctx.fillRect(px + 4, py + 4, 8, 8);
                break;
                
            case TILES.WATER:
                ctx.fillStyle = P.water;
                ctx.fillRect(px, py, TILE, TILE);
                // Ripple effect (simple)
                ctx.fillStyle = '#253040';
                ctx.fillRect(px + 2 + ((tx + ty) % 3) * 4, py + 6, 4, 1);
                break;
                
            case TILES.DOOR:
                // Open doorway
                ctx.fillStyle = P.night;
                ctx.fillRect(px, py, TILE, TILE);
                // Frame
                ctx.fillStyle = P.wood;
                ctx.fillRect(px, py, 2, TILE);
                ctx.fillRect(px + TILE - 2, py, 2, TILE);
                ctx.fillRect(px, py, TILE, 2);
                break;
                
            case TILES.DOOR_CLOSED:
                ctx.fillStyle = P.wood;
                ctx.fillRect(px, py, TILE, TILE);
                // Door details
                ctx.fillStyle = P.shadow;
                ctx.fillRect(px + 3, py + 3, 4, 10);
                ctx.fillRect(px + 9, py + 3, 4, 10);
                // Handle
                ctx.fillStyle = P.gold;
                ctx.fillRect(px + 12, py + 8, 2, 2);
                break;
                
            case TILES.PILLAR:
                ctx.fillStyle = P.stone;
                ctx.fillRect(px, py, TILE, TILE);
                // Pillar
                ctx.fillStyle = P.wallLight;
                ctx.fillRect(px + 3, py, 10, TILE);
                ctx.fillStyle = P.wall;
                ctx.fillRect(px + 5, py, 6, TILE);
                break;
                
            case TILES.CRATE:
                ctx.fillStyle = P.stone;
                ctx.fillRect(px, py, TILE, TILE);
                // Crate
                ctx.fillStyle = P.wood;
                ctx.fillRect(px + 2, py + 4, 12, 12);
                ctx.fillStyle = P.shadow;
                ctx.fillRect(px + 2, py + 9, 12, 1);
                ctx.fillRect(px + 7, py + 4, 1, 12);
                break;
                
            case TILES.STAIRS_UP:
            case TILES.STAIRS_DOWN:
                ctx.fillStyle = P.stone;
                ctx.fillRect(px, py, TILE, TILE);
                // Steps
                ctx.fillStyle = P.wallLight;
                for (let i = 0; i < 4; i++) {
                    ctx.fillRect(px + 2, py + 2 + i * 3, 12 - i * 2, 2);
                }
                break;
                
            case TILES.EXIT_N:
            case TILES.EXIT_S:
            case TILES.EXIT_E:
            case TILES.EXIT_W:
                // Transition zone - subtle glow
                ctx.fillStyle = P.stone;
                ctx.fillRect(px, py, TILE, TILE);
                ctx.fillStyle = 'rgba(150, 140, 100, 0.2)';
                ctx.fillRect(px, py, TILE, TILE);
                break;
                
            case TILES.BLOOD:
                ctx.fillStyle = P.stone;
                ctx.fillRect(px, py, TILE, TILE);
                // Blood splatter
                ctx.fillStyle = P.blood;
                ctx.fillRect(px + 4, py + 5, 6, 4);
                ctx.fillRect(px + 2, py + 7, 3, 2);
                ctx.fillRect(px + 9, py + 4, 2, 3);
                break;
                
            case TILES.MOSS:
                ctx.fillStyle = P.stone;
                ctx.fillRect(px, py, TILE, TILE);
                ctx.fillStyle = P.moss;
                ctx.fillRect(px + 1, py + 10, 5, 4);
                ctx.fillRect(px + 8, py + 12, 4, 3);
                break;
                
            default:
                // Unknown tile - checkerboard
                ctx.fillStyle = (tx + ty) % 2 ? '#ff00ff' : '#000000';
                ctx.fillRect(px, py, TILE, TILE);
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
    
    function renderNPC(ctx, entity, px, py) {
        const P = Engine.PALETTE;
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(px + 8, py + 14, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillStyle = entity.color || P.npc;
        ctx.fillRect(px + 3, py + 5, 10, 9);
        
        // Head
        ctx.fillStyle = '#a09080';
        ctx.fillRect(px + 4, py + 1, 8, 6);
        
        // Eyes
        ctx.fillStyle = '#202020';
        ctx.fillRect(px + 5, py + 3, 2, 2);
        ctx.fillRect(px + 9, py + 3, 2, 2);
        
        // Quest marker if applicable
        if (entity.hasQuest) {
            ctx.fillStyle = P.gold;
            ctx.font = 'bold 10px monospace';
            ctx.fillText('!', px + 6, py - 2);
        }
    }
    
    function renderEnemy(ctx, entity, px, py) {
        const P = Engine.PALETTE;
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(px + 8, py + 14, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body (more menacing)
        ctx.fillStyle = entity.color || P.enemy;
        ctx.fillRect(px + 2, py + 4, 12, 10);
        
        // Head
        ctx.fillStyle = '#3a2020';
        ctx.fillRect(px + 3, py + 1, 10, 5);
        
        // Glowing eyes
        ctx.fillStyle = '#ff3030';
        ctx.fillRect(px + 4, py + 2, 2, 2);
        ctx.fillRect(px + 10, py + 2, 2, 2);
    }
    
    function renderItem(ctx, entity, px, py) {
        const P = Engine.PALETTE;
        
        // Glow
        ctx.fillStyle = 'rgba(120, 110, 60, 0.3)';
        ctx.beginPath();
        ctx.arc(px + 8, py + 10, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Item
        ctx.fillStyle = entity.color || P.item;
        ctx.fillRect(px + 5, py + 6, 6, 6);
        
        // Sparkle
        ctx.fillStyle = P.uiHighlight;
        ctx.fillRect(px + 6, py + 4, 2, 2);
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
        getWidth: () => mapWidth,
        getHeight: () => mapHeight,
        
        // Tile constants
        TILES
    };
})();
