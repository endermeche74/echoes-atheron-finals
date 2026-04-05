/*************************************************************
 * ui_polish.js — Speech bubbles, icons, notifications
 *************************************************************/

const UIPolish = (function() {
    
    // === SPEECH BUBBLES ===
    const bubbles = [];
    
    function showBubble(x, y, text, duration = 2) {
        bubbles.push({ x, y, text, life: duration, maxLife: duration });
    }
    
    function updateBubbles(dt) {
        for (let i = bubbles.length - 1; i >= 0; i--) {
            bubbles[i].life -= dt;
            if (bubbles[i].life <= 0) bubbles.splice(i, 1);
        }
    }
    
    function renderBubbles(ctx, camX, camY) {
        ctx.font = '8px monospace';
        for (const b of bubbles) {
            const sx = b.x - camX;
            const sy = b.y - camY - 20;
            const alpha = Math.min(1, b.life / 0.3);
            
            const w = ctx.measureText(b.text).width + 8;
            const h = 14;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(sx - w/2, sy - h);
            ctx.lineTo(sx + w/2, sy - h);
            ctx.lineTo(sx + w/2, sy);
            ctx.lineTo(sx + 4, sy);
            ctx.lineTo(sx, sy + 5);
            ctx.lineTo(sx - 4, sy);
            ctx.lineTo(sx - w/2, sy);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.fillText(b.text, sx, sy - 4);
            ctx.textAlign = 'left';
            ctx.globalAlpha = 1;
        }
    }
    
    // === NOTIFICATIONS ===
    const notifications = [];
    
    function notify(text, type = 'info') {
        const colors = { info: '#fff', success: '#4f4', warning: '#fc4', error: '#f44' };
        notifications.push({ text, color: colors[type] || '#fff', life: 3, y: 0 });
        // Stack
        for (let i = 0; i < notifications.length - 1; i++) {
            notifications[i].y += 16;
        }
    }
    
    function updateNotifications(dt) {
        for (let i = notifications.length - 1; i >= 0; i--) {
            notifications[i].life -= dt;
            if (notifications[i].life <= 0) notifications.splice(i, 1);
        }
    }
    
    function renderNotifications(ctx, W) {
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        for (const n of notifications) {
            const alpha = Math.min(1, n.life / 0.5);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#000';
            ctx.fillRect(W/2 - 80, 40 + n.y, 160, 14);
            ctx.fillStyle = n.color;
            ctx.fillText(n.text, W/2, 50 + n.y);
        }
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
    }
    
    // === INTERACTION PROMPT ===
    let interactTarget = null;
    
    function setInteractTarget(entity) {
        interactTarget = entity;
    }
    
    function renderInteractPrompt(ctx, camX, camY) {
        if (!interactTarget) return;
        
        const sx = interactTarget.x * 16 + 8 - camX;
        const sy = interactTarget.y * 16 - 12 - camY;
        
        // Box
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(sx - 14, sy - 10, 28, 14);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(sx - 14, sy - 10, 28, 14);
        
        // Key icon
        ctx.fillStyle = '#fc0';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[E]', sx, sy);
        ctx.textAlign = 'left';
    }
    
    // === QUEST MARKER ===
    function renderQuestMarker(ctx, x, y, camX, camY, time) {
        const sx = x - camX;
        const sy = y - camY + Math.sin(time * 4) * 2;
        
        ctx.fillStyle = '#fc0';
        ctx.beginPath();
        ctx.moveTo(sx, sy - 8);
        ctx.lineTo(sx + 5, sy + 2);
        ctx.lineTo(sx - 5, sy + 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', sx, sy);
        ctx.textAlign = 'left';
    }
    
    // === UPDATE ===
    function update(dt) {
        updateBubbles(dt);
        updateNotifications(dt);
    }
    
    // === RENDER ===
    function render(ctx, W, H, camX, camY) {
        renderBubbles(ctx, camX || 0, camY || 0);
        renderInteractPrompt(ctx, camX || 0, camY || 0);
        renderNotifications(ctx, W);
    }
    
    return {
        showBubble,
        notify,
        setInteractTarget,
        renderQuestMarker,
        update,
        render
    };
    
})();

console.log('[UIPolish] Initialized');