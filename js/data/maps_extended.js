/*************************************************************
 * maps_extended.js — Additional Map Data for Canvas Mode
 * Adds: Verath Inn, Smithy, Scholar, Columns, Undercity
 *       Crossroads, Watchtower Path & Summit
 * 
 * MERGE THIS INTO maps.js or load after it
 *************************************************************/

(function() {
    // Grab the tile shorthand from Maps if available
    const T = typeof Maps !== 'undefined' ? Maps.getTileShorthand() : {
        V: 0, F: 1, W: 2, WT: 3, D: 4, G: 5, P: 6, WA: 7,
        DR: 10, DC: 11, PI: 12, CR: 13, TB: 14, CH: 15, BD: 16,
        SU: 20, SD: 21, EN: 22, ES: 23, EE: 24, EW: 25,
        BL: 30, MS: 31, CK: 32, RB: 33
    };

    // === ADDITIONAL MAPS ===
    const additionalMaps = {

        // ═══════════════════════════════════════════
        // VERATH'S INN — The Weary Rest
        // ═══════════════════════════════════════════
        verath_inn: {
            name: "The Weary Rest",
            width: 20,
            height: 16,
            playerSpawn: { x: 10, y: 14 },
            
            tiles: [
                // Row 0 - Top wall
                T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,
                // Row 1
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.W, T.W, T.F, T.F, T.W, T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 2 - Rooms
                T.W, T.F, T.BD,T.F, T.F, T.F, T.F, T.W, T.W, T.F, T.F, T.W, T.W, T.F, T.F, T.F, T.BD,T.F, T.F, T.W,
                // Row 3
                T.W, T.F, T.F, T.F, T.CR,T.F, T.F, T.DR,T.DR,T.F, T.F, T.DR,T.DR,T.F, T.F, T.CR,T.F, T.F, T.F, T.W,
                // Row 4
                T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.F, T.F, T.F, T.F, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W,
                // Row 5 - Hallway
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 6
                T.W, T.F, T.F, T.F, T.F, T.F, T.PI,T.F, T.F, T.F, T.F, T.F, T.F, T.PI,T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 7 - Common room
                T.W, T.F, T.F, T.TB,T.CH,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.CH,T.TB,T.F, T.F, T.W,
                // Row 8
                T.W, T.F, T.F, T.F, T.CH,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.CH,T.F, T.F, T.F, T.W,
                // Row 9
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.TB,T.TB,T.TB,T.TB,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 10 - Bar area
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 11
                T.W, T.CR,T.CR,T.CR,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.CR,T.CR,T.CR,T.W,
                // Row 12
                T.W, T.F, T.F, T.F, T.F, T.F, T.PI,T.F, T.F, T.F, T.F, T.F, T.F, T.PI,T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 13
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 14 - Exit
                T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.ES,T.ES,T.ES,T.ES,T.W, T.W, T.W, T.W, T.W, T.W, T.W, T.W,
                // Row 15
                T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT
            ],
            
            entities: [
                // Yesta behind the bar
                { type: 'npc', id: 'yesta', x: 10, y: 10, color: '#7a7a6a' },
                
                // Cael the bard
                { type: 'npc', id: 'cael', x: 5, y: 8, color: '#6a5a7a' },
                
                // Patron
                { type: 'npc', id: 'drunk_patron', x: 15, y: 7, color: '#5a5a5a' },
                
                // Mysterious stranger in corner
                { type: 'npc', id: 'hooded_figure', x: 2, y: 7, hasQuest: true, color: '#3a3a4a' }
            ],
            
            transitions: [
                { x: 8, y: 14, target: 'verath_market', spawnX: 4, spawnY: 3 },
                { x: 9, y: 14, target: 'verath_market', spawnX: 4, spawnY: 3 },
                { x: 10, y: 14, target: 'verath_market', spawnX: 4, spawnY: 3 },
                { x: 11, y: 14, target: 'verath_market', spawnX: 4, spawnY: 3 }
            ]
        },

        // ═══════════════════════════════════════════
        // VERATH'S SMITHY — Durren's Forge
        // ═══════════════════════════════════════════
        verath_smithy: {
            name: "Durren's Forge",
            width: 18,
            height: 14,
            playerSpawn: { x: 9, y: 12 },
            
            tiles: [
                // Row 0
                T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,
                // Row 1 - Forge area (hot!)
                T.W, T.BL,T.BL,T.BL,T.BL,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.CR,T.CR,T.CR,T.F, T.W,
                // Row 2
                T.W, T.BL,T.BL,T.BL,T.BL,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.CR,T.CR,T.CR,T.F, T.W,
                // Row 3 - Anvil area
                T.W, T.F, T.F, T.F, T.F, T.F, T.TB,T.F, T.F, T.F, T.F, T.TB,T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 4
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 5
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 6 - Display racks
                T.W, T.F, T.F, T.CR,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.CR,T.F, T.F, T.W,
                // Row 7
                T.W, T.F, T.F, T.CR,T.F, T.F, T.F, T.PI,T.F, T.F, T.PI,T.F, T.F, T.F, T.CR,T.F, T.F, T.W,
                // Row 8
                T.W, T.F, T.F, T.CR,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.CR,T.F, T.F, T.W,
                // Row 9 - Counter
                T.W, T.F, T.F, T.F, T.F, T.TB,T.TB,T.TB,T.TB,T.TB,T.TB,T.TB,T.TB,T.F, T.F, T.F, T.F, T.W,
                // Row 10
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 11
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 12 - Exit
                T.W, T.W, T.W, T.W, T.W, T.W, T.ES,T.ES,T.ES,T.ES,T.ES,T.ES,T.W, T.W, T.W, T.W, T.W, T.W,
                // Row 13
                T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT
            ],
            
            entities: [
                // Durren the blacksmith
                { type: 'npc', id: 'durren', x: 9, y: 4, hasQuest: true, color: '#8a6a5a' },
                
                // Apprentice
                { type: 'npc', id: 'smithy_apprentice', x: 3, y: 2, color: '#6a5a4a' }
            ],
            
            transitions: [
                { x: 6, y: 12, target: 'verath_market', spawnX: 20, spawnY: 3 },
                { x: 7, y: 12, target: 'verath_market', spawnX: 20, spawnY: 3 },
                { x: 8, y: 12, target: 'verath_market', spawnX: 20, spawnY: 3 },
                { x: 9, y: 12, target: 'verath_market', spawnX: 20, spawnY: 3 },
                { x: 10, y: 12, target: 'verath_market', spawnX: 20, spawnY: 3 },
                { x: 11, y: 12, target: 'verath_market', spawnX: 20, spawnY: 3 }
            ]
        },

        // ═══════════════════════════════════════════
        // VERATH'S SCHOLAR — Aldric's Study
        // ═══════════════════════════════════════════
        verath_scholar: {
            name: "Aldric's Study",
            width: 16,
            height: 14,
            playerSpawn: { x: 8, y: 12 },
            
            tiles: [
                // Row 0
                T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,
                // Row 1 - Bookshelves
                T.W, T.CR,T.CR,T.CR,T.CR,T.F, T.F, T.F, T.F, T.F, T.F, T.CR,T.CR,T.CR,T.CR,T.W,
                // Row 2
                T.W, T.CR,T.CR,T.CR,T.CR,T.F, T.F, T.F, T.F, T.F, T.F, T.CR,T.CR,T.CR,T.CR,T.W,
                // Row 3
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 4 - Study tables
                T.W, T.F, T.F, T.TB,T.CH,T.F, T.F, T.F, T.F, T.F, T.F, T.CH,T.TB,T.F, T.F, T.W,
                // Row 5
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 6 - Center desk
                T.W, T.F, T.F, T.F, T.F, T.F, T.TB,T.TB,T.TB,T.TB,T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 7
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 8
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.CH,T.CH,T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 9
                T.W, T.PI,T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.PI,T.W,
                // Row 10
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 11
                T.W, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.F, T.W,
                // Row 12 - Exit
                T.W, T.W, T.W, T.W, T.W, T.W, T.ES,T.ES,T.ES,T.ES,T.W, T.W, T.W, T.W, T.W, T.W,
                // Row 13
                T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT,T.WT
            ],
            
            entities: [
                // Aldric the scholar
                { type: 'npc', id: 'aldric', x: 8, y: 5, hasQuest: true, color: '#5a5a7a' },
                
                // Student
                { type: 'npc', id: 'scholar_student', x: 4, y: 4, color: '#6a6a6a' },
                
                // Spell tome on table
                { type: 'item', id: 'tome_fire', x: 7, y: 6, color: '#8a3030' }
            ],
            
            transitions: [
                { x: 6, y: 12, target: 'verath_columns', spawnX: 12, spawnY: 3 },
                { x: 7, y: 12, target: 'verath_columns', spawnX: 12, spawnY: 3 },
                { x: 8, y: 12, target: 'verath_columns', spawnX: 12, spawnY: 3 },
                { x: 9, y: 12, target: 'verath_columns', spawnX: 12, spawnY: 3 }
            ]
        },

        // ═══════════════════════════════════════════
        // VERATH'S COLUMNS — Ruined colonnade
        // ═══════════════════════════════════════════
        verath_columns: {
            name: "The Broken Columns",
            width: 24,
            height: 18,
            playerSpawn: { x: 12, y: 16 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 18; y++) {
                    for (let x = 0; x < 24; x++) {
                        // Top wall with exit to scholar
                        if (y === 0) {
                            t.push(T.WT);
                        } else if (y === 1) {
                            if (x >= 10 && x <= 14) t.push(T.DR);
                            else t.push(T.W);
                        }
                        // Bottom wall with exit to arch
                        else if (y === 17) {
                            t.push(T.WT);
                        } else if (y === 16) {
                            if (x >= 10 && x <= 14) t.push(T.ES);
                            else t.push(T.W);
                        }
                        // Side walls
                        else if (x === 0 || x === 23) {
                            t.push(T.W);
                        }
                        // Pillars in grid pattern
                        else if ((x === 4 || x === 10 || x === 14 || x === 20) && 
                                 (y === 4 || y === 8 || y === 12)) {
                            t.push(T.PI);
                        }
                        // Rubble near some pillars
                        else if ((x === 5 && y === 5) || (x === 19 && y === 9) || 
                                 (x === 11 && y === 13)) {
                            t.push(T.RB);
                        }
                        // Moss patches
                        else if ((x + y * 7) % 17 === 0) {
                            t.push(T.MS);
                        }
                        // Blood stain (something happened here)
                        else if (x >= 6 && x <= 8 && y >= 6 && y <= 7) {
                            t.push(T.BL);
                        }
                        // Stone floor
                        else {
                            t.push(T.F);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Wounded traveler
                { type: 'npc', id: 'wounded_traveler', x: 7, y: 7, hasQuest: true, color: '#7a5050' },
                
                // Lurking enemy
                { type: 'enemy', id: 'shade', x: 18, y: 10, color: '#2a2a3a' }
            ],
            
            transitions: [
                // North to Scholar
                { x: 10, y: 1, target: 'verath_scholar', spawnX: 8, spawnY: 11 },
                { x: 11, y: 1, target: 'verath_scholar', spawnX: 8, spawnY: 11 },
                { x: 12, y: 1, target: 'verath_scholar', spawnX: 8, spawnY: 11 },
                { x: 13, y: 1, target: 'verath_scholar', spawnX: 8, spawnY: 11 },
                { x: 14, y: 1, target: 'verath_scholar', spawnX: 8, spawnY: 11 },
                
                // South to Arch
                { x: 10, y: 16, target: 'verath_arch', spawnX: 2, spawnY: 10 },
                { x: 11, y: 16, target: 'verath_arch', spawnX: 2, spawnY: 10 },
                { x: 12, y: 16, target: 'verath_arch', spawnX: 2, spawnY: 10 },
                { x: 13, y: 16, target: 'verath_arch', spawnX: 2, spawnY: 10 },
                { x: 14, y: 16, target: 'verath_arch', spawnX: 2, spawnY: 10 }
            ]
        },

        // ═══════════════════════════════════════════
        // VERATH'S UNDERCITY — Dark tunnels below
        // ═══════════════════════════════════════════
        verath_undercity: {
            name: "The Undercity",
            width: 28,
            height: 20,
            playerSpawn: { x: 2, y: 10 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 20; y++) {
                    for (let x = 0; x < 28; x++) {
                        // Mostly void with carved passages
                        
                        // Border
                        if (y === 0 || y === 19 || x === 27) {
                            t.push(T.V);
                        }
                        // West entrance from arch
                        else if (x === 0) {
                            if (y >= 9 && y <= 11) t.push(T.EW);
                            else t.push(T.V);
                        }
                        // Main west-east corridor
                        else if (y >= 9 && y <= 11 && x <= 20) {
                            t.push(T.F);
                        }
                        // North branch
                        else if (x >= 10 && x <= 12 && y >= 3 && y <= 9) {
                            t.push(T.F);
                        }
                        // North chamber
                        else if (x >= 6 && x <= 16 && y >= 2 && y <= 5) {
                            if (x === 6 || x === 16 || y === 2) t.push(T.W);
                            else t.push(T.F);
                        }
                        // South branch
                        else if (x >= 15 && x <= 17 && y >= 11 && y <= 16) {
                            t.push(T.F);
                        }
                        // South chamber (water room)
                        else if (x >= 12 && x <= 22 && y >= 14 && y <= 17) {
                            if (x === 12 || x === 22 || y === 17) t.push(T.W);
                            else if (x >= 17 && x <= 20 && y >= 15 && y <= 16) t.push(T.WA);
                            else t.push(T.F);
                        }
                        // East dead end / treasure room
                        else if (x >= 20 && x <= 25 && y >= 8 && y <= 12) {
                            if (y === 8 || y === 12 || x === 25) t.push(T.W);
                            else t.push(T.F);
                        }
                        // Void everywhere else
                        else {
                            t.push(T.V);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Sewer rats
                { type: 'enemy', id: 'giant_rat', x: 8, y: 10, color: '#4a3a3a' },
                { type: 'enemy', id: 'giant_rat', x: 14, y: 15, color: '#4a3a3a' },
                
                // Shade Company smuggler
                { type: 'npc', id: 'smuggler', x: 11, y: 4, hasQuest: true, color: '#3a3a4a' },
                
                // Hidden treasure
                { type: 'item', id: 'ancient_coin', x: 23, y: 10, color: '#9a8a40' },
                
                // Something in the water...
                { type: 'enemy', id: 'drowned_one', x: 19, y: 16, color: '#3a4a5a' }
            ],
            
            transitions: [
                // West to Arch
                { x: 0, y: 9, target: 'verath_arch', spawnX: 22, spawnY: 10 },
                { x: 0, y: 10, target: 'verath_arch', spawnX: 22, spawnY: 10 },
                { x: 0, y: 11, target: 'verath_arch', spawnX: 22, spawnY: 10 }
            ]
        },

        // ═══════════════════════════════════════════
        // CROSSROADS — Wilderness hub
        // ═══════════════════════════════════════════
        crossroads: {
            name: "The Crossroads",
            width: 30,
            height: 20,
            playerSpawn: { x: 2, y: 10 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 20; y++) {
                    for (let x = 0; x < 30; x++) {
                        // North exit (to watchtower path)
                        if (y === 0 && x >= 13 && x <= 16) {
                            t.push(T.EN);
                        } else if (y === 0) {
                            t.push(T.G);
                        }
                        // South exit (to greystone road)
                        else if (y === 19 && x >= 13 && x <= 16) {
                            t.push(T.ES);
                        } else if (y === 19) {
                            t.push(T.G);
                        }
                        // West exit (to road)
                        else if (x === 0 && y >= 9 && y <= 11) {
                            t.push(T.EW);
                        } else if (x === 0) {
                            t.push(T.G);
                        }
                        // East exit (to ironwood)
                        else if (x === 29 && y >= 9 && y <= 11) {
                            t.push(T.EE);
                        } else if (x === 29) {
                            t.push(T.G);
                        }
                        // Main crossroads path (+ shape)
                        else if ((x >= 13 && x <= 16) || (y >= 9 && y <= 11)) {
                            t.push(T.P);
                        }
                        // Signpost area
                        else if (x === 14 && y === 10) {
                            t.push(T.PI); // Signpost
                        }
                        // Trees/rocks scattered
                        else if ((x * 7 + y * 13) % 23 === 0) {
                            t.push(T.CR); // Rocks
                        }
                        // Grass with dirt patches
                        else if ((x + y) % 6 === 0) {
                            t.push(T.D);
                        }
                        else {
                            t.push(T.G);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Scout Nem
                { type: 'npc', id: 'scout_nem', x: 16, y: 10, hasQuest: true, color: '#5a6a5a' },
                
                // Bandits lurking
                { type: 'enemy', id: 'bandit', x: 24, y: 5, color: '#5a4040' },
                { type: 'enemy', id: 'bandit_archer', x: 6, y: 15, color: '#5a4040' }
            ],
            
            transitions: [
                // West to Road
                { x: 0, y: 9, target: 'road', spawnX: 27, spawnY: 6 },
                { x: 0, y: 10, target: 'road', spawnX: 27, spawnY: 7 },
                { x: 0, y: 11, target: 'road', spawnX: 27, spawnY: 8 },
                
                // North to Watchtower Path
                { x: 13, y: 0, target: 'watchtower_path', spawnX: 10, spawnY: 17 },
                { x: 14, y: 0, target: 'watchtower_path', spawnX: 10, spawnY: 17 },
                { x: 15, y: 0, target: 'watchtower_path', spawnX: 10, spawnY: 17 },
                { x: 16, y: 0, target: 'watchtower_path', spawnX: 10, spawnY: 17 },
                
                // South to Greystone Road
                { x: 13, y: 19, target: 'greystone_road', spawnX: 10, spawnY: 2 },
                { x: 14, y: 19, target: 'greystone_road', spawnX: 10, spawnY: 2 },
                { x: 15, y: 19, target: 'greystone_road', spawnX: 10, spawnY: 2 },
                { x: 16, y: 19, target: 'greystone_road', spawnX: 10, spawnY: 2 },
                
                // East to Ironwood
                { x: 29, y: 9, target: 'ironwood_outpost', spawnX: 2, spawnY: 10 },
                { x: 29, y: 10, target: 'ironwood_outpost', spawnX: 2, spawnY: 10 },
                { x: 29, y: 11, target: 'ironwood_outpost', spawnX: 2, spawnY: 10 }
            ]
        },

        // ═══════════════════════════════════════════
        // WATCHTOWER PATH — Mountain trail
        // ═══════════════════════════════════════════
        watchtower_path: {
            name: "Watchtower Path",
            width: 22,
            height: 20,
            playerSpawn: { x: 10, y: 17 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 20; y++) {
                    for (let x = 0; x < 22; x++) {
                        // North exit to summit
                        if (y === 0 && x >= 9 && x <= 12) {
                            t.push(T.EN);
                        } else if (y === 0) {
                            t.push(T.W); // Mountain wall
                        }
                        // South exit to crossroads
                        else if (y === 19 && x >= 8 && x <= 12) {
                            t.push(T.ES);
                        } else if (y === 19) {
                            t.push(T.G);
                        }
                        // Side walls (mountain)
                        else if (x === 0 || x === 21) {
                            t.push(T.W);
                        }
                        // Winding path up the mountain
                        else if (
                            // Bottom section
                            (y >= 16 && y <= 18 && x >= 8 && x <= 12) ||
                            // First turn
                            (y >= 13 && y <= 16 && x >= 4 && x <= 8) ||
                            // Second turn
                            (y >= 9 && y <= 13 && x >= 8 && x <= 14) ||
                            // Third turn
                            (y >= 5 && y <= 9 && x >= 14 && x <= 18) ||
                            // Final approach
                            (y >= 1 && y <= 5 && x >= 9 && x <= 14)
                        ) {
                            t.push(T.P);
                        }
                        // Rock/cliff areas
                        else if (x < 4 || x > 18 || (y < 8 && (x < 8 || x > 15))) {
                            t.push(T.W);
                        }
                        // Dirt/grass
                        else {
                            t.push((x + y) % 3 === 0 ? T.D : T.G);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Mountain wolves
                { type: 'enemy', id: 'mountain_wolf', x: 6, y: 14, color: '#5a5a5a' },
                { type: 'enemy', id: 'mountain_wolf', x: 16, y: 7, color: '#5a5a5a' },
                
                // Dead adventurer with loot
                { type: 'item', id: 'adventurer_pack', x: 12, y: 11, color: '#6a5a4a' }
            ],
            
            transitions: [
                // South to Crossroads
                { x: 8, y: 19, target: 'crossroads', spawnX: 14, spawnY: 2 },
                { x: 9, y: 19, target: 'crossroads', spawnX: 14, spawnY: 2 },
                { x: 10, y: 19, target: 'crossroads', spawnX: 14, spawnY: 2 },
                { x: 11, y: 19, target: 'crossroads', spawnX: 14, spawnY: 2 },
                { x: 12, y: 19, target: 'crossroads', spawnX: 14, spawnY: 2 },
                
                // North to Summit
                { x: 9, y: 0, target: 'watchtower_summit', spawnX: 10, spawnY: 17 },
                { x: 10, y: 0, target: 'watchtower_summit', spawnX: 10, spawnY: 17 },
                { x: 11, y: 0, target: 'watchtower_summit', spawnX: 10, spawnY: 17 },
                { x: 12, y: 0, target: 'watchtower_summit', spawnX: 10, spawnY: 17 }
            ]
        },

        // ═══════════════════════════════════════════
        // WATCHTOWER SUMMIT — Ancient tower ruins
        // ═══════════════════════════════════════════
        watchtower_summit: {
            name: "Watchtower Summit",
            width: 20,
            height: 20,
            playerSpawn: { x: 10, y: 17 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 20; y++) {
                    for (let x = 0; x < 20; x++) {
                        // Outer void (cliff edge)
                        if (x <= 1 || x >= 18 || y <= 1) {
                            t.push(T.V);
                        }
                        // South exit
                        else if (y === 19 && x >= 8 && x <= 12) {
                            t.push(T.ES);
                        } else if (y === 19) {
                            t.push(T.W);
                        }
                        // Tower structure (circular-ish)
                        else if (
                            (x >= 6 && x <= 14 && y >= 4 && y <= 12) &&
                            !((x === 6 || x === 14) && (y === 4 || y === 12)) // Cut corners
                        ) {
                            // Tower interior
                            if (x >= 8 && x <= 12 && y >= 6 && y <= 10) {
                                if (x === 10 && y === 8) t.push(T.PI); // Center pillar
                                else t.push(T.F);
                            }
                            // Tower walls
                            else if (x === 7 || x === 13 || y === 5 || y === 11) {
                                if (y === 11 && x === 10) t.push(T.DR); // Entrance
                                else t.push(T.W);
                            }
                            else t.push(T.F);
                        }
                        // Platform around tower
                        else if (x >= 4 && x <= 16 && y >= 3 && y <= 16) {
                            t.push(T.F);
                        }
                        // Path to south
                        else if (x >= 8 && x <= 12 && y >= 16) {
                            t.push(T.P);
                        }
                        // Cliff walls
                        else {
                            t.push(T.W);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // The Watcher (boss-tier NPC/enemy)
                { type: 'npc', id: 'the_watcher', x: 10, y: 7, hasQuest: true, color: '#4a4a6a' },
                
                // Ancient chest
                { type: 'item', id: 'ancient_chest', x: 10, y: 9, color: '#8a7a40' },
                
                // Gargoyle enemy
                { type: 'enemy', id: 'stone_gargoyle', x: 5, y: 8, color: '#5a5a5a' }
            ],
            
            transitions: [
                // South to Path
                { x: 8, y: 19, target: 'watchtower_path', spawnX: 10, spawnY: 2 },
                { x: 9, y: 19, target: 'watchtower_path', spawnX: 10, spawnY: 2 },
                { x: 10, y: 19, target: 'watchtower_path', spawnX: 10, spawnY: 2 },
                { x: 11, y: 19, target: 'watchtower_path', spawnX: 10, spawnY: 2 },
                { x: 12, y: 19, target: 'watchtower_path', spawnX: 10, spawnY: 2 }
            ]
        },

        // ═══════════════════════════════════════════
        // GREYSTONE ROAD — Path to the village
        // ═══════════════════════════════════════════
        greystone_road: {
            name: "Greystone Road",
            width: 25,
            height: 15,
            playerSpawn: { x: 10, y: 2 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 15; y++) {
                    for (let x = 0; x < 25; x++) {
                        // North exit to crossroads
                        if (y === 0 && x >= 8 && x <= 12) {
                            t.push(T.EN);
                        } else if (y === 0) {
                            t.push(T.G);
                        }
                        // South exit to village
                        else if (y === 14 && x >= 10 && x <= 14) {
                            t.push(T.ES);
                        } else if (y === 14) {
                            t.push(T.G);
                        }
                        // Side borders
                        else if (x === 0 || x === 24) {
                            t.push(T.G);
                        }
                        // Main road
                        else if (x >= 10 && x <= 14) {
                            t.push(T.P);
                        }
                        // Stone walls along road
                        else if (x === 9 || x === 15) {
                            if (y % 4 === 0) t.push(T.CR);
                            else t.push(T.G);
                        }
                        // Fields
                        else {
                            t.push((x + y) % 4 === 0 ? T.D : T.G);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Farmer
                { type: 'npc', id: 'farmer', x: 5, y: 7, color: '#6a5a4a' },
                
                // Wild dogs
                { type: 'enemy', id: 'wild_dog', x: 20, y: 10, color: '#5a4a3a' }
            ],
            
            transitions: [
                // North to Crossroads
                { x: 8, y: 0, target: 'crossroads', spawnX: 14, spawnY: 17 },
                { x: 9, y: 0, target: 'crossroads', spawnX: 14, spawnY: 17 },
                { x: 10, y: 0, target: 'crossroads', spawnX: 14, spawnY: 17 },
                { x: 11, y: 0, target: 'crossroads', spawnX: 14, spawnY: 17 },
                { x: 12, y: 0, target: 'crossroads', spawnX: 14, spawnY: 17 },
                
                // South to Greystone Village
                { x: 10, y: 14, target: 'greystone_village', spawnX: 12, spawnY: 2 },
                { x: 11, y: 14, target: 'greystone_village', spawnX: 12, spawnY: 2 },
                { x: 12, y: 14, target: 'greystone_village', spawnX: 12, spawnY: 2 },
                { x: 13, y: 14, target: 'greystone_village', spawnX: 12, spawnY: 2 },
                { x: 14, y: 14, target: 'greystone_village', spawnX: 12, spawnY: 2 }
            ]
        },

        // ═══════════════════════════════════════════
        // IRONWOOD OUTPOST — Eastern frontier
        // ═══════════════════════════════════════════
        ironwood_outpost: {
            name: "Ironwood Outpost",
            width: 24,
            height: 18,
            playerSpawn: { x: 2, y: 10 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 18; y++) {
                    for (let x = 0; x < 24; x++) {
                        // West exit to crossroads
                        if (x === 0 && y >= 9 && y <= 11) {
                            t.push(T.EW);
                        } else if (x === 0) {
                            t.push(T.G);
                        }
                        // Palisade walls
                        else if (y === 0 || y === 17 || x === 23) {
                            t.push(T.W);
                        }
                        // Gate
                        else if (x === 1 && (y < 9 || y > 11)) {
                            t.push(T.W);
                        }
                        // Main building
                        else if (x >= 14 && x <= 21 && y >= 3 && y <= 8) {
                            if (x === 14 || x === 21 || y === 3 || y === 8) {
                                if (x === 17 && y === 8) t.push(T.DR);
                                else t.push(T.W);
                            } else {
                                t.push(T.F);
                            }
                        }
                        // Barracks
                        else if (x >= 14 && x <= 21 && y >= 11 && y <= 15) {
                            if (x === 14 || x === 21 || y === 11 || y === 15) {
                                if (x === 17 && y === 11) t.push(T.DR);
                                else t.push(T.W);
                            } else {
                                if (y === 13) t.push(T.BD);
                                else t.push(T.F);
                            }
                        }
                        // Training yard
                        else if (x >= 4 && x <= 11 && y >= 4 && y <= 9) {
                            t.push(T.D);
                        }
                        // Storage
                        else if (x >= 4 && x <= 8 && y >= 12 && y <= 15) {
                            if ((x === 5 || x === 7) && (y === 13 || y === 14)) t.push(T.CR);
                            else t.push(T.F);
                        }
                        // Ground
                        else {
                            t.push(T.G);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Commander
                { type: 'npc', id: 'commander_vex', x: 17, y: 5, hasQuest: true, color: '#6a5a5a' },
                
                // Soldiers
                { type: 'npc', id: 'soldier_1', x: 7, y: 6, color: '#5a5a6a' },
                { type: 'npc', id: 'soldier_2', x: 9, y: 7, color: '#5a5a6a' },
                
                // Quartermaster
                { type: 'npc', id: 'quartermaster', x: 6, y: 13, color: '#5a6a5a' }
            ],
            
            transitions: [
                // West to Crossroads
                { x: 0, y: 9, target: 'crossroads', spawnX: 27, spawnY: 9 },
                { x: 0, y: 10, target: 'crossroads', spawnX: 27, spawnY: 10 },
                { x: 0, y: 11, target: 'crossroads', spawnX: 27, spawnY: 11 }
            ]
        }
    };

    // === MERGE INTO MAPS MODULE ===
    if (typeof Maps !== 'undefined' && Maps.get) {
        // Store original get function
        const originalGet = Maps.get;
        
        // Override with extended version
        Maps.get = function(areaId) {
            const normalizedId = areaId.toLowerCase().replace(/\s+/g, '_');
            
            // Check additional maps first
            if (additionalMaps[normalizedId]) {
                return additionalMaps[normalizedId];
            }
            
            // Fall back to original
            return originalGet(areaId);
        };
        
        // Extend list function
        const originalList = Maps.list;
        Maps.list = function() {
            return [...originalList(), ...Object.keys(additionalMaps)];
        };
        
        // Extend has function
        Maps.has = function(areaId) {
            const normalizedId = areaId.toLowerCase().replace(/\s+/g, '_');
            return !!additionalMaps[normalizedId] || !!originalGet(areaId);
        };
        
        console.log('[Maps] Extended with', Object.keys(additionalMaps).length, 'additional areas');
    } else {
        console.warn('[Maps] Base Maps module not found - storing additionalMaps globally');
        window.additionalMaps = additionalMaps;
    }
})();