/*************************************************************
 * bootstrap_fix.js — Fixes movement + initial map load
 * Load LAST after all other engine scripts
 *************************************************************/

(function() {
    
    // === FIX 1: LOAD INITIAL AREA ===
    function loadInitialArea() {
        if (typeof Tilemap !== 'undefined' && typeof Maps !== 'undefined') {
            const startArea = 'verath_arch';
            if (Maps.get(startArea)) {
                Tilemap.loadArea(startArea);
                console.log('[Bootstrap] Loaded initial area:', startArea);
            } else {
                // Try first available map
                const available = Maps.list ? Maps.list() : [];
                if (available.length > 0) {
                    Tilemap.loadArea(available[0]);
                    console.log('[Bootstrap] Loaded fallback area:', available[0]);
                }
            }
        }
    }
    
    // === FIX 2: ENSURE PLAYER MOVEMENT WORKS ===
    if (typeof Player !== 'undefined' && typeof Input !== 'undefined') {
        
        // Override update to ensure movement
        const origUpdate = Player.update;
        Player.update = function(dt) {
            // Get input
            const move = Input.getMovementVector ? Input.getMovementVector() : { x: 0, y: 0 };
            
            // Update facing
            if (move.x < 0) Player.setFacing('left');
            else if (move.x > 0) Player.setFacing('right');
            else if (move.y < 0) Player.setFacing('up');
            else if (move.y > 0) Player.setFacing('down');
            
            // Calculate new position
            const speed = 80; // pixels per second
            let newX = Player.getX() + move.x * speed * dt;
            let newY = Player.getY() + move.y * speed * dt;
            
            // Collision check
            if (typeof Tilemap !== 'undefined' && Tilemap.isSolid) {
                const tileX = Math.floor((newX + 8) / 16);
                const tileY = Math.floor((newY + 8) / 16);
                const tileX2 = Math.floor((newX + 14) / 16);
                const tileY2 = Math.floor((newY + 14) / 16);
                
                // Check corners
                if (move.x !== 0) {
                    const checkX = move.x > 0 ? tileX2 : tileX;
                    if (Tilemap.isSolid(checkX, Math.floor((Player.getY() + 4) / 16)) ||
                        Tilemap.isSolid(checkX, Math.floor((Player.getY() + 14) / 16))) {
                        newX = Player.getX();
                    }
                }
                if (move.y !== 0) {
                    const checkY = move.y > 0 ? tileY2 : tileY;
                    if (Tilemap.isSolid(Math.floor((Player.getX() + 4) / 16), checkY) ||
                        Tilemap.isSolid(Math.floor((Player.getX() + 12) / 16), checkY)) {
                        newY = Player.getY();
                    }
                }
            }
            
            // Apply movement
            Player.setPosition(newX, newY);
            
            // Check transitions
            if (typeof Tilemap !== 'undefined' && Tilemap.getTransitionAt) {
                const tx = Math.floor((newX + 8) / 16);
                const ty = Math.floor((newY + 8) / 16);
                const transition = Tilemap.getTransitionAt(tx, ty);
                if (transition) {
                    if (typeof Effects !== 'undefined') {
                        Effects.fadeToBlack(0.3, () => {
                            Tilemap.loadArea(transition.target);
                            Player.setPosition(transition.spawnX * 16, transition.spawnY * 16);
                            if (typeof Camera !== 'undefined' && Camera.snapToPlayer) {
                                Camera.snapToPlayer();
                            }
                            Effects.fadeFromBlack(0.3);
                        });
                    } else {
                        Tilemap.loadArea(transition.target);
                        Player.setPosition(transition.spawnX * 16, transition.spawnY * 16);
                    }
                }
            }
            
            // Update moving state
            Player._isMoving = (move.x !== 0 || move.y !== 0);
        };
        
        // Add missing methods if needed
        if (!Player.setPosition) {
            let px = 0, py = 0;
            Player.setPosition = function(x, y) { px = x; py = y; };
            Player.getX = function() { return px; };
            Player.getY = function() { return py; };
        }
        
        if (!Player.setFacing) {
            let facing = 'down';
            Player.setFacing = function(f) { facing = f; };
            Player.getFacing = function() { return facing; };
        }
        
        if (!Player.isMoving) {
            Player._isMoving = false;
            Player.isMoving = function() { return Player._isMoving; };
        }
        
        if (!Player.getTileX) {
            Player.getTileX = function() { return Math.floor((Player.getX() + 8) / 16); };
            Player.getTileY = function() { return Math.floor((Player.getY() + 8) / 16); };
        }
        
        console.log('[Bootstrap] Player movement patched');
    }
    
    // === FIX 3: ENSURE TILEMAP HAS REQUIRED METHODS ===
    if (typeof Tilemap !== 'undefined') {
        
        let currentAreaId = null;
        let currentTiles = [];
        let currentWidth = 20;
        let currentHeight = 15;
        let currentEntities = [];
        let currentTransitions = [];
        
        if (!Tilemap.loadArea) {
            Tilemap.loadArea = function(areaId) {
                if (typeof Maps === 'undefined') return;
                const map = Maps.get(areaId);
                if (!map) {
                    console.warn('[Tilemap] Map not found:', areaId);
                    return;
                }
                
                currentAreaId = areaId;
                currentTiles = map.tiles || [];
                currentWidth = map.width || 20;
                currentHeight = map.height || 15;
                currentEntities = map.entities || [];
                currentTransitions = map.transitions || [];
                
                console.log('[Tilemap] Loaded:', areaId, currentWidth + 'x' + currentHeight);
            };
        }
        
        if (!Tilemap.getCurrentArea) {
            Tilemap.getCurrentArea = function() { return currentAreaId; };
        }
        
        if (!Tilemap.getTile) {
            Tilemap.getTile = function(x, y) {
                if (x < 0 || y < 0 || x >= currentWidth || y >= currentHeight) return 0;
                return currentTiles[y * currentWidth + x] || 0;
            };
        }
        
        if (!Tilemap.isSolid) {
            const SOLID = [0, 2, 3, 7, 12, 13]; // void, wall, water, pillar, crate
            Tilemap.isSolid = function(x, y) {
                const tile = Tilemap.getTile(x, y);
                return SOLID.includes(tile);
            };
        }
        
        if (!Tilemap.getEntities) {
            Tilemap.getEntities = function() { return currentEntities; };
        }
        
        if (!Tilemap.getTransitionAt) {
            Tilemap.getTransitionAt = function(x, y) {
                return currentTransitions.find(t => t.x === x && t.y === y);
            };
        }
        
        if (!Tilemap.getWidth) {
            Tilemap.getWidth = function() { return currentWidth; };
            Tilemap.getHeight = function() { return currentHeight; };
        }
        
        console.log('[Bootstrap] Tilemap methods ensured');
    }
    
    // === INIT ===
    setTimeout(loadInitialArea, 100);
    
    console.log('[Bootstrap] Fixes applied');
    
})();