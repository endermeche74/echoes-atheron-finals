/*************************************************************
 * inventory_canvas.js — Inventory UI for Canvas Mode
 * Press I to open inventory
 *************************************************************/

const InventoryCanvas = (function() {
    
    let active = false;
    let tab = 0; // 0=items, 1=equipment, 2=stats
    let selectedIndex = 0;
    
    // Player inventory (sync with game state if exists)
    let inventory = {
        items: [
            { id: 'potion', name: 'Health Potion', count: 5, icon: '❤', desc: 'Restores 30 HP', type: 'consumable' },
            { id: 'ether', name: 'Mana Elixir', count: 3, icon: '💧', desc: 'Restores 25 MP', type: 'consumable' },
            { id: 'antidote', name: 'Antidote', count: 2, icon: '💊', desc: 'Cures poison', type: 'consumable' },
            { id: 'torch', name: 'Torch', count: 4, icon: '🔥', desc: 'Lights dark areas', type: 'tool' },
            { id: 'key_iron', name: 'Iron Key', count: 1, icon: '🔑', desc: 'Opens iron doors', type: 'key' },
            { id: 'letter', name: 'Old Letter', count: 1, icon: '📜', desc: 'A weathered note', type: 'quest' }
        ],
        equipment: {
            weapon: { id: 'sword_iron', name: 'Iron Sword', atk: 10, icon: '⚔', desc: '+10 ATK' },
            armor: { id: 'leather', name: 'Leather Armor', def: 5, icon: '🛡', desc: '+5 DEF' },
            accessory: null
        },
        gold: 150
    };
    
    let stats = {
        hp: 100, maxHp: 100,
        mp: 50, maxMp: 50,
        atk: 15, def: 8, mag: 10, spd: 12,
        level: 5, xp: 230, xpNext: 500
    };
    
    const TABS = ['Items', 'Equip', 'Stats'];
    
    function open() {
        active = true;
        tab = 0;
        selectedIndex = 0;
        if (typeof Input !== 'undefined') Input.disable();
    }
    
    function close() {
        active = false;
        if (typeof Input !== 'undefined') Input.enable();
    }
    
    function toggle() {
        if (active) close();
        else open();
    }
    
    function handleInput(key) {
        if (!active) return;
        
        if (key === 'cancel' || key === 'menu') {
            close();
            return;
        }
        
        if (key === 'left') tab = (tab - 1 + TABS.length) % TABS.length;
        else if (key === 'right') tab = (tab + 1) % TABS.length;
        
        const list = getListForTab();
        if (key === 'up') selectedIndex = Math.max(0, selectedIndex - 1);
        else if (key === 'down') selectedIndex = Math.min(list.length - 1, selectedIndex + 1);
        
        if (key === 'confirm') useSelected();
    }
    
    function getListForTab() {
        if (tab === 0) return inventory.items.filter(i => i.count > 0);
        if (tab === 1) return ['weapon', 'armor', 'accessory'];
        return [];
    }
    
    function useSelected() {
        if (tab !== 0) return;
        const items = inventory.items.filter(i => i.count > 0);
        const item = items[selectedIndex];
        if (!item || item.type !== 'consumable') return;
        
        // Use item
        item.count--;
        
        if (item.id === 'potion') {
            stats.hp = Math.min(stats.maxHp, stats.hp + 30);
            showMessage('Restored 30 HP!');
        } else if (item.id === 'ether') {
            stats.mp = Math.min(stats.maxMp, stats.mp + 25);
            showMessage('Restored 25 MP!');
        }
        
        if (typeof GameAudio !== 'undefined') GameAudio.playSFX('heal');
    }
    
    let message = '';
    let messageTimer = 0;
    
    function showMessage(msg) {
        message = msg;
        messageTimer = 1.5;
    }
    
    function update(dt) {
        if (messageTimer > 0) messageTimer -= dt;
    }
    
    function render(ctx) {
        if (!active) return;
        
        const W = 320, H = 240;
        
        // Darken background
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);
        
        // Main panel
        const panelX = 20, panelY = 20;
        const panelW = 280, panelH = 200;
        
        ctx.fillStyle = 'rgba(20,20,30,0.95)';
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelW, panelH);
        ctx.lineWidth = 1;
        
        // Tabs
        ctx.font = '10px monospace';
        for (let i = 0; i < TABS.length; i++) {
            const tx = panelX + 10 + i * 90;
            const isActive = i === tab;
            
            ctx.fillStyle = isActive ? '#1a1a2a' : 'transparent';
            ctx.fillRect(tx, panelY - 2, 80, 18);
            ctx.strokeStyle = isActive ? '#888' : '#444';
            ctx.strokeRect(tx, panelY - 2, 80, 18);
            
            ctx.fillStyle = isActive ? '#ffcc00' : '#666';
            ctx.fillText(TABS[i], tx + 25, panelY + 10);
        }
        
        // Content
        if (tab === 0) renderItems(ctx, panelX, panelY);
        else if (tab === 1) renderEquipment(ctx, panelX, panelY);
        else renderStats(ctx, panelX, panelY);
        
        // Gold
        ctx.fillStyle = '#c0a030';
        ctx.font = '10px monospace';
        ctx.fillText('Gold: ' + inventory.gold, panelX + panelW - 80, panelY + panelH - 10);
        
        // Controls hint
        ctx.fillStyle = '#555';
        ctx.font = '8px monospace';
        ctx.fillText('←→:Tab  ↑↓:Select  E:Use  Esc:Close', panelX + 10, panelY + panelH - 10);
        
        // Message
        if (messageTimer > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.9)';
            ctx.fillRect(100, 100, 120, 30);
            ctx.fillStyle = '#8f8';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(message, 160, 118);
            ctx.textAlign = 'left';
        }
    }
    
    function renderItems(ctx, px, py) {
        const items = inventory.items.filter(i => i.count > 0);
        
        ctx.font = '9px monospace';
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const y = py + 30 + i * 20;
            const isSelected = i === selectedIndex;
            
            // Selection highlight
            if (isSelected) {
                ctx.fillStyle = 'rgba(100,100,150,0.3)';
                ctx.fillRect(px + 5, y - 10, 180, 18);
            }
            
            // Icon
            ctx.fillStyle = '#fff';
            ctx.fillText(item.icon || '•', px + 10, y);
            
            // Name
            ctx.fillStyle = isSelected ? '#fff' : '#aaa';
            ctx.fillText(item.name, px + 30, y);
            
            // Count
            ctx.fillStyle = '#888';
            ctx.fillText('x' + item.count, px + 150, y);
            
            // Type tag
            ctx.fillStyle = item.type === 'consumable' ? '#4a8' : 
                           item.type === 'key' ? '#c80' :
                           item.type === 'quest' ? '#a4a' : '#888';
            ctx.fillText('[' + item.type + ']', px + 180, y);
        }
        
        // Description
        if (items[selectedIndex]) {
            ctx.fillStyle = '#666';
            ctx.fillRect(px + 5, py + 165, 270, 20);
            ctx.fillStyle = '#ccc';
            ctx.fillText(items[selectedIndex].desc, px + 10, py + 178);
        }
    }
    
    function renderEquipment(ctx, px, py) {
        const slots = [
            { key: 'weapon', label: 'Weapon', y: py + 40 },
            { key: 'armor', label: 'Armor', y: py + 80 },
            { key: 'accessory', label: 'Accessory', y: py + 120 }
        ];
        
        ctx.font = '9px monospace';
        
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const item = inventory.equipment[slot.key];
            const isSelected = i === selectedIndex;
            
            // Slot label
            ctx.fillStyle = '#888';
            ctx.fillText(slot.label + ':', px + 15, slot.y);
            
            // Selection
            if (isSelected) {
                ctx.fillStyle = 'rgba(100,100,150,0.3)';
                ctx.fillRect(px + 80, slot.y - 10, 180, 18);
            }
            
            if (item) {
                ctx.fillStyle = '#fff';
                ctx.fillText((item.icon || '•') + ' ' + item.name, px + 85, slot.y);
                ctx.fillStyle = '#8a8';
                ctx.fillText(item.desc, px + 85, slot.y + 12);
            } else {
                ctx.fillStyle = '#555';
                ctx.fillText('- Empty -', px + 85, slot.y);
            }
        }
        
        // Total stats from equipment
        ctx.fillStyle = '#aaa';
        ctx.fillText('Equipment Bonuses:', px + 15, py + 160);
        const weapon = inventory.equipment.weapon;
        const armor = inventory.equipment.armor;
        ctx.fillStyle = '#a88';
        ctx.fillText('ATK: +' + (weapon?.atk || 0), px + 15, py + 175);
        ctx.fillStyle = '#88a';
        ctx.fillText('DEF: +' + (armor?.def || 0), px + 80, py + 175);
    }
    
    function renderStats(ctx, px, py) {
        ctx.font = '10px monospace';
        
        // Character name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('Wanderer', px + 15, py + 35);
        ctx.fillStyle = '#888';
        ctx.font = '10px monospace';
        ctx.fillText('Level ' + stats.level, px + 100, py + 35);
        
        // HP/MP bars
        ctx.fillStyle = '#888';
        ctx.fillText('HP', px + 15, py + 55);
        ctx.fillStyle = '#222';
        ctx.fillRect(px + 40, py + 45, 120, 12);
        ctx.fillStyle = '#3a8a3a';
        ctx.fillRect(px + 40, py + 45, 120 * (stats.hp / stats.maxHp), 12);
        ctx.fillStyle = '#fff';
        ctx.fillText(stats.hp + ' / ' + stats.maxHp, px + 50, py + 55);
        
        ctx.fillStyle = '#888';
        ctx.fillText('MP', px + 15, py + 75);
        ctx.fillStyle = '#222';
        ctx.fillRect(px + 40, py + 65, 120, 12);
        ctx.fillStyle = '#3a5a8a';
        ctx.fillRect(px + 40, py + 65, 120 * (stats.mp / stats.maxMp), 12);
        ctx.fillStyle = '#fff';
        ctx.fillText(stats.mp + ' / ' + stats.maxMp, px + 50, py + 75);
        
        // XP bar
        ctx.fillStyle = '#888';
        ctx.fillText('XP', px + 15, py + 95);
        ctx.fillStyle = '#222';
        ctx.fillRect(px + 40, py + 85, 120, 12);
        ctx.fillStyle = '#8a8a3a';
        ctx.fillRect(px + 40, py + 85, 120 * (stats.xp / stats.xpNext), 12);
        ctx.fillStyle = '#fff';
        ctx.fillText(stats.xp + ' / ' + stats.xpNext, px + 50, py + 95);
        
        // Stats grid
        const statList = [
            { name: 'ATK', value: stats.atk, color: '#c88' },
            { name: 'DEF', value: stats.def, color: '#88c' },
            { name: 'MAG', value: stats.mag, color: '#c8c' },
            { name: 'SPD', value: stats.spd, color: '#8c8' }
        ];
        
        ctx.fillStyle = '#aaa';
        ctx.fillText('Attributes:', px + 15, py + 120);
        
        for (let i = 0; i < statList.length; i++) {
            const s = statList[i];
            const x = px + 15 + (i % 2) * 100;
            const y = py + 140 + Math.floor(i / 2) * 20;
            
            ctx.fillStyle = '#888';
            ctx.fillText(s.name + ':', x, y);
            ctx.fillStyle = s.color;
            ctx.fillText(s.value, x + 40, y);
        }
    }
    
    // Key handler
    document.addEventListener('keydown', (e) => {
        // Open inventory with I
        if ((e.code === 'KeyI') && typeof Engine !== 'undefined' && Engine.isCanvasMode()) {
            if (!active && !CombatEnhanced?.isActive()) {
                e.preventDefault();
                open();
            }
        }
        
        if (!active) return;
        
        const keyMap = {
            'ArrowUp': 'up', 'KeyZ': 'up',
            'ArrowDown': 'down', 'KeyS': 'down',
            'ArrowLeft': 'left', 'KeyQ': 'left',
            'ArrowRight': 'right', 'KeyD': 'right',
            'Enter': 'confirm', 'Space': 'confirm', 'KeyE': 'confirm',
            'Escape': 'cancel', 'KeyI': 'menu'
        };
        
        const action = keyMap[e.code];
        if (action) {
            e.preventDefault();
            handleInput(action);
        }
    });
    
    return {
        open,
        close,
        toggle,
        update,
        render,
        isActive: () => active,
        getInventory: () => inventory,
        getStats: () => stats
    };
    
})();

console.log('[InventoryCanvas] Press I to open inventory');