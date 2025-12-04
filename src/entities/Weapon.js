import { GameObject } from './GameObject.js';
import { TrajectorySystem } from '../systems/TrajectorySystem.js';
import { TrajectoryTypes } from '../data/Constants.js';

export class Weapon extends GameObject {
    constructor(params) {
        super(params.startX, params.startY);
        Object.assign(this, params);
        this.currentDurability = this.durability;
        this.progress = 0;
        this.rotation = 0;
        this.rotSpeed = (this.owner === 'player' ? 1 : -1) * (5 + Math.random() * 5);
        
        // TODO: Refactor to use dependency injection for TrajectorySystem
        this.trajectorySystem = new TrajectorySystem();
        
        if (this.scale === undefined) this.scale = 1.0;

        this.speedMultiplier = 1.0;
        this.satelliteAngle = 0;
        this.satelliteTime = 10.0;
        this.stickTarget = null;
        this.stickTimer = 3.0;
        this.returnPhase = false; // For Boomerang
        this.thunderTimer = 0; // For Cloud

        if (this.activatedSkill === '多重殻' && this.layer === undefined) this.layer = 3;

        this.isPhysical = false;
        this.vx = 0;
        this.vy = 0;
    }

    update(dt, ownerUnit) {
        // Sticky logic
        if (this.stickTarget) {
            if (this.stickTarget.isDead || this.stickTimer <= 0) {
                this.isDead = true;
                return;
            }
            this.stickTimer -= dt;
            this.x = this.stickTarget.x;
            this.y = this.stickTarget.y;
            this.stickTarget.speedMultiplier = 0.2;
            return;
        }

        // Satellite logic
        if (this.activatedSkill === 'サテライト') {
            this.satelliteTime -= dt;
            if (this.satelliteTime <= 0 || this.currentDurability <= 0) {
                this.isDead = true;
                return;
            }
            const radius = 70;
            const speed = 3.0;
            this.satelliteAngle += speed * dt;
            if (ownerUnit) {
                this.x = ownerUnit.x + Math.cos(this.satelliteAngle) * radius;
                this.y = ownerUnit.y - 20 + Math.sin(this.satelliteAngle) * radius;
            }
            this.rotation = this.satelliteAngle;
            return;
        }

        // Cloud (Lightning) logic
        if (this.activatedSkill === '落雷') {
            this.thunderTimer -= dt;
            if (this.thunderTimer <= 0) {
                this.thunderTimer = 0.5; // Placeholder for event emission
            }
        }

        // Physical mode (after being hit)
        if (this.isPhysical) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += 300 * dt; // Gravity
            this.rotation += this.rotSpeed * dt;

            const groundY = 480; // TODO: Get from a constant
            if (this.y > groundY + 50) {
                this.isDead = true;
            }

            if (this.activatedSkill === 'ポータル') {
                if (this.x < 0) this.x = 896;
                else if (this.x > 896) this.x = 0;
            }
            return;
        }

        // Acceleration skill
        if (this.activatedSkill === '加速' && this.progress > 0.4) {
            this.speedMultiplier = 3.0;
        }

        const actualSpeed = this.speed / this.speedMultiplier;
        this.progress += dt / actualSpeed;

        // Boomerang return logic
        if (this.activatedSkill === '往復' && this.progress >= 1.0) {
            if (!this.returnPhase) {
                this.returnPhase = true;
                this.progress = 0;
                const temp = this.startX;
                this.startX = this.targetX;
                this.targetX = temp;
            } else {
                this.isDead = true;
            }
        } else if (this.progress > 1.0) {
            this.progress = 1.0;
        }

        const pos = this.trajectorySystem.calculate(this.type, this.startX, this.startY, this.targetX, this.targetY, this.progress, this.heightOffset);
        this.x = pos.x;
        this.y = pos.y;
        this.rotation += this.rotSpeed * dt;

        // Portal (looping)
        if (this.activatedSkill === 'ポータル') {
            if (this.x < 0) this.x = 896;
            else if (this.x > 896) this.x = 0;
            
            const groundY = 480; // TODO: Get from a constant
            if (this.y < -200) this.y = groundY - 50;
            else if (this.y > groundY) this.y = -100;
        }
    }

    draw(ctx, groundY) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.type === TrajectoryTypes.SUBMARINE) ctx.globalAlpha = 0.6;

        // Draw shadow
        ctx.save();
        const groundDist = Math.max(0, groundY - this.y);
        const shadowScale = Math.max(0.5, 1 - groundDist / 300) * this.scale;
        const shadowAlpha = Math.max(0.1, 0.5 - groundDist / 300);
        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
        ctx.setTransform(1, 0, 0, 1, this.x, groundY);
        ctx.scale(shadowScale, shadowScale * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw weapon
        ctx.rotate(this.rotation);
        ctx.scale(this.scale || 1.0, this.scale || 1.0);
        ctx.font = `${this.size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (this.owner === 'enemy') ctx.scale(-1, 1);
        ctx.fillText(this.icon, 0, 0);

        // Skill effect glow
        if (this.activatedSkill) {
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
        ctx.restore();

        // Draw durability bar
        const hpPct = this.currentDurability / this.durability;
        const scale = this.scale || 1.0;
        const barW = 30 * scale;
        ctx.fillStyle = "#333";
        ctx.fillRect(this.x - barW / 2, this.y - 25 * scale, barW, 4 * scale);
        ctx.fillStyle = hpPct > 0.5 ? "#22c55e" : "#ef4444";
        ctx.fillRect(this.x - barW / 2, this.y - 25 * scale, barW * hpPct, 4 * scale);
        ctx.globalAlpha = 1.0;
    }
}
