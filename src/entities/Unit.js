import { GameObject } from './GameObject.js';

export class Unit extends GameObject {
    constructor(x, y, hp) {
        super(x, y);
        this.hp = hp;
        this.maxHp = hp;
        this.bp = 0;
        this.blindTimer = 0;
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    update(dt) {
        if (this.blindTimer > 0) {
            this.blindTimer -= dt;
        }
    }
}
