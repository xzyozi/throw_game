import { DifficultySettings } from '../data/DifficultyConfig.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { WeaponFactory } from './WeaponFactory.js';
import { Particle } from '../entities/Particle.js';
import { Lightning } from '../entities/Lightning.js';
import { FireField } from '../entities/FireField.js';
import { Weapon } from '../entities/Weapon.js';
import { Constants } from '../data/Constants.js';
import { WeaponData } from '../data/WeaponData.js';

// Note: This class combines system logic and rendering, acting as a scene.
// The design doc suggests separating this into BattleSystem, SceneManager, and CanvasRenderer.
export class BattleScene {
    constructor(context) {
        this.ctx = context;
        this.engine = context.engine;
        this.gemini = context.gemini;
        this.ui = context.ui;
        this.events = context.events;

        this.canvas = document.getElementById('game-canvas');
        this.drawCtx = this.canvas.getContext('2d');
        this.groundY = 0;

        this.player = null;
        this.enemy = null;
        this.weapons = [];
        this.particles = [];
        this.fireFields = [];
        this.difficulty = 'normal';
        this.isBattleStarted = false;

        this.events.on('ui:throw_weapon', (key) => this.playerThrow(key));
    }

    init(difficulty, playerDeck) {
        this.difficulty = difficulty;
        const diffConfig = DifficultySettings[difficulty];
        this.player = new Player(0, 0, playerDeck);
        this.enemy = new Enemy(0, 0, diffConfig);
        this.weapons = [];
        this.particles = [];
        this.fireFields = [];
        this.isBattleStarted = true;
        this.ui.initWeaponButtons(playerDeck);
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // TODO: Move name generation to a proper place
        this.gemini.getBossName().then(name => {
            this.enemy.name = name || "暗黒騎士ガイア";
            this.ui.elements.enemyName.innerText = this.enemy.name;
        });
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.groundY = this.canvas.height * Constants.GROUND_Y_RATIO;
        if (this.player) {
            this.player.y = this.groundY - 40;
            this.player.x = 60;
        }
        if (this.enemy) {
            this.enemy.y = this.groundY - 40;
            this.enemy.x = this.canvas.width - 60;
        }
    }

    playerThrow(key, consumeCost = true) {
        if (!this.isBattleStarted) return;
        const data = WeaponData[key];
        let cost = data.cost;
        let cooldown = data.cooldown;

        const isSkillTriggered = consumeCost && data.skill && (data.skill.rate === 1.00 || Math.random() < data.skill.rate);

        if (consumeCost) {
            if (isSkillTriggered && data.skill.name === "分身") cost = 0;
            if (this.player.bp < cost || this.player.cooldowns[key] > 0) return;
            
            this.player.bp -= cost;
            if (isSkillTriggered && data.skill.name === "早業") cooldown = 0.1;
            this.player.cooldowns[key] = cooldown;
        }

        if (isSkillTriggered) {
            if (data.skill.name === "祈り") { this.player.bp = Math.min(Constants.MAX_BP, this.player.bp + 2); this.ui.showFloatingText(this.player.x, this.player.y - 60, "BP+2", "#fcd34d"); }
            if (data.skill.name === "連射") setTimeout(() => this.playerThrow(key, false), 200);
            if (data.skill.name === "乱射") { setTimeout(() => this.playerThrow(key, false), 150); setTimeout(() => this.playerThrow(key, false), 300); }
            this.ui.showSkillCutIn(data.skill.name, "#fbbf24");
        }

        const weapon = WeaponFactory.create(key, 'player', { x: this.player.x + 30, y: this.player.y - 20 }, { x: this.enemy.x, y: this.enemy.y - 20 }, isSkillTriggered, isSkillTriggered ? data.skill.name : null);
        if(weapon) this.weapons.push(weapon);
    }

    update(dt) {
        if (!this.isBattleStarted) return;
        this.player.update(dt);
        this.enemy.update(dt);
        this.updateEnemyAI(dt);

        // Update systems
        this.handleSpecialWeaponEffects(dt);

        for (let i = this.weapons.length - 1; i >= 0; i--) {
            const w = this.weapons[i];
            const ownerUnit = w.owner === 'player' ? this.player : this.enemy;
            w.update(dt, ownerUnit);

            if (w.isDead) {
                if (w.activatedSkill === "分裂" || w.activatedSkill === "襲撃") this.spawnCluster(w);
                if (w.activatedSkill === "炎上") this.fireFields.push(new FireField(w.x, this.groundY, '#f97316'));
                if (w.activatedSkill === "粘着" && w.stickTarget) { w.stickTarget.isDead = true; this.spawnParticles(w.x, w.y, 'break', '#ef4444'); }
                this.weapons.splice(i, 1);
                continue;
            }
            
            if (w.progress >= 1.0 && !w.stickTarget && w.activatedSkill !== 'サテライト') {
                this.applyDamage(w);
                w.isDead = true;
                this.weapons.splice(i, 1);
            }
        }
        
        this.checkCollisions();

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i]; p.update(dt); if (p.isDead) this.particles.splice(i, 1);
        }
        for (let i = this.fireFields.length - 1; i >= 0; i--) {
            const f = this.fireFields[i]; f.update(dt);
            if (Math.abs(f.x - this.enemy.x) < 40) this.enemy.takeDamage(0.5);
            if (f.isDead) this.fireFields.splice(i, 1);
        }

        this.ui.update(this.player, this.enemy);
        
        if (this.player.hp <= 0 || this.enemy.hp <= 0) {
            this.finishGame(this.player.hp > 0);
        }
    }
    
    handleSpecialWeaponEffects(dt) {
        // Gravity and Magnet Fields
        this.weapons.forEach(w1 => {
            if ((w1.activatedSkill === "重力場" || w1.activatedSkill === "磁場") && !w1.isDead) {
                this.weapons.forEach(w2 => {
                    if (w2.owner !== w1.owner && !w2.isDead) {
                        const dist = Math.sqrt((w1.x - w2.x)**2 + (w1.y - w2.y)**2);
                        if (dist < 150) {
                             const pullStrength = w1.activatedSkill === "重力場" ? 2.0 : 5.0;
                             w2.x += (w1.x - w2.x) * pullStrength * dt;
                             w2.y += (w1.y - w2.y) * pullStrength * dt;
                        }
                    }
                });
            }
        });

        // Wind Fan
        const windWeapon = this.weapons.find(w => w.activatedSkill === '追い風' && !w.isDead);
        if (windWeapon) {
            this.weapons.forEach(w => {
                if (w === windWeapon) return;
                const force = (w.owner === windWeapon.owner) ? 2 : -2;
                w.x += force * dt * 60;
            });
        }

        // Lightning Cloud
        this.weapons.forEach(w => {
            if (w.activatedSkill === '落雷' && !w.isDead) {
                w.thunderTimer = (w.thunderTimer || 0) - dt;
                if (w.thunderTimer <= 0) {
                    w.thunderTimer = 0.8;
                    const target = w.owner === 'player' ? this.enemy : this.player;
                    if (Math.abs(w.x - target.x) < 50) {
                         target.takeDamage(10);
                         this.ui.showFloatingText(target.x, target.y - 40, "-10", "#ffff00");
                         this.particles.push(new Lightning(w.x, w.y, target.x, target.y));
                    }
                }
            }
        });
    }

    spawnCluster(parentW) {
        for (let i = 0; i < 3; i++) {
            const sub = new Weapon({
                name: "子弾", icon: "💥", type: 'Parabola',
                power: Math.floor(parentW.power * 0.3), durability: 1, cost: 0,
                speed: 1.0, cooldown: 0, heightOffset: 50 + Math.random() * 50, size: 15, color: parentW.color,
                owner: parentW.owner, scale: 0.6,
                startX: parentW.x, startY: parentW.y,
                targetX: parentW.targetX + (Math.random() - 0.5) * 150, targetY: parentW.targetY
            });
            this.weapons.push(sub);
        }
    }

    updateEnemyAI(dt) {
        if (this.enemy.actionTimer <= 0) {
            const keys = Object.keys(WeaponData);
            const choice = keys[Math.floor(Math.random() * keys.length)];
            const data = WeaponData[choice];
            if (this.enemy.bp >= data.cost) {
                this.enemy.bp -= data.cost;
                let targetY = this.player.y - 20;
                if (this.enemy.blindTimer > 0) targetY += (Math.random() - 0.5) * 400;
                const weapon = WeaponFactory.create(choice, 'enemy', { x: this.enemy.x - 30, y: this.enemy.y - 20 }, { x: this.player.x, y: targetY });
                if(weapon) this.weapons.push(weapon);
                const baseInterval = 1.5 + Math.random() * 1.5;
                this.enemy.actionTimer = baseInterval * this.enemy.actionSpeedMult;
            } else {
                this.enemy.actionTimer = 0.5;
            }
        }
    }

    checkCollisions() {
        for (let i = 0; i < this.weapons.length; i++) {
            for (let j = i + 1; j < this.weapons.length; j++) {
                const w1 = this.weapons[i];
                const w2 = this.weapons[j];
                if (!w1 || !w2 || w1.owner === w2.owner || w1.type === 'Submarine' || w2.type === 'Submarine' || w1.stickTarget || w2.stickTarget) continue;

                const dx = w1.x - w2.x;
                const dy = w1.y - w2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const s1 = (w1.size || 20) * (w1.scale || 1.0);
                const s2 = (w2.size || 20) * (w2.scale || 1.0);
                if (dist < (s1 + s2) / 1.2) {
                    this.resolveClash(w1, w2);
                }
            }
        }
    }

    resolveClash(w1, w2) {
        // ... (Collision logic is complex and will be moved to CollisionDetector later)
        let damageTo1 = w2.power + (w2.currentDurability * 0.5);
        let damageTo2 = w1.power + (w1.currentDurability * 0.5);

        w1.currentDurability -= damageTo1;
        w2.currentDurability -= damageTo2;

        const midX = (w1.x + w2.x) / 2;
        const midY = (w1.y + w2.y) / 2;
        this.spawnParticles(midX, midY, 'clash', '#fff');
        this.engine.triggerHitStop(0.05);

        if (w1.currentDurability <= 0) { w1.isDead = true; this.spawnParticles(w1.x, w1.y, 'break', w1.color); }
        if (w2.currentDurability <= 0) { w2.isDead = true; this.spawnParticles(w2.x, w2.y, 'break', w2.color); }
    }

    applyDamage(weapon) {
        const isPlayerHit = weapon.owner === 'enemy';
        const target = isPlayerHit ? this.player : this.enemy;
        
        target.takeDamage(weapon.power);
        this.spawnParticles(weapon.x, weapon.y, 'hit', weapon.color);
        this.ui.showFloatingText(weapon.x, weapon.y - 40, `-${weapon.power}`, isPlayerHit ? "#ff0000" : "#ffff00", true);
        this.ui.triggerFlash();

        if (weapon.activatedSkill === "目潰し") { target.blindTimer = 5.0; this.ui.showFloatingText(target.x, target.y - 80, "BLIND!", "#f87171", true); }
    }

    finishGame(isWin) {
        if (!this.isBattleStarted) return;
        this.engine.stop();
        this.isBattleStarted = false;
        const resultScreen = document.getElementById('result-screen');
        const resultTitle = document.getElementById('result-title');
        const resultComment = document.getElementById('result-comment');
        resultScreen.classList.remove('hidden');
        if (isWin) {
            resultTitle.innerText = "VICTORY!";
            resultTitle.className = "text-5xl font-bold text-yellow-400 mb-4 font-['Reggae_One']";
            resultComment.innerText = "見事な勝利だ！";
        } else {
            resultTitle.innerText = "DEFEAT...";
            resultTitle.className = "text-5xl font-bold text-blue-500 mb-4 font-['Reggae_One']";
            resultComment.innerText = "一歩及ばなかった...";
        }
    }

    spawnParticles(x, y, type, color) {
        const count = type === 'break' ? 10 : 5;
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    draw() {
        if (!this.isBattleStarted) return;
        this.drawCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCtx.fillStyle = "#334155";
        this.drawCtx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        this.drawCtx.fillStyle = "#475569";
        this.drawCtx.fillRect(0, this.groundY, this.canvas.width, 10);
        
        if(this.player) this.drawUnit(this.drawCtx, this.player, 'blue');
        if(this.enemy) this.drawUnit(this.drawCtx, this.enemy, 'red');

        this.fireFields.forEach(f => f.draw(this.drawCtx));
        this.weapons.forEach(w => w.draw(this.drawCtx, this.groundY));
        this.particles.forEach(p => p.draw(this.drawCtx));
    }

    drawUnit(ctx, unit, color) {
        ctx.save();
        ctx.translate(unit.x, unit.y);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(0, 10, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        if (unit.blindTimer > 0) {
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillText("🕶️", 0, -50);
        }
        ctx.strokeStyle = color === 'blue' ? '#3b82f6' : '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, -30);
        ctx.moveTo(0, -20); ctx.lineTo(-10, -10);
        ctx.moveTo(0, -20); ctx.lineTo(10, -10);
        ctx.moveTo(0, 0); ctx.lineTo(-10, 20);
        ctx.moveTo(0, 0); ctx.lineTo(10, 20);
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(0, -35, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}
