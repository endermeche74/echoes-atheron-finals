const DialogueCanvas = (function() {
    let active = false;
    let currentNPC = null;
    let dialogueIndex = 0;
    let charIndex = 0;
    let charTimer = 0;
    const CHAR_SPEED = 0.03;

    // Dialogues par NPC (à remplacer par tes données)
    const DIALOGUES = {
        merchant: [
            { speaker: 'Merchant', text: "Welcome, traveler. Care to see my wares?" },
            { speaker: 'Merchant', text: "I have potions, weapons, and rare artifacts." },
            { options: ['Buy', 'Sell', 'Leave'] }
        ],
        guard: [
            { speaker: 'Guard', text: "Halt! State your business." },
            { speaker: 'Guard', text: "The road ahead is dangerous. Be careful." }
        ],
        elder: [
            { speaker: 'Elder', text: "Ah, a new face in our village." },
            { speaker: 'Elder', text: "Dark times are upon us, young one." },
            { speaker: 'Elder', text: "Seek the ancient shrine in the Ashwood..." }
        ],
        default: [
            { speaker: '???', text: "..." }
        ]
    };

    function start(npcId) {
        active = true;
        currentNPC = npcId;
        dialogueIndex = 0;
        charIndex = 0;
        charTimer = 0;

        if (typeof Input !== 'undefined') Input.disable();
        console.log('[Dialogue] Started with', npcId);
    }

    function advance() {
        const dialogue = DIALOGUES[currentNPC] || DIALOGUES.default;
        const current = dialogue[dialogueIndex];

        // Si texte pas fini, finir
        if (current.text && charIndex < current.text.length) {
            charIndex = current.text.length;
            return;
        }

        // Sinon passer au suivant
        dialogueIndex++;
        charIndex = 0;

        if (dialogueIndex >= dialogue.length) {
            close();
        }
    }

    function close() {
        active = false;
        currentNPC = null;
        if (typeof Input !== 'undefined') Input.enable();
    }

    function update(dt) {
        if (!active) return;

        const dialogue = DIALOGUES[currentNPC] || DIALOGUES.default;
        const current = dialogue[dialogueIndex];

        if (current && current.text && charIndex < current.text.length) {
            charTimer += dt;
            while (charTimer >= CHAR_SPEED && charIndex < current.text.length) {
                charTimer -= CHAR_SPEED;
                charIndex++;
            }
        }
    }

    function render(ctx) {
        if (!active) return;

        const W = CONFIG.CANVAS_W;
        const H = CONFIG.CANVAS_H;

        const dialogue = DIALOGUES[currentNPC] || DIALOGUES.default;
        const current = dialogue[dialogueIndex];

        if (!current) return;

        // Box de dialogue
        const boxH = 80;
        const boxY = H - boxH - 10;

        ctx.fillStyle = 'rgba(10, 8, 15, 0.95)';
        ctx.fillRect(10, boxY, W - 20, boxH);
        ctx.strokeStyle = '#4a4560';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, boxY, W - 20, boxH);
        ctx.lineWidth = 1;

        // Portrait placeholder
        ctx.fillStyle = '#2a2535';
        ctx.fillRect(20, boxY + 10, 60, 60);
        ctx.strokeStyle = '#5a5570';
        ctx.strokeRect(20, boxY + 10, 60, 60);

        // Nom du speaker
        if (current.speaker) {
            ctx.fillStyle = '#d4a840';
            ctx.font = 'bold 14px monospace';
            ctx.fillText(current.speaker, 90, boxY + 22);
        }

        // Texte (typewriter effect)
        if (current.text) {
            ctx.fillStyle = '#c0b8a0';
            ctx.font = '12px monospace';
            const displayText = current.text.substring(0, charIndex);
            wrapText(ctx, displayText, 90, boxY + 42, W - 120, 16);
        }

        // Options
        if (current.options) {
            // TODO: menu d'options
        }

        // Indicateur "suite"
        if (charIndex >= (current.text?.length || 0)) {
            ctx.fillStyle = '#888';
            ctx.fillText('▼ E', W - 50, boxY + boxH - 10);
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

    // Input
    document.addEventListener('keydown', (e) => {
        if (!active) return;
        if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            advance();
        }
        if (e.code === 'Escape') {
            e.preventDefault();
            close();
        }
    });

    return {
        start,
        close,
        update,
        render,
        isActive: () => active,
        addDialogue: (npcId, lines) => { DIALOGUES[npcId] = lines; }
    };
})();

console.log('[DialogueCanvas] Ready');
