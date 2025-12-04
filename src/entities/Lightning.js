import { GameObject } from './GameObject.js';

export class Lightning extends GameObject {
    constructor(x1, y1, x2, y2) {
        super(x1, y1);
        this.x2 = x2;
        this.y2 = y2;
        this.life = 0.2;
        this.segments = [];
        this.generateSegments();
    }

    generateSegments() {
        const dist = Math.sqrt(Math.pow(this.x2 - this.x, 2) + Math.pow(this.y2 - this.y, 2));
        const steps = Math.floor(dist / 10);
        let currX = this.x;
        let currY = this.y;
        for (let i = 0; i < steps; i++) {
            const t = (i + 1) / steps;
            const targetX = this.x + (this.x2 - this.x) * t;
            const targetY = this.y + (this.y2 - this.y) * t;
            const jitter = (Math.random() - 0.5) * 20;
            this.segments.push({ x1: currX, y1: currY, x2: targetX + jitter, y2: targetY + jitter });
            currX = targetX + jitter;
            currY = targetY + jitter;
        }
        this.segments.push({ x1: currX, y1: currY, x2: this.x2, y2: this.y2 });
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) {
            this.isDead = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffff00";
        ctx.globalAlpha = this.life * 5;
        ctx.beginPath();
        this.segments.forEach(s => {
            ctx.moveTo(s.x1, s.y1);
            ctx.lineTo(s.x2, s.y2);
        });
        ctx.stroke();
        ctx.restore();
    }
}
