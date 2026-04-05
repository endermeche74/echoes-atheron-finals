/*************************************************************
 * cutscene.js — Cutscenes, dialogue boxes, boss intros
 *************************************************************/

const Cutscene = (function() {
    
    let active = false;
    let queue = [];
    let current = null;
    let charIndex = 0;
    let charTimer = 0;
    const CHAR_SPEED = 0.03;
    let waitingForInput = false;
    let onComplete = null;
    
    // === DIALOGUE BOX ===
    function showDialogue(speaker, text, portrait = null) {
        queue.push({ type: 'dialogue', speaker, text, portrait });
        if (!active) nextScene();
    }
    
    function showBossIntro(name, subtitle = '') {
        queue.push({ type: 'boss', name, subtitle });
        if (!active) nextScene();
    }
    
    function showText(text) {
        queue.push({ type: 'text', text });
        if (!active) nextScene();
    }
    
    function nextScene() {
        if (queue.length === 0) {
            active = false;
            current = null;
            if (onComplete) { onComplete(); onComplete = null; }
            if (typeof Input !== 'undefined' && Input.enable) Input.enable();
            return;
        }
        
        active = true;
        current = queue.shift();
        charIndex = 0;
        charTimer = 0;
        waitingForInput = false;
        
        if (typeof Input !== 'undefined' && Input.disable) Input.disable();
        
        if (current.type === 'boss') {
            if (typeof Effects !== 'undefined') {
                Effects.presets.bossAppear();
            }
            if (typeof Audio !== 'undefined') {
                Audio.playSFX('explosion');
            }
            setTimeout(() => { waitingForInput = true; }, 1500);
        }
    }
    
    function advance() {
        if (!active || !current) return;
        
        if (current.type === 'dialogue' || current.type === 'text') {
            const fullText = current.text || '';
            if (charIndex < fullText.length) {
                charIndex = fullText.length;
            } else {
                nextScene();
            }
        } else if (current.type === 'boss' && waitingForInput) {
            nextScene();
        }
    }
    
    function update(dt) {
        if (!active || !current) return;
        
        if (current.type === 'dialogue' || current.type === 'text') {
            const fullText = current.text || '';
            if (charIndex < fullText.length) {
                charTimer += dt;
                while (charTimer >= CHAR_SPEED && charIndex < fullText.length) {
                    charTimer -= CHAR_SPEED;
                    charIndex++;
                    if (typeof Audio !== 'undefined' && charIndex % 2 === 0) {
                        Audio.playSFX('menu_move');
                    }
                }
            }
        }
    }
    
    function render(ctx, W, H) {
        if (!active || !current) return;
        
        if (current.type === 'dialogue') {
            renderDialogueBox(ctx, W, H);
        } else if (current.type === 'text') {
            renderTextBox(ctx, W, H);
        } else if (current.type === 'boss') {
            renderBossIntro(ctx, W, H);
        }
    }
    
    function renderDialogueBox(ctx, W, H) {
        const boxH = 60;
        const boxY = H - boxH - 10;
        
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(10, boxY, W - 20, boxH);
        ctx.strokeStyle = '#888';
        ctx.strokeRect(10, boxY, W - 20, boxH);
        
        // Speaker name
        if (current.speaker) {
            ctx.fillStyle = '#fc0';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(current.speaker, 18, boxY + 14);
        }
        
        // Text
        ctx.fillStyle = '#fff';
        ctx.font = '9px monospace';
        const displayText = current.text.substring(0, charIndex);
        wrapText(ctx, displayText, 18, boxY + 28, W - 40, 12);
        
        // Continue prompt
        if (charIndex >= current.text.length) {
            ctx.fillStyle = '#888';
            ctx.fillText('▼', W - 25, boxY + boxH - 8);
        }
    }
    
    function renderTextBox(ctx, W, H) {
        const boxW = 200;
        const boxH = 40;
        const boxX = (W - boxW) / 2;
        const boxY = H / 2 - boxH / 2;
        
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = '#888';
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(current.text.substring(0, charIndex), W / 2, boxY + 25);
        ctx.textAlign = 'left';
    }
    
    function renderBossIntro(ctx, W, H) {
        // Dramatic black bars
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, 40);
        ctx.fillRect(0, H - 40, W, 40);
        
        // Boss name
        ctx.fillStyle = '#c00';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(current.name, W / 2, H / 2);
        
        // Subtitle
        if (current.subtitle) {
            ctx.fillStyle = '#888';
            ctx.font = '10px monospace';
            ctx.fillText(current.subtitle, W / 2, H / 2 + 16);
        }
        
        ctx.textAlign = 'left';
        
        // Continue prompt
        if (waitingForInput) {
            ctx.fillStyle = '#666';
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Press any key', W / 2, H - 50);
            ctx.textAlign = 'left';
        }
    }
    
    function wrapText(ctx, text, x, y, maxW, lineH) {
        const words = text.split(' ');
        let line = '';
        let ty = y;
        
        for (const word of words) {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > maxW) {
                ctx.fillText(line, x, ty);
                line = word + ' ';
                ty += lineH;
            } else {
                line = test;
            }
        }
        ctx.fillText(line, x, ty);
    }
    
    // Input handler
    document.addEventListener('keydown', (e) => {
        if (active && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE')) {
            e.preventDefault();
            advance();
        }
    });
    
    return {
        showDialogue,
        showBossIntro,
        showText,
        update,
        render,
        isActive: () => active,
        setOnComplete: (cb) => { onComplete = cb; },
        skip: () => { queue = []; nextScene(); }
    };
    
})();

console.log('[Cutscene] Initialized');