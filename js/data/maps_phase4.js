/*************************************************************
 * maps_phase4.js — Phase 4 Map Data
 * Adds: Monastery District (4 areas), Piers District (4 areas)
 * 
 * Load AFTER maps.js, maps_extended.js, maps_phase3.js
 *************************************************************/

(function() {
    const T = typeof Maps !== 'undefined' ? Maps.getTileShorthand() : {
        V: 0, F: 1, W: 2, WT: 3, D: 4, G: 5, P: 6, WA: 7,
        DR: 10, DC: 11, PI: 12, CR: 13, TB: 14, CH: 15, BD: 16,
        SU: 20, SD: 21, EN: 22, ES: 23, EE: 24, EW: 25,
        BL: 30, MS: 31, CK: 32, RB: 33
    };

    const phase4Maps = {

        // ═══════════════════════════════════════════════════════════════
        //  M O N A S T E R Y   D I S T R I C T
        // ═══════════════════════════════════════════════════════════════

        // ═══════════════════════════════════════════
        // MONASTERY PATH — Winding mountain trail to monastery
        // ═══════════════════════════════════════════
        monastery_path: {
            name: "Path to the Monastery",
            width: 24,
            height: 26,
            playerSpawn: { x: 12, y: 24 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 26; y++) {
                    for (let x = 0; x < 24; x++) {
                        // North exit to monastery court
                        if (y === 0 && x >= 10 && x <= 14) {
                            t.push(T.EN);
                        } else if (y === 0) {
                            t.push(T.W); // Mountain
                        }
                        // South exit (connects to crossroads or road)
                        else if (y === 25 && x >= 10 && x <= 14) {
                            t.push(T.ES);
                        } else if (y === 25) {
                            t.push(T.G);
                        }
                        // Mountain walls on sides
                        else if (x <= 2 || x >= 21) {
                            t.push(T.W);
                        }
                        
                        // === WINDING PATH ===
                        // Section 1: Bottom straight
                        else if (y >= 22 && x >= 10 && x <= 14) {
                            t.push(T.P);
                        }
                        // Section 2: Curve left
                        else if (y >= 18 && y < 22 && x >= 6 && x <= 12) {
                            t.push(T.P);
                        }
                        // Section 3: Curve right
                        else if (y >= 13 && y < 18 && x >= 10 && x <= 18) {
                            t.push(T.P);
                        }
                        // Section 4: Curve left again
                        else if (y >= 8 && y < 13 && x >= 5 && x <= 12) {
                            t.push(T.P);
                        }
                        // Section 5: Final approach
                        else if (y >= 1 && y < 8 && x >= 10 && x <= 14) {
                            t.push(T.P);
                        }
                        
                        // === SHRINES ALONG PATH ===
                        else if (x === 8 && y === 20) {
                            t.push(T.PI); // Small shrine
                        }
                        else if (x === 16 && y === 15) {
                            t.push(T.PI); // Small shrine
                        }
                        else if (x === 7 && y === 10) {
                            t.push(T.PI); // Small shrine
                        }
                        
                        // Rocky terrain
                        else if ((x * 5 + y * 7) % 11 === 0) {
                            t.push(T.CR); // Boulders
                        }
                        else if ((x + y) % 4 === 0) {
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
                // Pilgrim resting
                { type: 'npc', id: 'pilgrim', x: 9, y: 19, color: '#6a6a5a' },
                
                // Mountain creatures
                { type: 'enemy', id: 'mountain_lion', x: 17, y: 14, color: '#7a6a4a' },
                { type: 'enemy', id: 'wild_goat', x: 6, y: 9, color: '#8a8a7a' },
                
                // Offering at shrine
                { type: 'item', id: 'shrine_offering', x: 8, y: 19, color: '#9a8a60' }
            ],
            
            transitions: [
                // North to Monastery Court
                { x: 10, y: 0, target: 'monastery_court', spawnX: 12, spawnY: 22 },
                { x: 11, y: 0, target: 'monastery_court', spawnX: 12, spawnY: 22 },
                { x: 12, y: 0, target: 'monastery_court', spawnX: 12, spawnY: 22 },
                { x: 13, y: 0, target: 'monastery_court', spawnX: 12, spawnY: 22 },
                { x: 14, y: 0, target: 'monastery_court', spawnX: 12, spawnY: 22 },
                
                // South to Crossroads
                { x: 10, y: 25, target: 'crossroads', spawnX: 14, spawnY: 5 },
                { x: 11, y: 25, target: 'crossroads', spawnX: 14, spawnY: 5 },
                { x: 12, y: 25, target: 'crossroads', spawnX: 14, spawnY: 5 },
                { x: 13, y: 25, target: 'crossroads', spawnX: 14, spawnY: 5 },
                { x: 14, y: 25, target: 'crossroads', spawnX: 14, spawnY: 5 }
            ]
        },

        // ═══════════════════════════════════════════
        // MONASTERY COURT — Main courtyard and entrance
        // ═══════════════════════════════════════════
        monastery_court: {
            name: "Monastery Courtyard",
            width: 26,
            height: 24,
            playerSpawn: { x: 12, y: 22 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 24; y++) {
                    for (let x = 0; x < 26; x++) {
                        // North wall with entrance to bells
                        if (y === 0) {
                            t.push(T.WT);
                        }
                        else if (y === 1) {
                            if (x >= 11 && x <= 14) t.push(T.DR);
                            else t.push(T.W);
                        }
                        // South exit to path
                        else if (y === 23) {
                            if (x >= 10 && x <= 14) t.push(T.ES);
                            else t.push(T.W);
                        }
                        // East entrance to deep monastery
                        else if (x === 25 && y >= 10 && y <= 13) {
                            t.push(T.EE);
                        }
                        else if (x === 25) {
                            t.push(T.W);
                        }
                        // West wall
                        else if (x === 0) {
                            t.push(T.W);
                        }
                        
                        // === MAIN COURTYARD ===
                        else if (x >= 4 && x <= 22 && y >= 6 && y <= 18) {
                            // Central garden/meditation area
                            if (x >= 9 && x <= 17 && y >= 10 && y <= 14) {
                                // Fountain center
                                if (x >= 12 && x <= 14 && y >= 11 && y <= 13) {
                                    t.push(T.WA);
                                }
                                // Garden border
                                else if (x === 9 || x === 17 || y === 10 || y === 14) {
                                    t.push(T.CR); // Stone border
                                }
                                else {
                                    t.push(T.G); // Garden grass
                                }
                            }
                            // Pillars around courtyard
                            else if ((x === 6 || x === 20) && (y === 8 || y === 16)) {
                                t.push(T.PI);
                            }
                            // Stone floor
                            else {
                                t.push(T.F);
                            }
                        }
                        
                        // === SIDE BUILDINGS ===
                        // West dormitory
                        else if (x >= 1 && x <= 4 && y >= 4 && y <= 10) {
                            if (x === 1 || y === 4 || y === 10) {
                                t.push(T.W);
                            } else if (x === 4 && y === 7) {
                                t.push(T.DR);
                            } else {
                                if (y === 6 || y === 8) t.push(T.BD);
                                else t.push(T.F);
                            }
                        }
                        // East library
                        else if (x >= 22 && x <= 25 && y >= 4 && y <= 9) {
                            if (y === 4 || y === 9) {
                                t.push(T.W);
                            } else if (x === 22 && y === 7) {
                                t.push(T.DR);
                            } else if (x === 25) {
                                t.push(T.W);
                            } else {
                                if (x === 24) t.push(T.CR); // Bookshelves
                                else t.push(T.F);
                            }
                        }
                        
                        // Entry path
                        else if (x >= 11 && x <= 14 && y >= 19 && y <= 22) {
                            t.push(T.P);
                        }
                        
                        // Stone floor elsewhere
                        else {
                            t.push(T.F);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Seiran - head monk
                { type: 'npc', id: 'seiran', x: 13, y: 8, hasQuest: true, color: '#8a7a5a' },
                
                // Monks
                { type: 'npc', id: 'monk_1', x: 7, y: 12, color: '#7a6a4a' },
                { type: 'npc', id: 'monk_2', x: 19, y: 12, color: '#7a6a4a' },
                { type: 'npc', id: 'monk_scribe', x: 23, y: 6, color: '#6a6a5a' },
                
                // Meditation student
                { type: 'npc', id: 'acolyte', x: 13, y: 15, color: '#5a5a4a' }
            ],
            
            transitions: [
                // North to Bell Tower
                { x: 11, y: 1, target: 'monastery_bells', spawnX: 10, spawnY: 18 },
                { x: 12, y: 1, target: 'monastery_bells', spawnX: 10, spawnY: 18 },
                { x: 13, y: 1, target: 'monastery_bells', spawnX: 10, spawnY: 18 },
                { x: 14, y: 1, target: 'monastery_bells', spawnX: 10, spawnY: 18 },
                
                // South to Path
                { x: 10, y: 23, target: 'monastery_path', spawnX: 12, spawnY: 2 },
                { x: 11, y: 23, target: 'monastery_path', spawnX: 12, spawnY: 2 },
                { x: 12, y: 23, target: 'monastery_path', spawnX: 12, spawnY: 2 },
                { x: 13, y: 23, target: 'monastery_path', spawnX: 12, spawnY: 2 },
                { x: 14, y: 23, target: 'monastery_path', spawnX: 12, spawnY: 2 },
                
                // East to Deep Monastery
                { x: 25, y: 10, target: 'monastery_deep', spawnX: 2, spawnY: 10 },
                { x: 25, y: 11, target: 'monastery_deep', spawnX: 2, spawnY: 10 },
                { x: 25, y: 12, target: 'monastery_deep', spawnX: 2, spawnY: 10 },
                { x: 25, y: 13, target: 'monastery_deep', spawnX: 2, spawnY: 10 }
            ]
        },

        // ═══════════════════════════════════════════
        // MONASTERY BELLS — Bell tower and upper chambers
        // ═══════════════════════════════════════════
        monastery_bells: {
            name: "Bell Tower",
            width: 20,
            height: 20,
            playerSpawn: { x: 10, y: 18 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 20; y++) {
                    for (let x = 0; x < 20; x++) {
                        // Mostly interior
                        
                        // Outer walls
                        if (x === 0 || x === 19 || y === 0 || y === 19) {
                            // South entrance
                            if (y === 19 && x >= 8 && x <= 11) {
                                t.push(T.ES);
                            } else {
                                t.push(T.W);
                            }
                        }
                        
                        // === BELL CHAMBER (top) ===
                        else if (y >= 2 && y <= 8 && x >= 5 && x <= 14) {
                            // The great bell
                            if (x >= 8 && x <= 11 && y >= 3 && y <= 6) {
                                t.push(T.PI); // Bell represented as pillar
                            }
                            // Viewing windows (void = open air)
                            else if (y === 2 && (x === 6 || x === 13)) {
                                t.push(T.V);
                            }
                            else {
                                t.push(T.F);
                            }
                        }
                        
                        // === SPIRAL STAIRS ===
                        else if (x >= 2 && x <= 4 && y >= 4 && y <= 16) {
                            t.push(T.SU);
                        }
                        else if (x >= 15 && x <= 17 && y >= 4 && y <= 16) {
                            t.push(T.SD);
                        }
                        
                        // === LOWER CHAMBER ===
                        else if (y >= 10 && y <= 17 && x >= 5 && x <= 14) {
                            // Prayer mats
                            if ((x === 7 || x === 12) && (y === 12 || y === 15)) {
                                t.push(T.CH);
                            }
                            // Altar
                            else if (x >= 9 && x <= 10 && y === 11) {
                                t.push(T.TB);
                            }
                            else {
                                t.push(T.F);
                            }
                        }
                        
                        else {
                            t.push(T.W);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Bell keeper
                { type: 'npc', id: 'bell_keeper', x: 10, y: 5, color: '#6a5a4a' },
                
                // Praying monk
                { type: 'npc', id: 'praying_monk', x: 9, y: 14, color: '#7a6a4a' },
                
                // Holy relic on altar
                { type: 'item', id: 'monastery_relic', x: 10, y: 11, color: '#aa9a60' }
            ],
            
            transitions: [
                // South to Court
                { x: 8, y: 19, target: 'monastery_court', spawnX: 12, spawnY: 3 },
                { x: 9, y: 19, target: 'monastery_court', spawnX: 12, spawnY: 3 },
                { x: 10, y: 19, target: 'monastery_court', spawnX: 12, spawnY: 3 },
                { x: 11, y: 19, target: 'monastery_court', spawnX: 12, spawnY: 3 }
            ]
        },

        // ═══════════════════════════════════════════
        // MONASTERY DEEP — Ancient catacombs beneath
        // ═══════════════════════════════════════════
        monastery_deep: {
            name: "Monastery Depths",
            width: 28,
            height: 22,
            playerSpawn: { x: 2, y: 10 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 22; y++) {
                    for (let x = 0; x < 28; x++) {
                        // West entrance from court
                        if (x === 0 && y >= 9 && y <= 12) {
                            t.push(T.EW);
                        } else if (x === 0 || x === 27 || y === 0 || y === 21) {
                            t.push(T.V); // Void darkness
                        }
                        
                        // === MAIN CORRIDOR ===
                        else if (y >= 9 && y <= 12 && x >= 1 && x <= 20) {
                            // Pillars
                            if ((x === 6 || x === 12 || x === 18) && (y === 9 || y === 12)) {
                                t.push(T.PI);
                            }
                            else {
                                t.push(T.F);
                            }
                        }
                        
                        // === TOMB ALCOVES (north side) ===
                        else if (y >= 3 && y <= 8) {
                            // Alcove 1
                            if (x >= 4 && x <= 8 && y >= 4 && y <= 8) {
                                if (y === 4 || x === 4 || x === 8) t.push(T.W);
                                else if (y === 8 && x === 6) t.push(T.DR);
                                else {
                                    if (y === 6) t.push(T.CR); // Sarcophagus
                                    else t.push(T.F);
                                }
                            }
                            // Alcove 2
                            else if (x >= 11 && x <= 15 && y >= 4 && y <= 8) {
                                if (y === 4 || x === 11 || x === 15) t.push(T.W);
                                else if (y === 8 && x === 13) t.push(T.DR);
                                else {
                                    if (y === 6) t.push(T.CR);
                                    else t.push(T.F);
                                }
                            }
                            // Alcove 3 - Orath's chamber
                            else if (x >= 18 && x <= 24 && y >= 3 && y <= 8) {
                                if (y === 3 || x === 18 || x === 24) t.push(T.W);
                                else if (y === 8 && x === 21) t.push(T.DR);
                                else {
                                    if (x === 21 && y === 5) t.push(T.PI); // Altar
                                    else t.push(T.F);
                                }
                            }
                            else {
                                t.push(T.V);
                            }
                        }
                        
                        // === BURIAL CHAMBERS (south side) ===
                        else if (y >= 13 && y <= 19) {
                            // Chamber 1
                            if (x >= 4 && x <= 10 && y >= 13 && y <= 18) {
                                if (y === 18 || x === 4 || x === 10) t.push(T.W);
                                else if (y === 13 && x === 7) t.push(T.DR);
                                else {
                                    // Bones and burial goods
                                    if ((x === 6 || x === 8) && y === 16) t.push(T.BL);
                                    else t.push(T.F);
                                }
                            }
                            // Chamber 2 - flooded
                            else if (x >= 14 && x <= 22 && y >= 13 && y <= 19) {
                                if (y === 19 || x === 14 || x === 22) t.push(T.W);
                                else if (y === 13 && x === 18) t.push(T.DR);
                                else {
                                    if (y >= 16) t.push(T.WA); // Flooded
                                    else t.push(T.F);
                                }
                            }
                            else {
                                t.push(T.V);
                            }
                        }
                        
                        else {
                            t.push(T.V);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Orath - ancient spirit/guardian
                { type: 'npc', id: 'orath', x: 21, y: 5, hasQuest: true, color: '#5a6a8a' },
                
                // Undead monks
                { type: 'enemy', id: 'undead_monk', x: 6, y: 6, color: '#4a4a5a' },
                { type: 'enemy', id: 'undead_monk', x: 13, y: 6, color: '#4a4a5a' },
                
                // Drowned spirit in flooded chamber
                { type: 'enemy', id: 'drowned_monk', x: 18, y: 17, color: '#3a4a5a' },
                
                // Ancient treasures
                { type: 'item', id: 'ancient_scroll', x: 6, y: 15, color: '#9a8a60' },
                { type: 'item', id: 'burial_offering', x: 13, y: 5, color: '#8a7a40' }
            ],
            
            transitions: [
                // West to Court
                { x: 0, y: 9, target: 'monastery_court', spawnX: 23, spawnY: 11 },
                { x: 0, y: 10, target: 'monastery_court', spawnX: 23, spawnY: 11 },
                { x: 0, y: 11, target: 'monastery_court', spawnX: 23, spawnY: 11 },
                { x: 0, y: 12, target: 'monastery_court', spawnX: 23, spawnY: 11 }
            ]
        },

        // ═══════════════════════════════════════════════════════════════
        //  P I E R S   D I S T R I C T
        // ═══════════════════════════════════════════════════════════════

        // ═══════════════════════════════════════════
        // PIERS SHORE — Beach and coastal approach
        // ═══════════════════════════════════════════
        piers_shore: {
            name: "The Shore",
            width: 30,
            height: 18,
            playerSpawn: { x: 2, y: 9 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 18; y++) {
                    for (let x = 0; x < 30; x++) {
                        // West exit (inland)
                        if (x === 0 && y >= 7 && y <= 11) {
                            t.push(T.EW);
                        } else if (x === 0) {
                            t.push(T.G);
                        }
                        // East to docks
                        else if (x === 29 && y >= 7 && y <= 11) {
                            t.push(T.EE);
                        }
                        // North/south borders
                        else if (y === 0 || y === 17) {
                            if (x >= 20) t.push(T.WA); // Ocean
                            else t.push(T.G);
                        }
                        
                        // === OCEAN ===
                        else if (x >= 24) {
                            t.push(T.WA);
                        }
                        
                        // === BEACH ===
                        else if (x >= 18 && x < 24) {
                            t.push(T.D); // Sand
                        }
                        
                        // === SHORELINE PATH ===
                        else if (x >= 14 && x < 18) {
                            if (y >= 7 && y <= 11) t.push(T.P);
                            else t.push(T.D);
                        }
                        
                        // === INLAND ===
                        else if (x < 14) {
                            // Path from west
                            if (y >= 8 && y <= 10) {
                                t.push(T.P);
                            }
                            // Rocks
                            else if ((x * 3 + y * 7) % 13 === 0) {
                                t.push(T.CR);
                            }
                            // Grass/dirt
                            else if ((x + y) % 3 === 0) {
                                t.push(T.D);
                            }
                            else {
                                t.push(T.G);
                            }
                        }
                        
                        else {
                            t.push(T.D);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Noa - fisherman
                { type: 'npc', id: 'noa', x: 20, y: 10, hasQuest: true, color: '#5a6a7a' },
                
                // Beach comber
                { type: 'npc', id: 'beachcomber', x: 22, y: 5, color: '#6a5a4a' },
                
                // Crabs
                { type: 'enemy', id: 'giant_crab', x: 21, y: 14, color: '#8a5a4a' },
                
                // Washed up items
                { type: 'item', id: 'driftwood', x: 19, y: 8, color: '#6a5a4a' },
                { type: 'item', id: 'seashell', x: 23, y: 12, color: '#9a9a8a' }
            ],
            
            transitions: [
                // West to Road/Crossroads
                { x: 0, y: 7, target: 'road', spawnX: 27, spawnY: 7 },
                { x: 0, y: 8, target: 'road', spawnX: 27, spawnY: 7 },
                { x: 0, y: 9, target: 'road', spawnX: 27, spawnY: 7 },
                { x: 0, y: 10, target: 'road', spawnX: 27, spawnY: 7 },
                { x: 0, y: 11, target: 'road', spawnX: 27, spawnY: 7 },
                
                // East to Docks
                { x: 29, y: 7, target: 'piers_dock', spawnX: 2, spawnY: 10 },
                { x: 29, y: 8, target: 'piers_dock', spawnX: 2, spawnY: 10 },
                { x: 29, y: 9, target: 'piers_dock', spawnX: 2, spawnY: 10 },
                { x: 29, y: 10, target: 'piers_dock', spawnX: 2, spawnY: 10 },
                { x: 29, y: 11, target: 'piers_dock', spawnX: 2, spawnY: 10 }
            ]
        },

        // ═══════════════════════════════════════════
        // PIERS DOCK — The main docks and ships
        // ═══════════════════════════════════════════
        piers_dock: {
            name: "The Docks",
            width: 28,
            height: 22,
            playerSpawn: { x: 2, y: 10 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 22; y++) {
                    for (let x = 0; x < 28; x++) {
                        // West to shore
                        if (x === 0 && y >= 8 && y <= 12) {
                            t.push(T.EW);
                        }
                        // North to guild
                        else if (y === 0 && x >= 12 && x <= 16) {
                            t.push(T.EN);
                        }
                        // South to diving spot
                        else if (y === 21 && x >= 18 && x <= 22) {
                            t.push(T.ES);
                        }
                        
                        // === WATER (most of map) ===
                        else if (x >= 16 || y <= 2 || y >= 19) {
                            // Pier extensions into water
                            if (y >= 6 && y <= 8 && x >= 16 && x <= 24) {
                                t.push(T.F); // Pier 1
                            }
                            else if (y >= 12 && y <= 14 && x >= 16 && x <= 22) {
                                t.push(T.F); // Pier 2
                            }
                            else if (y >= 17 && y <= 19 && x >= 18 && x <= 24) {
                                t.push(T.F); // Pier 3
                            }
                            else {
                                t.push(T.WA);
                            }
                        }
                        
                        // === DOCK BUILDINGS ===
                        // Harbormaster office
                        else if (x >= 2 && x <= 8 && y >= 3 && y <= 7) {
                            if (x === 2 || x === 8 || y === 3 || y === 7) {
                                if (x === 8 && y === 5) t.push(T.DR);
                                else t.push(T.W);
                            } else {
                                if (x === 5 && y === 5) t.push(T.TB);
                                else t.push(T.F);
                            }
                        }
                        // Warehouse
                        else if (x >= 2 && x <= 10 && y >= 14 && y <= 18) {
                            if (x === 2 || x === 10 || y === 14 || y === 18) {
                                if (x === 10 && y === 16) t.push(T.DR);
                                else t.push(T.W);
                            } else {
                                if ((x === 4 || x === 6 || x === 8) && y === 16) t.push(T.CR);
                                else t.push(T.F);
                            }
                        }
                        
                        // === MAIN DOCK AREA ===
                        else if (x >= 8 && x < 16) {
                            // Crates and cargo
                            if (x === 12 && y === 10) t.push(T.CR);
                            else if (x === 14 && y === 8) t.push(T.CR);
                            else t.push(T.F);
                        }
                        
                        // Path
                        else {
                            t.push(T.F);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Sorn - harbormaster
                { type: 'npc', id: 'sorn', x: 5, y: 5, hasQuest: true, color: '#5a5a6a' },
                
                // Captain Moras
                { type: 'npc', id: 'captain_moras', x: 20, y: 7, hasQuest: true, color: '#6a5a4a' },
                
                // Dock workers
                { type: 'npc', id: 'dock_worker_1', x: 12, y: 9, color: '#5a5a5a' },
                { type: 'npc', id: 'dock_worker_2', x: 18, y: 13, color: '#5a5a5a' },
                
                // Warehouse guard
                { type: 'npc', id: 'warehouse_guard', x: 9, y: 16, color: '#5a6a5a' },
                
                // Smuggled goods
                { type: 'item', id: 'suspicious_crate', x: 6, y: 16, color: '#5a4a3a' }
            ],
            
            transitions: [
                // West to Shore
                { x: 0, y: 8, target: 'piers_shore', spawnX: 27, spawnY: 9 },
                { x: 0, y: 9, target: 'piers_shore', spawnX: 27, spawnY: 9 },
                { x: 0, y: 10, target: 'piers_shore', spawnX: 27, spawnY: 9 },
                { x: 0, y: 11, target: 'piers_shore', spawnX: 27, spawnY: 9 },
                { x: 0, y: 12, target: 'piers_shore', spawnX: 27, spawnY: 9 },
                
                // North to Guild
                { x: 12, y: 0, target: 'piers_guild', spawnX: 10, spawnY: 18 },
                { x: 13, y: 0, target: 'piers_guild', spawnX: 10, spawnY: 18 },
                { x: 14, y: 0, target: 'piers_guild', spawnX: 10, spawnY: 18 },
                { x: 15, y: 0, target: 'piers_guild', spawnX: 10, spawnY: 18 },
                { x: 16, y: 0, target: 'piers_guild', spawnX: 10, spawnY: 18 },
                
                // South to Diving
                { x: 18, y: 21, target: 'piers_diving', spawnX: 10, spawnY: 2 },
                { x: 19, y: 21, target: 'piers_diving', spawnX: 10, spawnY: 2 },
                { x: 20, y: 21, target: 'piers_diving', spawnX: 10, spawnY: 2 },
                { x: 21, y: 21, target: 'piers_diving', spawnX: 10, spawnY: 2 },
                { x: 22, y: 21, target: 'piers_diving', spawnX: 10, spawnY: 2 }
            ]
        },

        // ═══════════════════════════════════════════
        // PIERS GUILD — The Drowned faction headquarters
        // ═══════════════════════════════════════════
        piers_guild: {
            name: "The Drowned's Hall",
            width: 22,
            height: 20,
            playerSpawn: { x: 10, y: 18 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 20; y++) {
                    for (let x = 0; x < 22; x++) {
                        // Borders
                        if (y === 0 || y === 19 || x === 0 || x === 21) {
                            // South entrance
                            if (y === 19 && x >= 8 && x <= 12) {
                                t.push(T.ES);
                            } else {
                                t.push(T.W);
                            }
                        }
                        
                        // === MAIN HALL ===
                        else if (x >= 4 && x <= 18 && y >= 6 && y <= 14) {
                            // Central table
                            if (x >= 8 && x <= 14 && y >= 9 && y <= 11) {
                                t.push(T.TB);
                            }
                            // Chairs around table
                            else if ((x === 7 || x === 15) && y === 10) {
                                t.push(T.CH);
                            }
                            else if ((y === 8 || y === 12) && x === 11) {
                                t.push(T.CH);
                            }
                            // Pillars
                            else if ((x === 5 || x === 17) && (y === 7 || y === 13)) {
                                t.push(T.PI);
                            }
                            else {
                                t.push(T.F);
                            }
                        }
                        
                        // === LISS'S CHAMBER (north) ===
                        else if (x >= 7 && x <= 15 && y >= 1 && y <= 5) {
                            if (y === 1 || x === 7 || x === 15) {
                                t.push(T.W);
                            }
                            else if (y === 5 && x === 11) {
                                t.push(T.DR);
                            }
                            else {
                                // Throne/chair
                                if (x === 11 && y === 2) t.push(T.CH);
                                // Maps on walls (crates)
                                else if ((x === 8 || x === 14) && y === 3) t.push(T.CR);
                                else t.push(T.F);
                            }
                        }
                        
                        // === SIDE ROOMS ===
                        // West - armory
                        else if (x >= 1 && x <= 4 && y >= 8 && y <= 12) {
                            if (x === 1) t.push(T.W);
                            else if (x === 4 && y === 10) t.push(T.DR);
                            else if (x === 2) t.push(T.CR);
                            else t.push(T.F);
                        }
                        // East - treasury
                        else if (x >= 18 && x <= 21 && y >= 8 && y <= 12) {
                            if (x === 21) t.push(T.W);
                            else if (x === 18 && y === 10) t.push(T.DR);
                            else if (x === 20) t.push(T.CR);
                            else t.push(T.F);
                        }
                        
                        // Entry hall
                        else if (x >= 8 && x <= 13 && y >= 15 && y <= 18) {
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
                // Liss - leader of The Drowned
                { type: 'npc', id: 'liss', x: 11, y: 3, hasQuest: true, color: '#4a5a6a' },
                
                // Drowned members
                { type: 'npc', id: 'drowned_lieutenant', x: 7, y: 10, color: '#5a5a5a' },
                { type: 'npc', id: 'drowned_scout', x: 15, y: 10, color: '#5a5a5a' },
                { type: 'npc', id: 'drowned_recruit', x: 11, y: 12, color: '#4a4a4a' },
                
                // Treasure
                { type: 'item', id: 'guild_coffers', x: 20, y: 10, color: '#9a8a40' }
            ],
            
            transitions: [
                // South to Dock
                { x: 8, y: 19, target: 'piers_dock', spawnX: 14, spawnY: 2 },
                { x: 9, y: 19, target: 'piers_dock', spawnX: 14, spawnY: 2 },
                { x: 10, y: 19, target: 'piers_dock', spawnX: 14, spawnY: 2 },
                { x: 11, y: 19, target: 'piers_dock', spawnX: 14, spawnY: 2 },
                { x: 12, y: 19, target: 'piers_dock', spawnX: 14, spawnY: 2 }
            ]
        },

        // ═══════════════════════════════════════════
        // PIERS DIVING — Underwater ruins access point
        // ═══════════════════════════════════════════
        piers_diving: {
            name: "The Diving Spot",
            width: 22,
            height: 18,
            playerSpawn: { x: 10, y: 2 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 18; y++) {
                    for (let x = 0; x < 22; x++) {
                        // North exit to dock
                        if (y === 0 && x >= 8 && x <= 12) {
                            t.push(T.EN);
                        }
                        // Mostly water
                        else if (y === 0 || y === 17 || x === 0 || x === 21) {
                            t.push(T.WA);
                        }
                        
                        // === PIER/PLATFORM ===
                        else if (y >= 1 && y <= 6 && x >= 6 && x <= 16) {
                            // Edge of pier
                            if (y === 6 && (x < 9 || x > 13)) {
                                t.push(T.F);
                            }
                            else if (y === 6) {
                                t.push(T.F); // Diving edge
                            }
                            // Pier structure
                            else if (x >= 8 && x <= 14) {
                                // Equipment
                                if (x === 9 && y === 3) t.push(T.CR);
                                else if (x === 13 && y === 3) t.push(T.CR);
                                else t.push(T.F);
                            }
                            else {
                                t.push(T.WA);
                            }
                        }
                        
                        // === WATER WITH UNDERWATER HINTS ===
                        else {
                            // Visible underwater ruins (darker water)
                            if (x >= 8 && x <= 14 && y >= 10 && y <= 15) {
                                // The "entrance" - special diving spot
                                if (x >= 10 && x <= 12 && y >= 12 && y <= 14) {
                                    t.push(T.V); // Deep darkness - the way down
                                }
                                else {
                                    t.push(T.WA);
                                }
                            }
                            else {
                                t.push(T.WA);
                            }
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Diving instructor
                { type: 'npc', id: 'diving_master', x: 11, y: 4, hasQuest: true, color: '#5a6a7a' },
                
                // Sea creatures
                { type: 'enemy', id: 'sea_serpent', x: 5, y: 12, color: '#3a5a6a' },
                { type: 'enemy', id: 'jellyfish_swarm', x: 17, y: 10, color: '#6a5a7a' },
                
                // Diving equipment
                { type: 'item', id: 'diving_gear', x: 9, y: 3, color: '#5a5a6a' },
                
                // Treasure visible below
                { type: 'item', id: 'sunken_chest', x: 11, y: 14, color: '#8a7a40' }
            ],
            
            transitions: [
                // North to Dock
                { x: 8, y: 0, target: 'piers_dock', spawnX: 20, spawnY: 19 },
                { x: 9, y: 0, target: 'piers_dock', spawnX: 20, spawnY: 19 },
                { x: 10, y: 0, target: 'piers_dock', spawnX: 20, spawnY: 19 },
                { x: 11, y: 0, target: 'piers_dock', spawnX: 20, spawnY: 19 },
                { x: 12, y: 0, target: 'piers_dock', spawnX: 20, spawnY: 19 }
            ]
        }
    };

    // === MERGE INTO MAPS MODULE ===
    if (typeof Maps !== 'undefined' && Maps.get) {
        const originalGet = Maps.get;
        const originalList = Maps.list;
        
        Maps.get = function(areaId) {
            const normalizedId = areaId.toLowerCase().replace(/\s+/g, '_');
            if (phase4Maps[normalizedId]) {
                return phase4Maps[normalizedId];
            }
            return originalGet(areaId);
        };
        
        Maps.list = function() {
            return [...originalList(), ...Object.keys(phase4Maps)];
        };
        
        Maps.has = function(areaId) {
            const normalizedId = areaId.toLowerCase().replace(/\s+/g, '_');
            return !!phase4Maps[normalizedId] || !!originalGet(areaId);
        };
        
        console.log('[Maps] Phase 4: Added', Object.keys(phase4Maps).length, 'areas (Monastery + Piers)');
    } else {
        console.warn('[Maps] Base Maps module not found');
        window.phase4Maps = phase4Maps;
    }
})();