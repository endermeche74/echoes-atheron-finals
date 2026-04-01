/*************************************************************
 * maps.js — Map Data for Canvas Mode
 * Defines: tile layouts, entity placements, transitions
 * Each area gets a map definition
 *************************************************************/

const Maps = (function() {
    const T = {
        // Shorthand for tile types (matches Tilemap.TILES)
        V: 0,   // VOID
        F: 1,   // FLOOR
        W: 2,   // WALL
        WT: 3,  // WALL_TOP
        D: 4,   // DIRT
        G: 5,   // GRASS
        P: 6,   // PATH
        WA: 7,  // WATER
        DR: 10, // DOOR
        DC: 11, // DOOR_CLOSED
        PI: 12, // PILLAR
        CR: 13, // CRATE
        TB: 14, // TABLE
        CH: 15, // CHAIR
        BD: 16, // BED
        SU: 20, // STAIRS_UP
        SD: 21, // STAIRS_DOWN
        EN: 22, // EXIT_N
        ES: 23, // EXIT_S
        EE: 24, // EXIT_E
        EW: 25, // EXIT_W
        BL: 30, // BLOOD
        MS: 31, // MOSS
        CK: 32, // CRACK
        RB: 33  // RUBBLE
    };
    
    // === MAP DEFINITIONS ===
    const maps = {
        
        // ═══════════════════════════════════════════
        // VERATH'S ARCH — Main entry point to the city
        // ═══════════════════════════════════════════
        verath_arch: {
            name: "Verath's Arch",
            width: 25,
            height: 20,
            playerSpawn: { x: 12, y: 17 },
            
            tiles: [
                // Row 0 - Top wall
                T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,
                // Row 1
                T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.EN,T.EN,T.EN,T.EN,T.EN,T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W,
                // Row 2
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.PI,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.PI,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 3
                T.W, T.F, T.CR,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.CR,T.F, T.W,
                // Row 4
                T.W, T.F, T.F, T.F, T.F, T.TB,T.CH,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.CH,T.TB,T.F, T.F, T.F, T.F, T.W,
                // Row 5
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.PI,T.F, T.F, T.F, T.PI,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 6
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 7 - Center area
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 8
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 9
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.PI,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.PI,T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 10
                T.EW,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.EE,
                // Row 11
                T.EW,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.EE,
                // Row 12
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.PI,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.PI,T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 13
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 14
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.P, T.P, T.P, T.P, T.P, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 15
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.P, T.P, T.P, T.P, T.P, T.P, T.P, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 16
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.P, T.P, T.P, T.P, T.P, T.P, T.P, T.P, T.P, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 17 - Player spawn row
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.P, T.P, T.P, T.P, T.P, T.P, T.P, T.P, T.P, T.P, T.P, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 18
                T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.ES,T.ES,T.ES,T.ES,T.ES,T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W,
                // Row 19 - Bottom wall
                T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT
            ],
            
            entities: [
                // Maren the Gatewarden (quest giver)
                { type: 'npc', id: 'maren', x: 12, y: 7, hasQuest: true, 
                  color: '#6a6a7a' },
                  
                // Guard NPCs
                { type: 'npc', id: 'gate_guard_1', x: 9, y: 10, 
                  color: '#5a5a6a' },
                { type: 'npc', id: 'gate_guard_2', x: 15, y: 10, 
                  color: '#5a5a6a' },
                  
                // Merchant
                { type: 'npc', id: 'wandering_merchant', x: 5, y: 4, 
                  color: '#7a6a50' },
                
                // Decorative items
                { type: 'item', id: 'torch_1', x: 8, y: 2, color: '#a07030' },
                { type: 'item', id: 'torch_2', x: 16, y: 2, color: '#a07030' }
            ],
            
            transitions: [
                // North -> Market
                { x: 10, y: 1, target: 'verath_market', spawnX: 12, spawnY: 17 },
                { x: 11, y: 1, target: 'verath_market', spawnX: 12, spawnY: 17 },
                { x: 12, y: 1, target: 'verath_market', spawnX: 12, spawnY: 17 },
                { x: 13, y: 1, target: 'verath_market', spawnX: 12, spawnY: 17 },
                { x: 14, y: 1, target: 'verath_market', spawnX: 12, spawnY: 17 },
                
                // South -> Road
                { x: 10, y: 18, target: 'road', spawnX: 5, spawnY: 2 },
                { x: 11, y: 18, target: 'road', spawnX: 5, spawnY: 2 },
                { x: 12, y: 18, target: 'road', spawnX: 5, spawnY: 2 },
                { x: 13, y: 18, target: 'road', spawnX: 5, spawnY: 2 },
                { x: 14, y: 18, target: 'road', spawnX: 5, spawnY: 2 },
                
                // East -> Undercity entrance
                { x: 24, y: 10, target: 'verath_undercity', spawnX: 2, spawnY: 10 },
                { x: 24, y: 11, target: 'verath_undercity', spawnX: 2, spawnY: 10 },
                
                // West -> Columns
                { x: 0, y: 10, target: 'verath_columns', spawnX: 22, spawnY: 10 },
                { x: 0, y: 11, target: 'verath_columns', spawnX: 22, spawnY: 10 }
            ]
        },
        
        // ═══════════════════════════════════════════
        // VERATH'S MARKET — Shops and bustle
        // ═══════════════════════════════════════════
        verath_market: {
            name: "Verath's Market",
            width: 25,
            height: 20,
            playerSpawn: { x: 12, y: 17 },
            
            tiles: (function() {
                // Generate market layout
                const t = [];
                for (let y = 0; y < 20; y++) {
                    for (let x = 0; x < 25; x++) {
                        // Borders
                        if (y === 0 || y === 19) {
                            t.push(T.WT);
                        } else if (x === 0 || x === 24) {
                            t.push(T.W);
                        }
                        // South exit
                        else if (y === 18 && x >= 10 && x <= 14) {
                            t.push(T.ES);
                        } else if (y === 18) {
                            t.push(T.W);
                        }
                        // North exits to Inn and Smithy
                        else if (y === 1 && (x >= 3 && x <= 5)) {
                            t.push(T.DR); // Inn entrance
                        } else if (y === 1 && (x >= 19 && x <= 21)) {
                            t.push(T.DR); // Smithy entrance
                        } else if (y === 1) {
                            t.push(T.W);
                        }
                        // Market stalls (tables)
                        else if (y === 5 && (x === 4 || x === 8 || x === 16 || x === 20)) {
                            t.push(T.TB);
                        } else if (y === 10 && (x === 6 || x === 12 || x === 18)) {
                            t.push(T.CR);
                        }
                        // Pillars
                        else if (y === 4 && (x === 1 || x === 23)) {
                            t.push(T.PI);
                        } else if (y === 15 && (x === 1 || x === 23)) {
                            t.push(T.PI);
                        }
                        // Floor with variation
                        else {
                            t.push((x + y) % 7 === 0 ? T.P : T.F);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Durren the Blacksmith
                { type: 'npc', id: 'durren', x: 20, y: 3, hasQuest: true,
                  color: '#8a6a5a' },
                  
                // Yesta the Innkeeper  
                { type: 'npc', id: 'yesta', x: 4, y: 3,
                  color: '#7a7a6a' },
                  
                // Market vendors
                { type: 'npc', id: 'vendor_herbs', x: 4, y: 6,
                  color: '#5a7a5a' },
                { type: 'npc', id: 'vendor_weapons', x: 20, y: 6,
                  color: '#6a5a5a' },
                { type: 'npc', id: 'vendor_general', x: 12, y: 11,
                  color: '#6a6a5a' }
            ],
            
            transitions: [
                // South -> Arch
                { x: 10, y: 18, target: 'verath_arch', spawnX: 12, spawnY: 2 },
                { x: 11, y: 18, target: 'verath_arch', spawnX: 12, spawnY: 2 },
                { x: 12, y: 18, target: 'verath_arch', spawnX: 12, spawnY: 2 },
                { x: 13, y: 18, target: 'verath_arch', spawnX: 12, spawnY: 2 },
                { x: 14, y: 18, target: 'verath_arch', spawnX: 12, spawnY: 2 },
                
                // Inn entrance
                { x: 3, y: 1, target: 'verath_inn', spawnX: 10, spawnY: 17 },
                { x: 4, y: 1, target: 'verath_inn', spawnX: 10, spawnY: 17 },
                { x: 5, y: 1, target: 'verath_inn', spawnX: 10, spawnY: 17 },
                
                // Smithy entrance
                { x: 19, y: 1, target: 'verath_smithy', spawnX: 10, spawnY: 17 },
                { x: 20, y: 1, target: 'verath_smithy', spawnX: 10, spawnY: 17 },
                { x: 21, y: 1, target: 'verath_smithy', spawnX: 10, spawnY: 17 }
            ]
        },
        
        // ═══════════════════════════════════════════
        // ROAD — Wilderness path outside the city
        // ═══════════════════════════════════════════
        road: {
            name: "The Road",
            width: 30,
            height: 15,
            playerSpawn: { x: 5, y: 7 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 15; y++) {
                    for (let x = 0; x < 30; x++) {
                        // North wall / city edge
                        if (y === 0) {
                            if (x >= 3 && x <= 7) {
                                t.push(T.EN); // Exit to arch
                            } else {
                                t.push(T.W);
                            }
                        }
                        // Path running through
                        else if (y >= 6 && y <= 8) {
                            t.push(T.P);
                        }
                        // South edge
                        else if (y === 14) {
                            t.push(T.W);
                        }
                        // East exit
                        else if (x === 29 && y >= 6 && y <= 8) {
                            t.push(T.EE);
                        }
                        // West edge
                        else if (x === 0) {
                            t.push(T.W);
                        } else if (x === 29) {
                            t.push(T.W);
                        }
                        // Grass and dirt variation
                        else if ((x + y * 3) % 5 === 0) {
                            t.push(T.D);
                        } else {
                            t.push(T.G);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Random enemy encounter zone
                { type: 'enemy', id: 'wolf', x: 20, y: 7, color: '#4a4a4a' },
                { type: 'enemy', id: 'bandit', x: 15, y: 4, color: '#5a4040' }
            ],
            
            transitions: [
                // North -> Verath Arch
                { x: 3, y: 0, target: 'verath_arch', spawnX: 12, spawnY: 16 },
                { x: 4, y: 0, target: 'verath_arch', spawnX: 12, spawnY: 16 },
                { x: 5, y: 0, target: 'verath_arch', spawnX: 12, spawnY: 16 },
                { x: 6, y: 0, target: 'verath_arch', spawnX: 12, spawnY: 16 },
                { x: 7, y: 0, target: 'verath_arch', spawnX: 12, spawnY: 16 },
                
                // East -> Crossroads
                { x: 29, y: 6, target: 'crossroads', spawnX: 2, spawnY: 7 },
                { x: 29, y: 7, target: 'crossroads', spawnX: 2, spawnY: 7 },
                { x: 29, y: 8, target: 'crossroads', spawnX: 2, spawnY: 7 }
            ]
        }
    };
    
    // === HELPER: Get map with fallback ===
    function get(areaId) {
        // Normalize area ID (handle both _ and spaces)
        const normalizedId = areaId.toLowerCase().replace(/\s+/g, '_');
        
        if (maps[normalizedId]) {
            return maps[normalizedId];
        }
        
        // Check for partial matches
        for (const key of Object.keys(maps)) {
            if (key.includes(normalizedId) || normalizedId.includes(key)) {
                return maps[key];
            }
        }
        
        console.warn(`[Maps] No map found for: ${areaId}`);
        return null;
    }
    
    // === PUBLIC API ===
    return {
        get,
        has: (areaId) => !!get(areaId),
        list: () => Object.keys(maps),
        
        // For debugging
        getTileShorthand: () => T
    };
})();