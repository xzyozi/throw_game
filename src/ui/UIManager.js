import { WeaponData } from '../data/WeaponData.js';
import { Constants, TrajectoryUI } from '../data/Constants.js';

export class UIManager {
    constructor(eventEmitter) {
        this.events = eventEmitter;
        this.elements = {
            playerHpBar: document.getElementById('player-hp-bar'),
            playerHpText: document.getElementById('player-hp-text'),
            enemyHpBar: document.getElementById('enemy-hp-bar'),
            enemyHpText: document.getElementById('enemy-hp-text'),
            enemyName: document.getElementById('enemy-name'),
            bpBar: document.getElementById('bp-bar'),
            bpText: document.getElementById('bp-text'),
            weaponButtons: document.getElementById('weapon-buttons-container'),
            enemyBubble: document.getElementById('enemy-bubble'),
            specialMoveContainer: document.getElementById('skill-display-container'),
            damageContainer: document.getElementById('damage-container'),
            hitFlash: document.getElementById('hit-flash'),
        };
    }

    initWeaponButtons(deck) {
        this.elements.weaponButtons.innerHTML = '';
        deck.forEach(key => {
            const data = WeaponData[key];
            if (!data) return;
            const btn = document.createElement('button');
            btn.className = 'weapon-btn flex-1 h-full bg-white rounded border border-gray-300 shadow flex flex-col items-center justify-center overflow-hidden relative group';
            const rate = data.skill ? Math.floor(data.skill.rate * 100) : 0;
            const skillBadge = rate > 0 ? `<div class="absolute top-0 left-0 p-0.5 text-[8px] font-bold text-yellow-400 bg-slate-900/80 rounded-br leading-none">${rate}%</div>` : '';
            const uiConfig = TrajectoryUI[data.type] || { badgeColor: 'bg-slate-500', label: '?' };

            btn.innerHTML = `
                <div class="absolute top-0 right-0 px-1 py-0.5 text-[8px] font-bold text-white ${uiConfig.badgeColor} rounded-bl leading-none shadow-sm">${uiConfig.label}</div>
                ${skillBadge}
                <div class="text-2xl mb-1 filter drop-shadow-sm">${data.icon}</div>
                <div class="text-xs font-bold leading-none scale-90">${data.name}</div>
                <div class="text-[9px] text-gray-500 scale-90">BP:${data.cost}</div>
                <div class="cooldown-overlay" id="cd-${key}"></div>
            `;
            btn.onclick = () => this.events.emit('ui:throw_weapon', key);
            btn.id = `btn-${key}`;
            this.elements.weaponButtons.appendChild(btn);
        });
    }

    update(player, enemy) {
        this.updateBar(this.elements.playerHpBar, player.hp, player.maxHp);
        this.elements.playerHpText.innerText = `${Math.floor(player.hp)}/${player.maxHp}`;
        this.updateBar(this.elements.enemyHpBar, enemy.hp, enemy.maxHp);
        this.elements.enemyHpText.innerText = `${Math.floor(enemy.hp)}/${enemy.maxHp}`;
        this.updateBar(this.elements.bpBar, player.bp, Constants.MAX_BP);
        this.elements.bpText.innerText = `${Math.floor(player.bp)}/${Constants.MAX_BP}`;

        if (enemy.name && this.elements.enemyName.innerText !== enemy.name) {
            this.elements.enemyName.innerText = enemy.name;
        }

        player.deck.forEach(key => {
            const btn = document.getElementById(`btn-${key}`);
            const overlay = document.getElementById(`cd-${key}`);
            if (!btn || !overlay) return;
            const data = WeaponData[key];
            const cd = player.cooldowns[key];
            const pct = (cd / data.cooldown) * 100;
            overlay.style.height = `${pct}%`;
            btn.disabled = player.bp < data.cost || cd > 0;
        });
    }

    updateBar(el, current, max) {
        el.style.width = `${Math.max(0, Math.min(100, (current / max) * 100))}%`;
    }

    showFloatingText(x, y, text, color, isBig = false) {
        const el = document.createElement('div');
        el.className = 'damage-text';
        el.innerText = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.color = color;
        if (isBig) el.style.fontSize = '24px';
        this.elements.damageContainer.appendChild(el);
        setTimeout(() => el.remove(), 800);
    }

    showSkillCutIn(text, color) {
        const el = document.createElement('div');
        el.className = 'skill-text';
        el.innerText = text;
        el.style.color = color;
        el.style.left = "50%";
        el.style.top = "50%";
        this.elements.specialMoveContainer.appendChild(el);
        setTimeout(() => el.remove(), 1200);
    }

    showBubble(text, duration = 3000) {
        const el = this.elements.enemyBubble;
        if (!el) return;
        el.innerText = text;
        el.classList.add('show');
        if (duration > 0) {
            setTimeout(() => el.classList.remove('show'), duration);
        }
    }

    triggerFlash() {
        this.elements.hitFlash.style.opacity = 0.3;
        setTimeout(() => this.elements.hitFlash.style.opacity = 0, 50);
    }
}
