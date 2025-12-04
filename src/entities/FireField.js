import { GameObject } from './GameObject.js';

export class FireField extends GameObject {
    constructor(x, y, color) {
        super(x, y);
        this.color = color;
        this.life = 5.0;
        this.size = 40;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) {
            this.isDead = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.2;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
