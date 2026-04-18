
/*************************************************************
 * camera.js — Camera/Viewport Handler
 * Handles: following player, smooth movement, bounds clamping
 *************************************************************/

const Camera = (function() {
    const TILE = 16;
    
    // === STATE ===
    let x = 0;  // top-left corner of viewport in world coords
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    
    const SMOOTHING = 8;  // Higher = smoother/slower follow
    const DEADZONE = 32;  // Pixels from center before camera moves
    
    // Map bounds (set when area loads)
    let mapWidth = 20 * TILE;
    let mapHeight = 15 * TILE;
    
    // === UPDATE ===
    function update(dt) {
        if (typeof Player === 'undefined') return;
        
        // Get player center
        const playerX = Player.getCenterX();
        const playerY = Player.getCenterY();
        
        // Calculate target (center player in viewport)
        const viewW = Engine.CANVAS_WIDTH;
        const viewH = Engine.CANVAS_HEIGHT;
        
        targetX = playerX - viewW / 2;
        targetY = playerY - viewH / 2;
        
        // Clamp to map bounds
        targetX = Math.max(0, Math.min(targetX, mapWidth - viewW));
        targetY = Math.max(0, Math.min(targetY, mapHeight - viewH));
        
        // Smooth follow
        x += (targetX - x) / SMOOTHING;
        y += (targetY - y) / SMOOTHING;
        
        // Snap if very close
        if (Math.abs(targetX - x) < 0.5) x = targetX;
        if (Math.abs(targetY - y) < 0.5) y = targetY;
    }
    
    function setMapBounds(width, height) {
        mapWidth = width;
        mapHeight = height;
        
        // Re-clamp current position
        const viewW = Engine.CANVAS_WIDTH;
        const viewH = Engine.CANVAS_HEIGHT;
        x = Math.max(0, Math.min(x, mapWidth - viewW));
        y = Math.max(0, Math.min(y, mapHeight - viewH));
    }
    
    function snapToPlayer() {
        if (typeof Player === 'undefined') return;
        
        const viewW = Engine.CANVAS_WIDTH;
        const viewH = Engine.CANVAS_HEIGHT;
        
        x = Player.getCenterX() - viewW / 2;
        y = Player.getCenterY() - viewH / 2;
        
        // Clamp
        x = Math.max(0, Math.min(x, mapWidth - viewW));
        y = Math.max(0, Math.min(y, mapHeight - viewH));
        
        targetX = x;
        targetY = y;
    }
    
    // === PUBLIC API ===
    return {
        update,
        setMapBounds,
        snapToPlayer,
        
        getOffset: () => ({ x: Math.floor(x), y: Math.floor(y) }),
        getX: () => x,
        getY: () => y,

        // Force camera position (used by debug free-cam)
        setOffset: (nx, ny) => { x = nx; y = ny; targetX = nx; targetY = ny; },
        
        // Convert screen coords to world coords
        screenToWorld: (sx, sy) => ({
            x: sx + x,
            y: sy + y
        }),
        
        // Convert world coords to screen coords
        worldToScreen: (wx, wy) => ({
            x: wx - x,
            y: wy - y
        }),
        
        // Check if world position is visible
        isVisible: (wx, wy, margin = 0) => {
            const viewW = Engine.CANVAS_WIDTH;
            const viewH = Engine.CANVAS_HEIGHT;
            return wx >= x - margin && 
                   wx <= x + viewW + margin &&
                   wy >= y - margin && 
                   wy <= y + viewH + margin;
        }
    };
})();