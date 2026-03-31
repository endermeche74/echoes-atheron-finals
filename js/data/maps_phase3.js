/*************************************************************
 * maps_phase3.js — Phase 3 Map Data
 * Adds: Greystone Village, Old Mill, Colosseum District (5 areas)
 * 
 * Load AFTER maps.js and maps_extended.js
 *************************************************************/

(function() {
    const T = typeof Maps !== 'undefined' ? Maps.getTileShorthand() : {
        V: 0, F: 1, W: 2, WT: 3, D: 4, G: 5, P: 6, WA: 7,
        DR: 10, DC: 11, PI: 12, CR: 13, TB: 14, CH: 15, BD: 16,
        SU: 20, SD: 21, EN: 22, ES: 23, EE: 24, EW: 25,
        BL: 30, MS: 31, CK: 32, RB: 33
    };

    const phase3Maps = {

        // ═══════════════════════════════════════════
        // GREYSTONE VILLAGE — Rural farming community
        // ═══════════════════════════════════════════
        greystone_village: {
            name: "Greystone Village",
            width: 32,
            height: 24,
            playerSpawn: { x: 16, y: 2 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 24; y++) {
                    for (let x = 0; x < 32; x++) {
                        // North exit to greystone_road
                        if (y === 0 && x >= 14 && x <= 18) {
                            t.push(T.EN);
                        } else if (y === 0) {
                            t.push(T.G);
                        }
                        // South exit to old_mill
                        else if (y === 23 && x >= 14 && x <= 18) {
                            t.push(T.ES);
                        } else if (y === 23) {
                            t.push(T.G);
                        }
                        // East exit to colosseum_approach
                        else if (x === 31 && y >= 10 && y <= 13) {
                            t.push(T.EE);
                        } else if (x === 31) {
                            t.push(T.G);
                        }
                        // West border
                        else if (x === 0) {
                            t.push(T.G);
                        }
                        
                        // === VILLAGE CENTER ===
                        // Main square (cobblestone)
                        else if (x >= 12 && x <= 20 && y >= 8 && y <= 14) {
                            if (x === 16 && y === 11) t.push(T.PI); // Well/fountain
                            else t.push(T.F);
                        }
                        // Main road north-south
                        else if (x >= 15 && x <= 17 && (y < 8 || y > 14)) {
                            t.push(T.P);
                        }
                        // Road east
                        else if (y >= 11 && y <= 12 && x > 20) {
                            t.push(T.P);
                        }
                        
                        // === BUILDINGS ===
                        // Agatha's house (northwest)
                        else if (x >= 3 && x <= 9 && y >= 4 && y <= 8) {
                            if (x === 3 || x === 9 || y === 4 || y === 8) {
                                if (x === 6 && y === 8) t.push(T.DR);
                                else t.push(T.W);
                            } else {
                                if (x === 5 && y === 6) t.push(T.TB);
                                else if (x === 7 && y === 6) t.push(T.BD);
                                else t.push(T.F);
                            }
                        }
                        // Torven's farm (southwest)
                        else if (x >= 3 && x <= 10 && y >= 16 && y <= 21) {
                            // Barn
                            if (x >= 3 && x <= 7 && y >= 16 && y <= 19) {
                                if (x === 3 || x === 7 || y === 16 || y === 19) {
                                    if (x === 5 && y === 19) t.push(T.DR);
                                    else t.push(T.W);
                                } else t.push(T.F);
                            }
                            // Crops
                            else if (y >= 20) {
                                t.push(T.G);
                            }
                            else t.push(T.D);
                        }
                        // Bram's shop (east of square)
                        else if (x >= 23 && x <= 28 && y >= 5 && y <= 9) {
                            if (x === 23 || x === 28 || y === 5 || y === 9) {
                                if (x === 25 && y === 9) t.push(T.DR);
                                else t.push(T.W);
                            } else {
                                if (y === 7) t.push(T.CR); // Shelves
                                else t.push(T.F);
                            }
                        }
                        // Village hall (south of square)
                        else if (x >= 10 && x <= 22 && y >= 17 && y <= 21) {
                            if (x === 10 || x === 22 || y === 17 || y === 21) {
                                if (x === 16 && y === 17) t.push(T.DR);
                                else t.push(T.W);
                            } else {
                                if ((x === 12 || x === 20) && y === 19) t.push(T.PI);
                                else if (y === 19 && x >= 14 && x <= 18) t.push(T.TB);
                                else t.push(T.F);
                            }
                        }
                        
                        // Fences and decorations
                        else if ((x === 2 || x === 11) && y >= 4 && y <= 8) {
                            t.push(T.CR); // Fence posts
                        }
                        // Grass/dirt variation
                        else if ((x + y * 3) % 7 === 0) {
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
                // Agatha - elder/healer
                { type: 'npc', id: 'agatha', x: 6, y: 6, hasQuest: true, color: '#7a6a7a' },
                
                // Torven - farmer
                { type: 'npc', id: 'torven', x: 5, y: 18, color: '#6a5a4a' },
                
                // Bram - shopkeeper  
                { type: 'npc', id: 'bram', x: 25, y: 7, color: '#5a6a5a' },
                
                // Kael - village guard
                { type: 'npc', id: 'kael', x: 16, y: 10, color: '#5a5a6a' },
                
                // Soma - mysterious traveler in hall
                { type: 'npc', id: 'soma', x: 16, y: 19, hasQuest: true, color: '#4a4a5a' },
                
                // Villagers
                { type: 'npc', id: 'villager_1', x: 14, y: 12, color: '#6a6a5a' },
                { type: 'npc', id: 'villager_2', x: 19, y: 9, color: '#6a5a5a' },
                
                // Chickens near farm
                { type: 'item', id: 'chicken', x: 8, y: 20, color: '#9a9080' }
            ],
            
            transitions: [
                // North to Greystone Road
                { x: 14, y: 0, target: 'greystone_road', spawnX: 12, spawnY: 12 },
                { x: 15, y: 0, target: 'greystone_road', spawnX: 12, spawnY: 12 },
                { x: 16, y: 0, target: 'greystone_road', spawnX: 12, spawnY: 12 },
                { x: 17, y: 0, target: 'greystone_road', spawnX: 12, spawnY: 12 },
                { x: 18, y: 0, target: 'greystone_road', spawnX: 12, spawnY: 12 },
                
                // South to Old Mill
                { x: 14, y: 23, target: 'old_mill', spawnX: 15, spawnY: 2 },
                { x: 15, y: 23, target: 'old_mill', spawnX: 15, spawnY: 2 },
                { x: 16, y: 23, target: 'old_mill', spawnX: 15, spawnY: 2 },
                { x: 17, y: 23, target: 'old_mill', spawnX: 15, spawnY: 2 },
                { x: 18, y: 23, target: 'old_mill', spawnX: 15, spawnY: 2 },
                
                // East to Colosseum Approach
                { x: 31, y: 10, target: 'colosseum_approach', spawnX: 2, spawnY: 12 },
                { x: 31, y: 11, target: 'colosseum_approach', spawnX: 2, spawnY: 12 },
                { x: 31, y: 12, target: 'colosseum_approach', spawnX: 2, spawnY: 12 },
                { x: 31, y: 13, target: 'colosseum_approach', spawnX: 2, spawnY: 12 }
            ]
        },

        // ═══════════════════════════════════════════
        // OLD MILL — Haunted watermill (mill_mystery quest)
        // ═══════════════════════════════════════════
        old_mill: {
            name: "The Old Mill",
            width: 28,
            height: 22,
            playerSpawn: { x: 15, y: 2 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 22; y++) {
                    for (let x = 0; x < 28; x++) {
                        // North exit to village
                        if (y === 0 && x >= 13 && x <= 17) {
                            t.push(T.EN);
                        } else if (y === 0) {
                            t.push(T.G);
                        }
                        // Other borders
                        else if (y === 21 || x === 0 || x === 27) {
                            t.push(T.G);
                        }
                        
                        // === THE RIVER ===
                        else if (x >= 18 && x <= 21 && y >= 3 && y <= 19) {
                            t.push(T.WA);
                        }
                        // River banks
                        else if (x === 17 && y >= 3 && y <= 19) {
                            t.push(T.D);
                        }
                        else if (x === 22 && y >= 3 && y <= 19) {
                            t.push(T.D);
                        }
                        
                        // === THE MILL BUILDING ===
                        else if (x >= 6 && x <= 16 && y >= 8 && y <= 16) {
                            // Outer walls
                            if (x === 6 || x === 16 || y === 8 || y === 16) {
                                // Entrance
                                if (x === 11 && y === 16) t.push(T.DR);
                                // Connection to waterwheel
                                else if (x === 16 && y === 12) t.push(T.DR);
                                else t.push(T.W);
                            }
                            // Interior
                            else {
                                // Grinding stones (center)
                                if (x >= 10 && x <= 12 && y >= 11 && y <= 13) {
                                    t.push(T.PI);
                                }
                                // Storage
                                else if (x >= 7 && x <= 9 && y >= 9 && y <= 11) {
                                    t.push(T.CR);
                                }
                                // Blood stains (something happened here)
                                else if (x >= 13 && x <= 15 && y >= 14 && y <= 15) {
                                    t.push(T.BL);
                                }
                                else {
                                    t.push(T.F);
                                }
                            }
                        }
                        
                        // === WATERWHEEL PLATFORM ===
                        else if (x >= 16 && x <= 18 && y >= 10 && y <= 14) {
                            t.push(T.F);
                        }
                        
                        // === PATH ===
                        else if (x >= 10 && x <= 12 && y >= 16 && y <= 20) {
                            t.push(T.P);
                        }
                        else if (x >= 13 && x <= 16 && y >= 1 && y <= 3) {
                            t.push(T.P);
                        }
                        
                        // === OLD GRAVES ===
                        else if (x >= 2 && x <= 5 && y >= 14 && y <= 18) {
                            if ((x === 3 && y === 15) || (x === 4 && y === 17)) {
                                t.push(T.CR); // Headstones
                            } else {
                                t.push(T.D);
                            }
                        }
                        
                        // Moss and decay
                        else if ((x * 5 + y * 3) % 11 === 0) {
                            t.push(T.MS);
                        }
                        // Grass
                        else {
                            t.push(T.G);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // The Mill Spirit - quest NPC
                { type: 'npc', id: 'mill_spirit', x: 11, y: 12, hasQuest: true, color: '#6a8a9a' },
                
                // Ghosts/spirits
                { type: 'enemy', id: 'restless_spirit', x: 14, y: 14, color: '#5a6a7a' },
                { type: 'enemy', id: 'restless_spirit', x: 3, y: 16, color: '#5a6a7a' },
                
                // Loot
                { type: 'item', id: 'millers_journal', x: 8, y: 10, color: '#7a6a5a' },
                { type: 'item', id: 'rusty_key', x: 15, y: 9, color: '#6a5a4a' }
            ],
            
            transitions: [
                // North to Village
                { x: 13, y: 0, target: 'greystone_village', spawnX: 16, spawnY: 21 },
                { x: 14, y: 0, target: 'greystone_village', spawnX: 16, spawnY: 21 },
                { x: 15, y: 0, target: 'greystone_village', spawnX: 16, spawnY: 21 },
                { x: 16, y: 0, target: 'greystone_village', spawnX: 16, spawnY: 21 },
                { x: 17, y: 0, target: 'greystone_village', spawnX: 16, spawnY: 21 }
            ]
        },

        // ═══════════════════════════════════════════
        // COLOSSEUM APPROACH — Road to the ancient arena
        // ═══════════════════════════════════════════
        colosseum_approach: {
            name: "Colosseum Approach",
            width: 30,
            height: 20,
            playerSpawn: { x: 2, y: 10 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 20; y++) {
                    for (let x = 0; x < 30; x++) {
                        // West exit to village
                        if (x === 0 && y >= 10 && y <= 13) {
                            t.push(T.EW);
                        } else if (x === 0) {
                            t.push(T.G);
                        }
                        // East exit to colosseum outer
                        else if (x === 29 && y >= 8 && y <= 12) {
                            t.push(T.EE);
                        } else if (x === 29) {
                            t.push(T.W); // Colosseum wall
                        }
                        // Top/bottom borders
                        else if (y === 0 || y === 19) {
                            t.push(T.G);
                        }
                        
                        // === GRAND APPROACH PATH ===
                        else if (y >= 8 && y <= 12) {
                            // Pillars along path
                            if ((x === 8 || x === 16 || x === 24) && (y === 8 || y === 12)) {
                                t.push(T.PI);
                            }
                            // Stone path
                            else {
                                t.push(T.F);
                            }
                        }
                        
                        // === RUINED STATUES ===
                        else if (x === 12 && y === 5) {
                            t.push(T.PI); // Broken statue
                        }
                        else if (x === 12 && y === 15) {
                            t.push(T.RB); // Fallen statue
                        }
                        else if (x === 20 && y === 4) {
                            t.push(T.PI);
                        }
                        else if (x === 20 && y === 16) {
                            t.push(T.PI);
                        }
                        
                        // === VENDOR STALLS ===
                        else if (x >= 4 && x <= 6 && y >= 4 && y <= 6) {
                            if (y === 6) t.push(T.TB);
                            else t.push(T.F);
                        }
                        else if (x >= 4 && x <= 6 && y >= 14 && y <= 16) {
                            if (y === 14) t.push(T.TB);
                            else t.push(T.F);
                        }
                        
                        // Dirt/grass
                        else if ((x + y) % 5 === 0) {
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
                // Ticket vendor
                { type: 'npc', id: 'ticket_vendor', x: 5, y: 5, color: '#6a5a5a' },
                
                // Weapon vendor
                { type: 'npc', id: 'arena_smith', x: 5, y: 15, color: '#7a5a4a' },
                
                // Guards
                { type: 'npc', id: 'arena_guard_1', x: 26, y: 9, color: '#5a5a6a' },
                { type: 'npc', id: 'arena_guard_2', x: 26, y: 11, color: '#5a5a6a' },
                
                // Spectators
                { type: 'npc', id: 'spectator_1', x: 10, y: 10, color: '#6a6a5a' },
                { type: 'npc', id: 'spectator_2', x: 18, y: 10, color: '#5a6a6a' }
            ],
            
            transitions: [
                // West to Village
                { x: 0, y: 10, target: 'greystone_village', spawnX: 29, spawnY: 11 },
                { x: 0, y: 11, target: 'greystone_village', spawnX: 29, spawnY: 11 },
                { x: 0, y: 12, target: 'greystone_village', spawnX: 29, spawnY: 11 },
                { x: 0, y: 13, target: 'greystone_village', spawnX: 29, spawnY: 11 },
                
                // East to Colosseum Outer
                { x: 29, y: 8, target: 'colosseum_outer', spawnX: 2, spawnY: 15 },
                { x: 29, y: 9, target: 'colosseum_outer', spawnX: 2, spawnY: 15 },
                { x: 29, y: 10, target: 'colosseum_outer', spawnX: 2, spawnY: 15 },
                { x: 29, y: 11, target: 'colosseum_outer', spawnX: 2, spawnY: 15 },
                { x: 29, y: 12, target: 'colosseum_outer', spawnX: 2, spawnY: 15 }
            ]
        },

        // ═══════════════════════════════════════════
        // COLOSSEUM OUTER — Outer ring and spectator areas
        // ═══════════════════════════════════════════
        colosseum_outer: {
            name: "Colosseum - Outer Ring",
            width: 32,
            height: 32,
            playerSpawn: { x: 2, y: 15 },
            
            tiles: (function() {
                const t = [];
                const cx = 16, cy = 16; // Center
                const outerR = 14, innerR = 10, arenaR = 7;
                
                for (let y = 0; y < 32; y++) {
                    for (let x = 0; x < 32; x++) {
                        const dx = x - cx;
                        const dy = y - cy;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        
                        // West entrance from approach
                        if (x <= 2 && y >= 14 && y <= 17) {
                            if (x === 0) t.push(T.EW);
                            else t.push(T.F);
                        }
                        // Outer wall
                        else if (dist >= outerR - 0.5 && dist < outerR + 0.5) {
                            t.push(T.W);
                        }
                        // Spectator seating (outer ring)
                        else if (dist >= innerR && dist < outerR - 0.5) {
                            // Stairs/aisles
                            if (Math.abs(dx) < 2 || Math.abs(dy) < 2) {
                                t.push(T.F);
                            }
                            // Seats
                            else {
                                t.push(T.CH);
                            }
                        }
                        // Inner wall (arena barrier)
                        else if (dist >= innerR - 1 && dist < innerR) {
                            // Gates to arena
                            if ((y === 16 && (x === 6 || x === 26)) || 
                                (x === 16 && (y === 6 || y === 26))) {
                                t.push(T.DR);
                            } else {
                                t.push(T.W);
                            }
                        }
                        // Arena floor (visible but not accessible from here)
                        else if (dist < innerR - 1) {
                            t.push(T.D); // Sand
                        }
                        // Outside colosseum
                        else {
                            t.push(T.V);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Ravan - arena champion
                { type: 'npc', id: 'ravan', x: 16, y: 12, hasQuest: true, color: '#8a6a5a' },
                
                // Commander Yast
                { type: 'npc', id: 'commander_yast', x: 20, y: 20, color: '#6a5a6a' },
                
                // Petra (Shade Company contact)
                { type: 'npc', id: 'petra', x: 12, y: 22, hasQuest: true, color: '#4a4a5a' },
                
                // Spectators in seats
                { type: 'npc', id: 'noble_spectator', x: 22, y: 12, color: '#7a7a5a' },
                { type: 'npc', id: 'merchant_spectator', x: 10, y: 20, color: '#6a6a5a' }
            ],
            
            transitions: [
                // West to Approach
                { x: 0, y: 14, target: 'colosseum_approach', spawnX: 27, spawnY: 10 },
                { x: 0, y: 15, target: 'colosseum_approach', spawnX: 27, spawnY: 10 },
                { x: 0, y: 16, target: 'colosseum_approach', spawnX: 27, spawnY: 10 },
                { x: 0, y: 17, target: 'colosseum_approach', spawnX: 27, spawnY: 10 },
                
                // West gate to Arena Floor
                { x: 6, y: 16, target: 'colosseum_floor', spawnX: 4, spawnY: 10 },
                
                // North gate to Hall
                { x: 16, y: 6, target: 'colosseum_hall', spawnX: 12, spawnY: 18 },
                
                // South gate to Vault entrance  
                { x: 16, y: 26, target: 'colosseum_vault', spawnX: 10, spawnY: 2 }
            ]
        },

        // ═══════════════════════════════════════════
        // COLOSSEUM FLOOR — The arena itself
        // ═══════════════════════════════════════════
        colosseum_floor: {
            name: "Colosseum - Arena Floor",
            width: 22,
            height: 22,
            playerSpawn: { x: 4, y: 10 },
            
            tiles: (function() {
                const t = [];
                const cx = 11, cy = 11;
                const arenaR = 9;
                
                for (let y = 0; y < 22; y++) {
                    for (let x = 0; x < 22; x++) {
                        const dx = x - cx;
                        const dy = y - cy;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        
                        // Arena wall
                        if (dist >= arenaR - 0.5 && dist < arenaR + 1) {
                            // Gates
                            if ((y === 10 || y === 11) && (x <= 2 || x >= 19)) {
                                if (x === 0 || x === 21) t.push(T.EW);
                                else t.push(T.DR);
                            }
                            else if ((x === 10 || x === 11) && (y <= 2 || y >= 19)) {
                                t.push(T.DC); // Locked gates
                            }
                            else {
                                t.push(T.W);
                            }
                        }
                        // Arena sand
                        else if (dist < arenaR - 0.5) {
                            // Blood stains from battles
                            if ((x === 8 && y === 8) || (x === 14 && y === 14) ||
                                (x === 7 && y === 13) || (x === 15 && y === 9)) {
                                t.push(T.BL);
                            }
                            // Weapon racks (starting equipment)
                            else if (x === 3 && (y === 9 || y === 12)) {
                                t.push(T.CR);
                            }
                            // Sand floor
                            else {
                                t.push(T.D);
                            }
                        }
                        // Outside arena
                        else {
                            t.push(T.V);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Arena enemies (spawn based on quest state)
                { type: 'enemy', id: 'arena_gladiator', x: 14, y: 11, color: '#7a5050' },
                { type: 'enemy', id: 'arena_beast', x: 11, y: 6, color: '#5a4a3a' },
                
                // Loot from fallen
                { type: 'item', id: 'gladiator_helm', x: 8, y: 8, color: '#6a6a6a' }
            ],
            
            transitions: [
                // West gate back to Outer Ring
                { x: 0, y: 10, target: 'colosseum_outer', spawnX: 8, spawnY: 16 },
                { x: 0, y: 11, target: 'colosseum_outer', spawnX: 8, spawnY: 16 },
                
                // East gate (locked until victory)
                { x: 21, y: 10, target: 'colosseum_hall', spawnX: 2, spawnY: 10 },
                { x: 21, y: 11, target: 'colosseum_hall', spawnX: 2, spawnY: 10 }
            ]
        },

        // ═══════════════════════════════════════════
        // COLOSSEUM HALL — Inner halls and champion quarters
        // ═══════════════════════════════════════════
        colosseum_hall: {
            name: "Colosseum - Champion's Hall",
            width: 26,
            height: 22,
            playerSpawn: { x: 12, y: 18 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 22; y++) {
                    for (let x = 0; x < 26; x++) {
                        // Borders
                        if (y === 0 || y === 21 || x === 0 || x === 25) {
                            t.push(T.W);
                        }
                        // South entrance from Outer
                        else if (y === 20 && x >= 10 && x <= 14) {
                            t.push(T.ES);
                        }
                        else if (y === 20) {
                            t.push(T.W);
                        }
                        // West entrance from Arena
                        else if (x === 1 && y >= 9 && y <= 12) {
                            t.push(T.EW);
                        }
                        else if (x === 1) {
                            t.push(T.W);
                        }
                        
                        // === MAIN HALL ===
                        else if (x >= 8 && x <= 18 && y >= 8 && y <= 18) {
                            // Pillars
                            if ((x === 10 || x === 16) && (y === 10 || y === 16)) {
                                t.push(T.PI);
                            }
                            // Trophy display (center)
                            else if (x >= 12 && x <= 14 && y >= 12 && y <= 14) {
                                t.push(T.TB);
                            }
                            else {
                                t.push(T.F);
                            }
                        }
                        
                        // === CHAMPION ROOMS ===
                        // West room
                        else if (x >= 2 && x <= 6 && y >= 2 && y <= 7) {
                            if (x === 2 || x === 6 || y === 2 || y === 7) {
                                if (x === 6 && y === 5) t.push(T.DR);
                                else t.push(T.W);
                            } else {
                                if (x === 4 && y === 4) t.push(T.BD);
                                else t.push(T.F);
                            }
                        }
                        // East room
                        else if (x >= 20 && x <= 24 && y >= 2 && y <= 7) {
                            if (x === 20 || x === 24 || y === 2 || y === 7) {
                                if (x === 20 && y === 5) t.push(T.DR);
                                else t.push(T.W);
                            } else {
                                if (x === 22 && y === 4) t.push(T.BD);
                                else t.push(T.F);
                            }
                        }
                        
                        // === ARMORY ===
                        else if (x >= 2 && x <= 6 && y >= 14 && y <= 19) {
                            if (x === 2 || x === 6 || y === 14 || y === 19) {
                                if (x === 6 && y === 17) t.push(T.DR);
                                else t.push(T.W);
                            } else {
                                if (x <= 4) t.push(T.CR); // Weapon racks
                                else t.push(T.F);
                            }
                        }
                        
                        // North passage to deeper area
                        else if (x >= 11 && x <= 15 && y >= 1 && y <= 3) {
                            if (y === 1) t.push(T.EN);
                            else t.push(T.F);
                        }
                        
                        // Connecting corridors
                        else if ((x >= 6 && x <= 8) && (y >= 4 && y <= 6)) {
                            t.push(T.F);
                        }
                        else if ((x >= 18 && x <= 20) && (y >= 4 && y <= 6)) {
                            t.push(T.F);
                        }
                        else if ((x >= 6 && x <= 8) && (y >= 15 && y <= 18)) {
                            t.push(T.F);
                        }
                        
                        else {
                            t.push(T.W);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Ravan in his quarters
                { type: 'npc', id: 'ravan_private', x: 4, y: 4, color: '#8a6a5a' },
                
                // Armorer
                { type: 'npc', id: 'arena_armorer', x: 4, y: 16, color: '#6a5a4a' },
                
                // Trophy - previous champion's gear
                { type: 'item', id: 'champions_trophy', x: 13, y: 13, color: '#9a8a40' },
                
                // Mysterious locked door hint
                { type: 'npc', id: 'arena_historian', x: 22, y: 4, hasQuest: true, color: '#5a5a6a' }
            ],
            
            transitions: [
                // South to Outer Ring
                { x: 10, y: 20, target: 'colosseum_outer', spawnX: 16, spawnY: 8 },
                { x: 11, y: 20, target: 'colosseum_outer', spawnX: 16, spawnY: 8 },
                { x: 12, y: 20, target: 'colosseum_outer', spawnX: 16, spawnY: 8 },
                { x: 13, y: 20, target: 'colosseum_outer', spawnX: 16, spawnY: 8 },
                { x: 14, y: 20, target: 'colosseum_outer', spawnX: 16, spawnY: 8 },
                
                // West to Arena Floor
                { x: 1, y: 9, target: 'colosseum_floor', spawnX: 19, spawnY: 10 },
                { x: 1, y: 10, target: 'colosseum_floor', spawnX: 19, spawnY: 10 },
                { x: 1, y: 11, target: 'colosseum_floor', spawnX: 19, spawnY: 10 },
                { x: 1, y: 12, target: 'colosseum_floor', spawnX: 19, spawnY: 10 },
                
                // North to secret vault passage
                { x: 11, y: 1, target: 'colosseum_vault', spawnX: 10, spawnY: 18 },
                { x: 12, y: 1, target: 'colosseum_vault', spawnX: 10, spawnY: 18 },
                { x: 13, y: 1, target: 'colosseum_vault', spawnX: 10, spawnY: 18 },
                { x: 14, y: 1, target: 'colosseum_vault', spawnX: 10, spawnY: 18 },
                { x: 15, y: 1, target: 'colosseum_vault', spawnX: 10, spawnY: 18 }
            ]
        },

        // ═══════════════════════════════════════════
        // COLOSSEUM VAULT — Hidden treasure vault
        // ═══════════════════════════════════════════
        colosseum_vault: {
            name: "Colosseum - Ancient Vault",
            width: 22,
            height: 20,
            playerSpawn: { x: 10, y: 18 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 20; y++) {
                    for (let x = 0; x < 22; x++) {
                        // Mostly dark stone
                        
                        // Border walls
                        if (y === 0 || x === 0 || x === 21) {
                            t.push(T.W);
                        }
                        // South exit
                        else if (y === 19) {
                            if (x >= 8 && x <= 12) t.push(T.ES);
                            else t.push(T.W);
                        }
                        
                        // === MAIN VAULT CHAMBER ===
                        else if (x >= 4 && x <= 18 && y >= 4 && y <= 14) {
                            // Pillars
                            if ((x === 6 || x === 16) && (y === 6 || y === 12)) {
                                t.push(T.PI);
                            }
                            // Central treasure platform
                            else if (x >= 9 && x <= 13 && y >= 8 && y <= 10) {
                                if (x === 9 || x === 13 || y === 8 || y === 10) {
                                    t.push(T.W); // Raised platform edge
                                } else {
                                    t.push(T.F);
                                }
                            }
                            // Floor with cracks
                            else if ((x * 3 + y * 7) % 13 === 0) {
                                t.push(T.CK);
                            }
                            else {
                                t.push(T.F);
                            }
                        }
                        
                        // === SIDE ALCOVES WITH CHESTS ===
                        // West alcove
                        else if (x >= 1 && x <= 3 && y >= 6 && y <= 8) {
                            t.push(T.F);
                        }
                        // East alcove
                        else if (x >= 19 && x <= 21 && y >= 6 && y <= 8) {
                            t.push(T.F);
                        }
                        
                        // Entry corridor
                        else if (x >= 8 && x <= 13 && y >= 15 && y <= 18) {
                            t.push(T.F);
                        }
                        
                        // Walls everywhere else
                        else {
                            t.push(T.W);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Vault Guardian (boss)
                { type: 'enemy', id: 'vault_guardian', x: 11, y: 6, color: '#5a5a7a' },
                
                // Treasure chests
                { type: 'item', id: 'vault_chest_1', x: 2, y: 7, color: '#9a8a40' },
                { type: 'item', id: 'vault_chest_2', x: 20, y: 7, color: '#9a8a40' },
                { type: 'item', id: 'legendary_weapon', x: 11, y: 9, color: '#aa6a9a' },
                
                // Ancient coins scattered
                { type: 'item', id: 'ancient_coins', x: 7, y: 11, color: '#8a7a30' },
                { type: 'item', id: 'ancient_coins', x: 15, y: 5, color: '#8a7a30' }
            ],
            
            transitions: [
                // South to Hall
                { x: 8, y: 19, target: 'colosseum_hall', spawnX: 13, spawnY: 3 },
                { x: 9, y: 19, target: 'colosseum_hall', spawnX: 13, spawnY: 3 },
                { x: 10, y: 19, target: 'colosseum_hall', spawnX: 13, spawnY: 3 },
                { x: 11, y: 19, target: 'colosseum_hall', spawnX: 13, spawnY: 3 },
                { x: 12, y: 19, target: 'colosseum_hall', spawnX: 13, spawnY: 3 }
            ]
        }
    };

    // === MERGE INTO MAPS MODULE ===
    if (typeof Maps !== 'undefined' && Maps.get) {
        const originalGet = Maps.get;
        const originalList = Maps.list;
        
        Maps.get = function(areaId) {
            const normalizedId = areaId.toLowerCase().replace(/\s+/g, '_');
            if (phase3Maps[normalizedId]) {
                return phase3Maps[normalizedId];
            }
            return originalGet(areaId);
        };
        
        Maps.list = function() {
            return [...originalList(), ...Object.keys(phase3Maps)];
        };
        
        Maps.has = function(areaId) {
            const normalizedId = areaId.toLowerCase().replace(/\s+/g, '_');
            return !!phase3Maps[normalizedId] || !!originalGet(areaId);
        };
        
        console.log('[Maps] Phase 3: Added', Object.keys(phase3Maps).length, 'areas');
    } else {
        console.warn('[Maps] Base Maps module not found');
        window.phase3Maps = phase3Maps;
    }
})();