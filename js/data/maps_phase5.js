/*************************************************************
 * maps_phase5.js — Phase 5 Map Data (FINAL MAP PHASE)
 * Adds: Ashwood Forest (4 areas), The Keep (4 areas)
 * 
 * Load AFTER maps.js, maps_extended.js, maps_phase3.js, maps_phase4.js
 *************************************************************/

(function() {
    const T = typeof Maps !== 'undefined' ? Maps.getTileShorthand() : {
        V: 0, F: 1, W: 2, WT: 3, D: 4, G: 5, P: 6, WA: 7,
        DR: 10, DC: 11, PI: 12, CR: 13, TB: 14, CH: 15, BD: 16,
        SU: 20, SD: 21, EN: 22, ES: 23, EE: 24, EW: 25,
        BL: 30, MS: 31, CK: 32, RB: 33
    };

    const phase5Maps = {

        // ═══════════════════════════════════════════════════════════════
        //  A S H W O O D   F O R E S T
        //  Home of the Ash-folk faction
        // ═══════════════════════════════════════════════════════════════

        // ═══════════════════════════════════════════
        // ASHWOOD EDGE — Forest entrance, burnt trees
        // ═══════════════════════════════════════════
        ashwood_edge: {
            name: "Ashwood Edge",
            width: 28,
            height: 20,
            playerSpawn: { x: 2, y: 10 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 20; y++) {
                    for (let x = 0; x < 28; x++) {
                        // West exit to crossroads
                        if (x === 0 && y >= 8 && y <= 12) {
                            t.push(T.EW);
                        } else if (x === 0) {
                            t.push(T.G);
                        }
                        // East to deep forest
                        else if (x === 27 && y >= 8 && y <= 12) {
                            t.push(T.EE);
                        } else if (x === 27) {
                            t.push(T.W); // Dense trees = wall
                        }
                        // North/south tree walls
                        else if (y === 0 || y === 19) {
                            t.push(T.W);
                        }
                        
                        // === PATH THROUGH FOREST ===
                        else if (y >= 8 && y <= 12 && x <= 20) {
                            // Scattered ash
                            if ((x + y) % 7 === 0) t.push(T.D);
                            else t.push(T.P);
                        }
                        // Path curves north to hollow
                        else if (x >= 18 && x <= 22 && y >= 2 && y <= 8) {
                            if (x >= 20 && y <= 4) {
                                if (y === 2) t.push(T.EN); // North exit
                                else t.push(T.P);
                            }
                            else t.push(T.P);
                        }
                        
                        // === BURNT TREES (pillars) ===
                        else if ((x === 5 || x === 12 || x === 17) && (y === 4 || y === 15)) {
                            t.push(T.PI);
                        }
                        else if ((x === 8 || x === 23) && (y === 6 || y === 14)) {
                            t.push(T.PI);
                        }
                        
                        // === ASH AND CHAR ===
                        else if ((x * 3 + y * 5) % 9 === 0) {
                            t.push(T.BL); // Charred ground (using blood for dark)
                        }
                        else if ((x + y * 2) % 5 === 0) {
                            t.push(T.D); // Ash/dirt
                        }
                        
                        // Sparse grass
                        else {
                            t.push(T.G);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Wynn - Ash-folk scout
                { type: 'npc', id: 'wynn', x: 15, y: 10, hasQuest: true, color: '#6a5a4a' },
                
                // Ash wolves
                { type: 'enemy', id: 'ash_wolf', x: 8, y: 5, color: '#4a4a4a' },
                { type: 'enemy', id: 'ash_wolf', x: 22, y: 14, color: '#4a4a4a' },
                
                // Charred remains
                { type: 'item', id: 'burnt_journal', x: 6, y: 15, color: '#3a3a3a' }
            ],
            
            transitions: [
                // West to Crossroads
                { x: 0, y: 8, target: 'crossroads', spawnX: 27, spawnY: 10 },
                { x: 0, y: 9, target: 'crossroads', spawnX: 27, spawnY: 10 },
                { x: 0, y: 10, target: 'crossroads', spawnX: 27, spawnY: 10 },
                { x: 0, y: 11, target: 'crossroads', spawnX: 27, spawnY: 10 },
                { x: 0, y: 12, target: 'crossroads', spawnX: 27, spawnY: 10 },
                
                // East to Deep
                { x: 27, y: 8, target: 'ashwood_deep', spawnX: 2, spawnY: 10 },
                { x: 27, y: 9, target: 'ashwood_deep', spawnX: 2, spawnY: 10 },
                { x: 27, y: 10, target: 'ashwood_deep', spawnX: 2, spawnY: 10 },
                { x: 27, y: 11, target: 'ashwood_deep', spawnX: 2, spawnY: 10 },
                { x: 27, y: 12, target: 'ashwood_deep', spawnX: 2, spawnY: 10 },
                
                // North to Hollow
                { x: 20, y: 2, target: 'ashwood_hollow', spawnX: 12, spawnY: 18 },
                { x: 21, y: 2, target: 'ashwood_hollow', spawnX: 12, spawnY: 18 },
                { x: 22, y: 2, target: 'ashwood_hollow', spawnX: 12, spawnY: 18 }
            ]
        },

        // ═══════════════════════════════════════════
        // ASHWOOD DEEP — Dense burned forest
        // ═══════════════════════════════════════════
        ashwood_deep: {
            name: "Ashwood Deep",
            width: 26,
            height: 22,
            playerSpawn: { x: 2, y: 10 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 22; y++) {
                    for (let x = 0; x < 26; x++) {
                        // West to edge
                        if (x === 0 && y >= 8 && y <= 12) {
                            t.push(T.EW);
                        } else if (x === 0) {
                            t.push(T.W);
                        }
                        // East to shrine
                        else if (x === 25 && y >= 9 && y <= 13) {
                            t.push(T.EE);
                        } else if (x === 25) {
                            t.push(T.W);
                        }
                        // Other borders - dense trees
                        else if (y === 0 || y === 21) {
                            t.push(T.W);
                        }
                        
                        // === WINDING PATH ===
                        // Main east-west
                        else if (y >= 9 && y <= 12 && x >= 1 && x <= 10) {
                            t.push(T.P);
                        }
                        // Curve south
                        else if (x >= 8 && x <= 12 && y >= 12 && y <= 16) {
                            t.push(T.P);
                        }
                        // Continue east
                        else if (y >= 14 && y <= 17 && x >= 12 && x <= 20) {
                            t.push(T.P);
                        }
                        // Curve north to exit
                        else if (x >= 18 && x <= 24 && y >= 9 && y <= 14) {
                            t.push(T.P);
                        }
                        
                        // === DENSE TREE CLUSTERS ===
                        // North cluster
                        else if (x >= 4 && x <= 8 && y >= 2 && y <= 6) {
                            if ((x + y) % 2 === 0) t.push(T.PI);
                            else t.push(T.D);
                        }
                        // South cluster
                        else if (x >= 14 && x <= 20 && y >= 18 && y <= 20) {
                            if ((x + y) % 2 === 0) t.push(T.PI);
                            else t.push(T.D);
                        }
                        // Central cluster
                        else if (x >= 12 && x <= 16 && y >= 4 && y <= 8) {
                            if (x === 14 && y === 6) t.push(T.CR); // Hidden cache
                            else if ((x + y) % 2 === 0) t.push(T.PI);
                            else t.push(T.D);
                        }
                        
                        // Ash and soot everywhere
                        else if ((x * 2 + y * 3) % 7 === 0) {
                            t.push(T.BL);
                        }
                        else if ((x + y) % 3 === 0) {
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
                // Ash creatures
                { type: 'enemy', id: 'cinder_sprite', x: 6, y: 4, color: '#8a4a2a' },
                { type: 'enemy', id: 'cinder_sprite', x: 15, y: 6, color: '#8a4a2a' },
                { type: 'enemy', id: 'ash_bear', x: 10, y: 15, color: '#5a4a3a' },
                
                // Ash-folk hunter
                { type: 'npc', id: 'ashfolk_hunter', x: 20, y: 12, color: '#5a5a4a' },
                
                // Hidden supplies
                { type: 'item', id: 'ash_herbs', x: 14, y: 6, color: '#4a5a3a' },
                { type: 'item', id: 'charcoite_ore', x: 17, y: 19, color: '#3a3a4a' }
            ],
            
            transitions: [
                // West to Edge
                { x: 0, y: 8, target: 'ashwood_edge', spawnX: 25, spawnY: 10 },
                { x: 0, y: 9, target: 'ashwood_edge', spawnX: 25, spawnY: 10 },
                { x: 0, y: 10, target: 'ashwood_edge', spawnX: 25, spawnY: 10 },
                { x: 0, y: 11, target: 'ashwood_edge', spawnX: 25, spawnY: 10 },
                { x: 0, y: 12, target: 'ashwood_edge', spawnX: 25, spawnY: 10 },
                
                // East to Shrine
                { x: 25, y: 9, target: 'ashwood_shrine', spawnX: 2, spawnY: 10 },
                { x: 25, y: 10, target: 'ashwood_shrine', spawnX: 2, spawnY: 10 },
                { x: 25, y: 11, target: 'ashwood_shrine', spawnX: 2, spawnY: 10 },
                { x: 25, y: 12, target: 'ashwood_shrine', spawnX: 2, spawnY: 10 },
                { x: 25, y: 13, target: 'ashwood_shrine', spawnX: 2, spawnY: 10 }
            ]
        },

        // ═══════════════════════════════════════════
        // ASHWOOD HOLLOW — Ash-folk village
        // ═══════════════════════════════════════════
        ashwood_hollow: {
            name: "The Hollow",
            width: 26,
            height: 22,
            playerSpawn: { x: 12, y: 18 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 22; y++) {
                    for (let x = 0; x < 26; x++) {
                        // South exit to edge
                        if (y === 21 && x >= 10 && x <= 14) {
                            t.push(T.ES);
                        } else if (y === 21 || y === 0 || x === 0 || x === 25) {
                            t.push(T.W); // Surrounding forest
                        }
                        
                        // === CENTRAL CLEARING ===
                        else if (x >= 6 && x <= 20 && y >= 6 && y <= 16) {
                            // Elder's hut (center-north)
                            if (x >= 10 && x <= 16 && y >= 6 && y <= 10) {
                                if (x === 10 || x === 16 || y === 6 || y === 10) {
                                    if (x === 13 && y === 10) t.push(T.DR);
                                    else t.push(T.W);
                                } else {
                                    if (x === 13 && y === 7) t.push(T.CH); // Elder's seat
                                    else t.push(T.F);
                                }
                            }
                            // Fire pit (center)
                            else if (x >= 11 && x <= 15 && y >= 12 && y <= 14) {
                                if (x === 13 && y === 13) t.push(T.BL); // Fire
                                else t.push(T.D); // Ash ring
                            }
                            // Huts on sides
                            else if (x >= 6 && x <= 9 && y >= 8 && y <= 11) {
                                if (x === 6 || y === 8 || y === 11) t.push(T.W);
                                else if (x === 9 && y === 10) t.push(T.DR);
                                else t.push(T.F);
                            }
                            else if (x >= 17 && x <= 20 && y >= 8 && y <= 11) {
                                if (x === 20 || y === 8 || y === 11) t.push(T.W);
                                else if (x === 17 && y === 10) t.push(T.DR);
                                else t.push(T.F);
                            }
                            // Ground
                            else {
                                t.push(T.D);
                            }
                        }
                        
                        // Path to south exit
                        else if (x >= 11 && x <= 15 && y >= 16 && y <= 20) {
                            t.push(T.P);
                        }
                        
                        // Forest floor
                        else if ((x + y) % 4 === 0) {
                            t.push(T.PI); // Trees
                        }
                        else {
                            t.push(T.D);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Elder Vae - Ash-folk leader
                { type: 'npc', id: 'elder_vae', x: 13, y: 8, hasQuest: true, color: '#7a6a5a' },
                
                // Kern - warrior
                { type: 'npc', id: 'kern', x: 8, y: 10, hasQuest: true, color: '#6a5a4a' },
                
                // Ash-folk villagers
                { type: 'npc', id: 'ashfolk_elder_wife', x: 14, y: 8, color: '#6a6a5a' },
                { type: 'npc', id: 'ashfolk_smith', x: 18, y: 10, color: '#5a4a4a' },
                { type: 'npc', id: 'ashfolk_child', x: 12, y: 14, color: '#7a7a6a' },
                
                // Goods for trade
                { type: 'item', id: 'ashfolk_charm', x: 7, y: 9, color: '#6a5a3a' }
            ],
            
            transitions: [
                // South to Edge
                { x: 10, y: 21, target: 'ashwood_edge', spawnX: 21, spawnY: 4 },
                { x: 11, y: 21, target: 'ashwood_edge', spawnX: 21, spawnY: 4 },
                { x: 12, y: 21, target: 'ashwood_edge', spawnX: 21, spawnY: 4 },
                { x: 13, y: 21, target: 'ashwood_edge', spawnX: 21, spawnY: 4 },
                { x: 14, y: 21, target: 'ashwood_edge', spawnX: 21, spawnY: 4 }
            ]
        },

        // ═══════════════════════════════════════════
        // ASHWOOD SHRINE — Ancient fire shrine
        // ═══════════════════════════════════════════
        ashwood_shrine: {
            name: "Shrine of Cinders",
            width: 22,
            height: 22,
            playerSpawn: { x: 2, y: 10 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 22; y++) {
                    for (let x = 0; x < 22; x++) {
                        // West exit to deep
                        if (x === 0 && y >= 8 && y <= 12) {
                            t.push(T.EW);
                        } else if (x === 0 || x === 21 || y === 0 || y === 21) {
                            t.push(T.W);
                        }
                        
                        // === SHRINE STRUCTURE (circular) ===
                        else {
                            const cx = 11, cy = 11;
                            const dx = x - cx, dy = y - cy;
                            const dist = Math.sqrt(dx*dx + dy*dy);
                            
                            // Outer ring (pillars)
                            if (dist >= 7 && dist < 8) {
                                if (Math.abs(dx) < 1.5 || Math.abs(dy) < 1.5) {
                                    t.push(T.P); // Paths through ring
                                } else {
                                    t.push(T.PI); // Pillars
                                }
                            }
                            // Inner ring (sacred floor)
                            else if (dist >= 4 && dist < 7) {
                                if ((x + y) % 3 === 0) t.push(T.BL); // Char marks
                                else t.push(T.F);
                            }
                            // Center altar
                            else if (dist < 4) {
                                if (dist < 1.5) {
                                    t.push(T.BL); // Eternal flame
                                } else if (dist < 2.5) {
                                    t.push(T.TB); // Altar ring
                                } else {
                                    t.push(T.F);
                                }
                            }
                            // Outside shrine
                            else {
                                if ((x + y) % 5 === 0) t.push(T.PI);
                                else t.push(T.D);
                            }
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Shrine Guardian (boss/spirit)
                { type: 'enemy', id: 'cinder_guardian', x: 11, y: 11, color: '#aa5a2a' },
                
                // Fire spirits
                { type: 'enemy', id: 'flame_wisp', x: 8, y: 8, color: '#aa6a3a' },
                { type: 'enemy', id: 'flame_wisp', x: 14, y: 14, color: '#aa6a3a' },
                
                // Sacred artifacts
                { type: 'item', id: 'cinder_heart', x: 11, y: 10, color: '#aa4a2a' },
                { type: 'item', id: 'ash_tome', x: 7, y: 11, color: '#5a4a3a' }
            ],
            
            transitions: [
                // West to Deep
                { x: 0, y: 8, target: 'ashwood_deep', spawnX: 23, spawnY: 11 },
                { x: 0, y: 9, target: 'ashwood_deep', spawnX: 23, spawnY: 11 },
                { x: 0, y: 10, target: 'ashwood_deep', spawnX: 23, spawnY: 11 },
                { x: 0, y: 11, target: 'ashwood_deep', spawnX: 23, spawnY: 11 },
                { x: 0, y: 12, target: 'ashwood_deep', spawnX: 23, spawnY: 11 }
            ]
        },

        // ═══════════════════════════════════════════════════════════════
        //  T H E   K E E P
        //  Home of the Stone Wardens faction
        // ═══════════════════════════════════════════════════════════════

        // ═══════════════════════════════════════════
        // KEEP APPROACH — Rocky path to the fortress
        // ═══════════════════════════════════════════
        keep_approach: {
            name: "Keep Approach",
            width: 26,
            height: 20,
            playerSpawn: { x: 2, y: 10 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 20; y++) {
                    for (let x = 0; x < 26; x++) {
                        // West exit (to road network)
                        if (x === 0 && y >= 8 && y <= 12) {
                            t.push(T.EW);
                        } else if (x === 0) {
                            t.push(T.W);
                        }
                        // East to gate
                        else if (x === 25 && y >= 8 && y <= 12) {
                            t.push(T.EE);
                        } else if (x === 25) {
                            t.push(T.W);
                        }
                        // Cliff edges north/south
                        else if (y === 0 || y === 19) {
                            t.push(T.V); // Void = cliff
                        }
                        
                        // === BRIDGE/PATH ===
                        else if (y >= 7 && y <= 13) {
                            // Main path with railings
                            if (y >= 9 && y <= 11) {
                                t.push(T.F); // Stone bridge
                            }
                            // Railing
                            else if (y === 8 || y === 12) {
                                if (x % 4 === 0) t.push(T.PI); // Posts
                                else t.push(T.CR); // Rail
                            }
                            else if (y === 7 || y === 13) {
                                t.push(T.V); // Drop off
                            }
                            else {
                                t.push(T.W);
                            }
                        }
                        
                        // Cliff face / mountain
                        else {
                            if (y < 7) {
                                // North cliff
                                if ((x + y) % 3 === 0) t.push(T.CR);
                                else t.push(T.W);
                            } else {
                                // South cliff  
                                if ((x + y) % 3 === 0) t.push(T.CR);
                                else t.push(T.W);
                            }
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Stone sentinel (statue that might be alive?)
                { type: 'npc', id: 'stone_sentinel', x: 12, y: 10, color: '#6a6a7a' },
                
                // Cliff creatures
                { type: 'enemy', id: 'cliff_harpy', x: 8, y: 4, color: '#5a5a6a' },
                { type: 'enemy', id: 'rock_golem', x: 20, y: 15, color: '#5a5a5a' },
                
                // Fallen traveler's belongings
                { type: 'item', id: 'travelers_pack', x: 15, y: 10, color: '#6a5a4a' }
            ],
            
            transitions: [
                // West to Road/Crossroads
                { x: 0, y: 8, target: 'crossroads', spawnX: 14, spawnY: 10 },
                { x: 0, y: 9, target: 'crossroads', spawnX: 14, spawnY: 10 },
                { x: 0, y: 10, target: 'crossroads', spawnX: 14, spawnY: 10 },
                { x: 0, y: 11, target: 'crossroads', spawnX: 14, spawnY: 10 },
                { x: 0, y: 12, target: 'crossroads', spawnX: 14, spawnY: 10 },
                
                // East to Gate
                { x: 25, y: 8, target: 'keep_gate', spawnX: 2, spawnY: 12 },
                { x: 25, y: 9, target: 'keep_gate', spawnX: 2, spawnY: 12 },
                { x: 25, y: 10, target: 'keep_gate', spawnX: 2, spawnY: 12 },
                { x: 25, y: 11, target: 'keep_gate', spawnX: 2, spawnY: 12 },
                { x: 25, y: 12, target: 'keep_gate', spawnX: 2, spawnY: 12 }
            ]
        },

        // ═══════════════════════════════════════════
        // KEEP GATE — Fortress entrance
        // ═══════════════════════════════════════════
        keep_gate: {
            name: "The Gate",
            width: 24,
            height: 26,
            playerSpawn: { x: 2, y: 12 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 26; y++) {
                    for (let x = 0; x < 24; x++) {
                        // West exit to approach
                        if (x === 0 && y >= 10 && y <= 14) {
                            t.push(T.EW);
                        } else if (x === 0) {
                            t.push(T.W);
                        }
                        // North entrance to hall
                        else if (y === 0 && x >= 9 && x <= 14) {
                            t.push(T.EN);
                        } else if (y === 0) {
                            t.push(T.WT);
                        }
                        // Other walls
                        else if (x === 23 || y === 25) {
                            t.push(T.W);
                        }
                        
                        // === GATE STRUCTURE ===
                        // Outer wall
                        else if (y >= 3 && y <= 6) {
                            if (x >= 8 && x <= 15) {
                                // Gate opening
                                if (y >= 4 && y <= 5 && x >= 10 && x <= 13) {
                                    t.push(T.F);
                                }
                                // Gate frame
                                else {
                                    t.push(T.W);
                                }
                            }
                            else {
                                t.push(T.W);
                            }
                        }
                        
                        // === INNER COURTYARD ===
                        else if (y >= 7 && y <= 18 && x >= 4 && x <= 20) {
                            // Guard posts
                            if ((x === 6 || x === 18) && (y === 9 || y === 16)) {
                                t.push(T.PI);
                            }
                            // Central path
                            else if (x >= 10 && x <= 13) {
                                t.push(T.F);
                            }
                            // Side areas
                            else if (x <= 8 || x >= 16) {
                                if ((x + y) % 4 === 0) t.push(T.CR);
                                else t.push(T.F);
                            }
                            else {
                                t.push(T.F);
                            }
                        }
                        
                        // Entry from west
                        else if (y >= 10 && y <= 14 && x <= 4) {
                            t.push(T.F);
                        }
                        
                        // Outer grounds
                        else if (y >= 19) {
                            if ((x + y) % 5 === 0) t.push(T.CR);
                            else t.push(T.D);
                        }
                        
                        else {
                            t.push(T.W);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // The Guardian - ancient protector
                { type: 'npc', id: 'the_guardian', x: 12, y: 5, hasQuest: true, color: '#5a5a7a' },
                
                // Stone Warden guards
                { type: 'npc', id: 'warden_guard_1', x: 6, y: 9, color: '#6a6a6a' },
                { type: 'npc', id: 'warden_guard_2', x: 18, y: 9, color: '#6a6a6a' },
                
                // Patrol
                { type: 'npc', id: 'warden_patrol', x: 12, y: 15, color: '#5a5a5a' }
            ],
            
            transitions: [
                // West to Approach
                { x: 0, y: 10, target: 'keep_approach', spawnX: 23, spawnY: 10 },
                { x: 0, y: 11, target: 'keep_approach', spawnX: 23, spawnY: 10 },
                { x: 0, y: 12, target: 'keep_approach', spawnX: 23, spawnY: 10 },
                { x: 0, y: 13, target: 'keep_approach', spawnX: 23, spawnY: 10 },
                { x: 0, y: 14, target: 'keep_approach', spawnX: 23, spawnY: 10 },
                
                // North to Hall
                { x: 9, y: 0, target: 'keep_hall', spawnX: 12, spawnY: 22 },
                { x: 10, y: 0, target: 'keep_hall', spawnX: 12, spawnY: 22 },
                { x: 11, y: 0, target: 'keep_hall', spawnX: 12, spawnY: 22 },
                { x: 12, y: 0, target: 'keep_hall', spawnX: 12, spawnY: 22 },
                { x: 13, y: 0, target: 'keep_hall', spawnX: 12, spawnY: 22 },
                { x: 14, y: 0, target: 'keep_hall', spawnX: 12, spawnY: 22 }
            ]
        },

        // ═══════════════════════════════════════════
        // KEEP HALL — Main fortress interior
        // ═══════════════════════════════════════════
        keep_hall: {
            name: "The Great Hall",
            width: 26,
            height: 26,
            playerSpawn: { x: 12, y: 22 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 26; y++) {
                    for (let x = 0; x < 26; x++) {
                        // South exit to gate
                        if (y === 25 && x >= 10 && x <= 14) {
                            t.push(T.ES);
                        } else if (y === 25) {
                            t.push(T.W);
                        }
                        // North to depths
                        else if (y === 0 && x >= 11 && x <= 14) {
                            t.push(T.EN);
                        } else if (y === 0) {
                            t.push(T.WT);
                        }
                        // Side walls
                        else if (x === 0 || x === 25) {
                            t.push(T.W);
                        }
                        
                        // === GREAT HALL ===
                        else if (x >= 4 && x <= 22 && y >= 8 && y <= 18) {
                            // Throne platform (north)
                            if (y >= 8 && y <= 11 && x >= 10 && x <= 16) {
                                if (y === 8) {
                                    t.push(T.W); // Raised platform back
                                } else if (y === 11 && (x === 10 || x === 16)) {
                                    t.push(T.SU); // Steps
                                } else {
                                    if (x === 13 && y === 9) t.push(T.CH); // Throne
                                    else t.push(T.F);
                                }
                            }
                            // Grand pillars
                            else if ((x === 6 || x === 20) && (y === 10 || y === 16)) {
                                t.push(T.PI);
                            }
                            else if ((x === 10 || x === 16) && y === 14) {
                                t.push(T.PI);
                            }
                            // Long tables
                            else if (y === 14 && x >= 7 && x <= 9) {
                                t.push(T.TB);
                            }
                            else if (y === 14 && x >= 17 && x <= 19) {
                                t.push(T.TB);
                            }
                            // Hall floor
                            else {
                                t.push(T.F);
                            }
                        }
                        
                        // === SIDE CHAMBERS ===
                        // West chamber (armory)
                        else if (x >= 1 && x <= 4 && y >= 10 && y <= 16) {
                            if (x === 1) t.push(T.W);
                            else if (x === 4 && y === 13) t.push(T.DR);
                            else if (x === 2) t.push(T.CR);
                            else t.push(T.F);
                        }
                        // East chamber (archives)
                        else if (x >= 22 && x <= 25 && y >= 10 && y <= 16) {
                            if (x === 25) t.push(T.W);
                            else if (x === 22 && y === 13) t.push(T.DR);
                            else if (x === 24) t.push(T.CR);
                            else t.push(T.F);
                        }
                        
                        // Entry corridor
                        else if (x >= 10 && x <= 15 && y >= 19 && y <= 24) {
                            t.push(T.F);
                        }
                        
                        // Passage to depths
                        else if (x >= 11 && x <= 14 && y >= 1 && y <= 7) {
                            if (y <= 3) t.push(T.SD); // Stairs down
                            else t.push(T.F);
                        }
                        
                        else {
                            t.push(T.W);
                        }
                    }
                }
                return t;
            })(),
            
            entities: [
                // Warden-7 - commander
                { type: 'npc', id: 'warden_7', x: 13, y: 10, hasQuest: true, color: '#6a6a7a' },
                
                // The Indexer - keeper of knowledge
                { type: 'npc', id: 'the_indexer', x: 23, y: 13, hasQuest: true, color: '#5a5a6a' },
                
                // Warden soldiers
                { type: 'npc', id: 'warden_elite_1', x: 11, y: 10, color: '#5a5a5a' },
                { type: 'npc', id: 'warden_elite_2', x: 15, y: 10, color: '#5a5a5a' },
                
                // Armorer
                { type: 'npc', id: 'warden_smith', x: 3, y: 13, color: '#6a5a5a' },
                
                // Ancient weapon on display
                { type: 'item', id: 'wardens_blade', x: 2, y: 12, color: '#7a7a8a' }
            ],
            
            transitions: [
                // South to Gate
                { x: 10, y: 25, target: 'keep_gate', spawnX: 12, spawnY: 2 },
                { x: 11, y: 25, target: 'keep_gate', spawnX: 12, spawnY: 2 },
                { x: 12, y: 25, target: 'keep_gate', spawnX: 12, spawnY: 2 },
                { x: 13, y: 25, target: 'keep_gate', spawnX: 12, spawnY: 2 },
                { x: 14, y: 25, target: 'keep_gate', spawnX: 12, spawnY: 2 },
                
                // North to Depths
                { x: 11, y: 0, target: 'keep_depths', spawnX: 12, spawnY: 20 },
                { x: 12, y: 0, target: 'keep_depths', spawnX: 12, spawnY: 20 },
                { x: 13, y: 0, target: 'keep_depths', spawnX: 12, spawnY: 20 },
                { x: 14, y: 0, target: 'keep_depths', spawnX: 12, spawnY: 20 }
            ]
        },

        // ═══════════════════════════════════════════
        // KEEP DEPTHS — Ancient chambers below
        // ═══════════════════════════════════════════
        keep_depths: {
            name: "The Depths",
            width: 28,
            height: 24,
            playerSpawn: { x: 12, y: 20 },
            
            tiles: (function() {
                const t = [];
                for (let y = 0; y < 24; y++) {
                    for (let x = 0; x < 28; x++) {
                        // South exit to hall
                        if (y === 23 && x >= 10 && x <= 14) {
                            t.push(T.ES);
                        } else if (y === 23 || y === 0 || x === 0 || x === 27) {
                            t.push(T.V); // Void / ancient stone
                        }
                        
                        // === MAIN CHAMBER ===
                        else if (x >= 6 && x <= 22 && y >= 6 && y <= 16) {
                            // Central mechanism / artifact
                            if (x >= 12 && x <= 16 && y >= 9 && y <= 13) {
                                if (x === 14 && y === 11) {
                                    t.push(T.PI); // The artifact
                                } else if ((x === 12 || x === 16) && (y === 9 || y === 13)) {
                                    t.push(T.PI); // Corner pillars
                                } else {
                                    t.push(T.F);
                                }
                            }
                            // Rune circles
                            else if ((x === 8 || x === 20) && (y === 8 || y === 14)) {
                                t.push(T.BL); // Glowing runes
                            }
                            // Ancient floor
                            else if ((x + y) % 5 === 0) {
                                t.push(T.CK); // Cracked
                            }
                            else {
                                t.push(T.F);
                            }
                        }
                        
                        // === SIDE ALCOVES ===
                        // West - containment cells
                        else if (x >= 2 && x <= 5 && y >= 8 && y <= 14) {
                            if (x === 2) t.push(T.V);
                            else if (x === 5 && y === 11) t.push(T.DC); // Locked
                            else if (y === 8 || y === 14) t.push(T.W);
                            else t.push(T.F);
                        }
                        // East - vault
                        else if (x >= 23 && x <= 26 && y >= 8 && y <= 14) {
                            if (x === 26) t.push(T.V);
                            else if (x === 23 && y === 11) t.push(T.DC);
                            else if (y === 8 || y === 14) t.push(T.W);
                            else {
                                if (x === 25 && y === 11) t.push(T.CR);
                                else t.push(T.F);
                            }
                        }
                        
                        // Corridor from south
                        else if (x >= 10 && x <= 18 && y >= 17 && y <= 22) {
                            if (x >= 11 && x <= 17) {
                                t.push(T.F);
                            } else {
                                t.push(T.W);
                            }
                        }
                        
                        // Corridor to main chamber
                        else if (x >= 10 && x <= 18 && y >= 4 && y <= 6) {
                            if (x >= 12 && x <= 16) {
                                t.push(T.F);
                            } else {
                                t.push(T.W);
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
                // Eternal Guardian (final boss?)
                { type: 'enemy', id: 'eternal_guardian', x: 14, y: 11, color: '#6a6a8a' },
                
                // Animated armors
                { type: 'enemy', id: 'animated_armor', x: 8, y: 8, color: '#5a5a6a' },
                { type: 'enemy', id: 'animated_armor', x: 20, y: 14, color: '#5a5a6a' },
                
                // Imprisoned entity
                { type: 'npc', id: 'the_prisoner', x: 4, y: 11, hasQuest: true, color: '#4a4a5a' },
                
                // Ultimate treasures
                { type: 'item', id: 'wardens_legacy', x: 25, y: 11, color: '#9a9aaa' },
                { type: 'item', id: 'ancient_core', x: 14, y: 10, color: '#7a8a9a' }
            ],
            
            transitions: [
                // South to Hall
                { x: 10, y: 23, target: 'keep_hall', spawnX: 12, spawnY: 3 },
                { x: 11, y: 23, target: 'keep_hall', spawnX: 12, spawnY: 3 },
                { x: 12, y: 23, target: 'keep_hall', spawnX: 12, spawnY: 3 },
                { x: 13, y: 23, target: 'keep_hall', spawnX: 12, spawnY: 3 },
                { x: 14, y: 23, target: 'keep_hall', spawnX: 12, spawnY: 3 }
            ]
        }
    };

    // === MERGE INTO MAPS MODULE ===
    if (typeof Maps !== 'undefined' && Maps.get) {
        const originalGet = Maps.get;
        const originalList = Maps.list;
        
        Maps.get = function(areaId) {
            const normalizedId = areaId.toLowerCase().replace(/\s+/g, '_');
            if (phase5Maps[normalizedId]) {
                return phase5Maps[normalizedId];
            }
            return originalGet(areaId);
        };
        
        Maps.list = function() {
            return [...originalList(), ...Object.keys(phase5Maps)];
        };
        
        Maps.has = function(areaId) {
            const normalizedId = areaId.toLowerCase().replace(/\s+/g, '_');
            return !!phase5Maps[normalizedId] || !!originalGet(areaId);
        };
        
        console.log('[Maps] Phase 5: Added', Object.keys(phase5Maps).length, 'areas (Ashwood + Keep) — WORLD COMPLETE!');
    } else {
        console.warn('[Maps] Base Maps module not found');
        window.phase5Maps = phase5Maps;
    }
})();