import { WeaponData } from '../data/WeaponData.js';
import { TrajectoryUI } from '../data/Constants.js';

export class WeaponSelectScene {
    constructor(ui) {
        this.ui = ui; // UIManager instance
        this.selectedWeapons = ['dagger', 'spear', 'sword', 'hammer', 'axe'];
        this.maxWeapons = 5;
        this.container = document.getElementById('weapon-select-screen');
        this.equippedContainer = document.getElementById('equipped-weapons');
        this.listContainer = document.getElementById('weapon-list');
        this.startBtn = document.getElementById('btn-battle-start');

        this.startBtn.onclick = () => {
            if (this.selectedWeapons.length === this.maxWeapons) {
                this.container.classList.add('hidden');
                this.ui.events.emit('scene:battle_start', this.selectedWeapons);
            }
        };
    }

    show() {
        this.container.classList.remove('hidden');
        this.render();
    }

    render() {
        this.equippedContainer.innerHTML = '';
        this.selectedWeapons = this.selectedWeapons.filter(key => WeaponData[key]);
        this.selectedWeapons.forEach((key, index) => {
            const data = WeaponData[key];
            if (data) {
                const card = this.createCard(data, true);
                card.onclick = () => this.removeWeapon(index);
                this.equippedContainer.appendChild(card);
            }
        });

        for (let i = this.selectedWeapons.length; i < this.maxWeapons; i++) {
            const empty = document.createElement('div');
            empty.className = "flex-1 h-full bg-slate-800/50 rounded border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500 text-xs";
            empty.innerText = "Empty";
            this.equippedContainer.appendChild(empty);
        }

        this.listContainer.innerHTML = '';
        const orderedTypes = Object.keys(TrajectoryUI);

        orderedTypes.forEach(typeId => {
            const keys = Object.keys(WeaponData).filter(key => WeaponData[key].type === typeId);
            if (keys.length > 0) {
                const uiConfig = TrajectoryUI[typeId];
                const section = document.createElement('div');
                section.className = "mb-3 bg-slate-800/40 rounded-lg overflow-hidden border border-slate-700";
                const header = document.createElement('div');
                header.className = `${uiConfig.colorBg} ${uiConfig.colorText} px-3 py-1 text-xs font-bold flex items-center gap-2 shadow-sm`;
                header.innerHTML = `<span>${uiConfig.icon}</span><span>${uiConfig.label}</span>`;
                section.appendChild(header);
                const grid = document.createElement('div');
                grid.className = 'p-2 grid grid-cols-4 sm:grid-cols-5 gap-2';

                keys.forEach(key => {
                    const data = WeaponData[key];
                    const isEquipped = this.selectedWeapons.includes(key);
                    const card = this.createCard(data, false);
                    if (isEquipped) {
                        card.classList.add('equipped');
                    } else {
                        card.onclick = () => this.addWeapon(key);
                    }
                    grid.appendChild(card);
                });
                section.appendChild(grid);
                this.listContainer.appendChild(section);
            }
        });

        this.startBtn.disabled = this.selectedWeapons.length !== this.maxWeapons;
        this.startBtn.innerText = this.selectedWeapons.length === this.maxWeapons ? "バトル開始！" : `あと ${this.maxWeapons - this.selectedWeapons.length} 個選択`;
        if (this.selectedWeapons.length === this.maxWeapons) {
            this.startBtn.classList.remove('opacity-50', 'grayscale');
            this.startBtn.classList.add('animate-bounce');
        } else {
            this.startBtn.classList.add('opacity-50', 'grayscale');
            this.startBtn.classList.remove('animate-bounce');
        }
    }

    createCard(data, isCompact) {
        if (!data) return document.createElement('div');
        const div = document.createElement('div');
        div.className = isCompact
            ? `equipped-card flex-1 h-full rounded p-1 flex flex-col items-center justify-center relative overflow-hidden border-2 border-slate-600`
            : `weapon-card rounded p-2 flex flex-col items-center justify-center relative overflow-hidden h-32 bg-slate-700 shadow-md`;

        const uiConfig = TrajectoryUI[data.type] || { badgeColor: 'bg-slate-500', label: '?' };
        const badgeClass = `${uiConfig.badgeColor} text-white`;

        let skillHtml = "";
        if (data.skill && !isCompact) {
            const rate = Math.floor(data.skill.rate * 100);
            skillHtml = `<div class="w-full bg-slate-900/50 rounded px-1 py-0.5 mt-1 border border-white/10"><div class="flex justify-between items-center text-[9px] text-yellow-400 font-bold"><span>★${data.skill.name}</span><span>${rate}%</span></div><div class="text-[8px] text-slate-300 leading-tight truncate">${data.skill.desc}</div></div>`;
        }

        if (isCompact) {
            div.innerHTML = `<div class="absolute top-0 right-0 px-1.5 py-0.5 text-[8px] font-bold ${badgeClass} rounded-bl shadow-sm">${uiConfig.label}</div><div class="text-2xl mb-1 filter drop-shadow-md">${data.icon}</div><div class="text-[10px] font-bold leading-none text-center text-white">${data.name}</div><div class="text-[8px] text-slate-300 mt-1">BP:${data.cost}</div>`;
        } else {
            div.innerHTML = `<div class="absolute top-0 right-0 px-1.5 py-0.5 text-[9px] font-bold ${badgeClass} rounded-bl shadow-sm">${uiConfig.label}</div><div class="text-2xl mb-1 filter drop-shadow-md">${data.icon}</div><div class="text-xs font-bold leading-none text-center text-white mb-1">${data.name}</div><div class="flex gap-1 justify-center w-full text-[9px] text-slate-300 bg-slate-800/30 rounded py-0.5 mb-0.5"><span class="flex items-center gap-0.5" title="攻撃力"><span class="text-red-400">⚔️</span>${data.power}</span><span class="flex items-center gap-0.5" title="耐久力"><span class="text-blue-400">🛡️</span>${data.durability}</span></div><div class="flex gap-1 justify-center w-full text-[9px] text-slate-300 bg-slate-800/30 rounded py-0.5"><span class="flex items-center gap-0.5" title="コスト"><span class="text-yellow-400">💎</span>${data.cost}</span><span class="flex items-center gap-0.5" title="速度"><span class="text-green-400">⏱️</span>${data.speed}</span></div>${skillHtml}`;
        }
        div.style.borderBottom = `3px solid ${data.color}`;
        return div;
    }

    addWeapon(key) {
        if (this.selectedWeapons.length < this.maxWeapons && !this.selectedWeapons.includes(key)) {
            this.selectedWeapons.push(key);
            this.selectedWeapons.sort((a, b) => WeaponData[a].cost - WeaponData[b].cost);
            this.render();
        }
    }

    removeWeapon(index) {
        this.selectedWeapons.splice(index, 1);
        this.render();
    }
}
