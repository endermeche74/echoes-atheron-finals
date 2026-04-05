/*************************************************************
 * player.js — Player Entity
 * Handles: position, movement, collision, animation, rendering
 *************************************************************/

const Player = (function() {
    const TILE = 16;
    const MOVE_SPEED = 80;  // pixels per second
    const COLLISION_PADDING = 2;  // pixels inset from tile edges
    
    // === STATE ===
    let x = 0;       // pixel position
    let y = 0;
    let tx = 0;      // tile position (for collision)
    let ty = 0;
    
    let facing = 'down';  // up, down, left, right
    let isMoving = false;
    let animFrame = 0;
    let animTimer = 0;
    const ANIM_SPEED = 0.15;  // seconds per frame
    
    // Interaction cooldown
    let interactCooldown = 0;
    
    // === SYNC WITH GAME STATE ===
    function syncFromState() {
        // Get spawn point from current area
        const areaId = (typeof state !== 'undefined' && state.area) ? state.area : 'verath_arch';
        
        if (typeof Maps !== 'undefined') {
            const map = Maps.get(areaId);
            if (map && map.playerSpawn) {
                tx = map.playerSpawn.x;
                ty = map.playerSpawn.y;
            } else {
                // Default spawn
                tx = 5;
                ty = 5;
            }
            x = tx * TILE;
            y = ty * TILE;
        }
        
        // Check for pending spawn from transition
        if (typeof Tilemap !== 'undefined' && Tilemap._pendingSpawn) {
            tx = Tilemap._pendingSpawn.x;
            ty = Tilemap._pendingSpawn.y;
            x = tx * TILE;
            y = ty * TILE;
            Tilemap._pendingSpawn = null;
        }
        
        console.log(`[Player] Synced to (${tx}, ${ty})`);
    }
    
    // === UPDATE ===
    function update(dt) {
        // Cooldowns
        if (interactCooldown > 0) interactCooldown -= dt;
        
        // Get input
        const move = Input.getMovementVector();
        
        // Update facing direction
        if (move.x < 0) facing = 'left';
        else if (move.x > 0) facing = 'right';
        else if (move.y < 0) facing = 'up';
        else if (move.y > 0) facing = 'down';
        
        isMoving = (move.x !== 0 || move.y !== 0);
        
        // Calculate new position
        if (isMoving) {
            const newX = x + move.x * MOVE_SPEED * dt;
            const newY = y + move.y * MOVE_SPEED * dt;
            
            // Try horizontal movement
            if (canMoveTo(newX, y)) {
                x = newX;
            }
            
            // Try vertical movement
            if (canMoveTo(x, newY)) {
                y = newY;
            }
            
            // Update tile position
            tx = Math.floor((x + TILE/2) / TILE);
            ty = Math.floor((y + TILE/2) / TILE);
            
            // Animation
            animTimer += dt;
            if (animTimer >= ANIM_SPEED) {
                animTimer -= ANIM_SPEED;
                animFrame = (animFrame + 1) % 4;
            }
        } else {
            animFrame = 0;
            animTimer = 0;
        }
        
        // Interaction
        if (Input.wasPressed('INTERACT') && interactCooldown <= 0) {
            tryInteract();
            interactCooldown = 0.3;
        }
        
        // Check for area transitions
        checkTransitions();
    }
    
    function canMoveTo(newX, newY) {
        if (typeof Tilemap === 'undefined') return true;
        
        // Check all four corners of the collision box
        const pad = COLLISION_PADDING;
        const corners = [
            { x: newX + pad,          y: newY + pad },           // top-left
            { x: newX + TILE - pad,   y: newY + pad },           // top-right
            { x: newX + pad,          y: newY + TILE - pad },    // bottom-left
            { x: newX + TILE - pad,   y: newY + TILE - pad }     // bottom-right
        ];
        
        for (const corner of corners) {
            const checkTx = Math.floor(corner.x / TILE);
            const checkTy = Math.floor(corner.y / TILE);
            
            if (Tilemap.isSolid(checkTx, checkTy)) {
                return false;
            }
        }
        
        return true;
    }
    
    function tryInteract() {
        // Get tile in front of player
        let checkX = tx, checkY = ty;
        switch (facing) {
            case 'up':    checkY -= 1; break;
            case 'down':  checkY += 1; break;
            case 'left':  checkX -= 1; break;
            case 'right': checkX += 1; break;
        }
        
        console.log(`[Player] Interact at (${checkX}, ${checkY})`);
        
        // Check for entity at that position
        if (typeof Tilemap !== 'undefined') {
            const entity = Tilemap.getEntityAt(checkX, checkY);
            if (entity) {
                handleEntity(entity);
                return;
            }
            
            // Also check current tile (for items)
            const currentEntity = Tilemap.getEntityAt(tx, ty);
            if (currentEntity && currentEntity.type === 'item') {
                handleEntity(currentEntity);
            }
        }
    }
    
    function handleEntity(entity) {
        console.log('[Player] Entity found:', entity);
        
        switch (entity.type) {
            case 'npc':
                Engine.triggerDialogue(entity.id);
                break;
                
            case 'enemy':
                Engine.triggerCombat(entity.id);
                break;
                
            case 'item':
                // Pick up item
                if (typeof pickupItem === 'function') {
                    pickupItem(entity.id);
                }
                // Remove from map
                Tilemap.removeEntity(entity);
                break;
                
            case 'exit':
                Engine.triggerAreaChange(entity.target);
                break;
        }
    }
    
    function checkTransitions() {
        // Check if standing on a transition tile
        if (typeof Tilemap !== 'undefined') {
            const transition = Tilemap.getTransitionAt(tx, ty);
            if (transition) {
                console.log('[Player] Transition found:', transition);
                Engine.triggerAreaChange(transition.target);
            }
        }
    }
    
    // === RENDER ===
    function render(ctx) {
        const P = Engine.PALETTE;
        
        // Draw shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(x + TILE/2, y + TILE - 2, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body color based on facing
        ctx.fillStyle = P.player;
        
        // Simple animated sprite
        const bobY = isMoving ? Math.sin(animFrame * Math.PI / 2) * 1 : 0;
        
        // Body (slightly taller than wide)
        ctx.fillRect(x + 3, y + 4 - bobY, 10, 10);
        
        // Head
        ctx.fillStyle = '#b0a090';
        ctx.fillRect(x + 4, y + 1 - bobY, 8, 6);
        
        // Eyes (based on facing)
        ctx.fillStyle = '#202020';
        switch (facing) {
            case 'down':
                ctx.fillRect(x + 5, y + 4 - bobY, 2, 2);
                ctx.fillRect(x + 9, y + 4 - bobY, 2, 2);
                break;
            case 'up':
                // Back of head - no eyes
                ctx.fillStyle = '#807060';
                ctx.fillRect(x + 5, y + 2 - bobY, 6, 3);
                break;
            case 'left':
                ctx.fillRect(x + 4, y + 4 - bobY, 2, 2);
                break;
            case 'right':
                ctx.fillRect(x + 10, y + 4 - bobY, 2, 2);
                break;
        }
        
        // Legs (animated when moving)
        ctx.fillStyle = '#505050';
        if (isMoving) {
            const legOffset = (animFrame % 2) * 3 - 1;
            ctx.fillRect(x + 4, y + 13, 3, 3);
            ctx.fillRect(x + 9 + legOffset, y + 13, 3, 3);
        } else {
            ctx.fillRect(x + 4, y + 13, 3, 3);
            ctx.fillRect(x + 9, y + 13, 3, 3);
        }
        
        // Interaction indicator when near entity
        if (typeof Tilemap !== 'undefined') {
            let checkX = tx, checkY = ty;
            switch (facing) {
                case 'up':    checkY -= 1; break;
                case 'down':  checkY += 1; break;
                case 'left':  checkX -= 1; break;
                case 'right': checkX += 1; break;
            }
            const entity = Tilemap.getEntityAt(checkX, checkY);
            if (entity) {
                // Draw [E] prompt
                ctx.fillStyle = P.uiBg + 'dd';
                ctx.fillRect(x + 4, y - 10, 12, 10);
                ctx.strokeStyle = P.uiBorder;
                ctx.strokeRect(x + 4, y - 10, 12, 10);
                ctx.fillStyle = P.uiHighlight;
                ctx.font = '8px monospace';
                ctx.fillText('E', x + 7, y - 3);
            }
        }
    }
    
    // === PUBLIC API ===
    return {
        update,
        render,
        syncFromState,
        
        // Getters
        getX: () => x,
        getY: () => y,
        getTileX: () => tx,
        getTileY: () => ty,
        getFacing: () => facing,
        isMoving: () => isMoving,
        
        // For camera
        getCenterX: () => x + TILE/2,
        getCenterY: () => y + TILE/2,
        
        // Teleport (for area transitions)
        setPosition: (newTx, newTy) => {
            tx = newTx;
            ty = newTy;
            x = tx * TILE;
            y = ty * TILE;
        }
    };
})();