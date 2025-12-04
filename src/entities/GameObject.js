export class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isDead = false;
    }

    update(dt) {
        // To be implemented by subclasses
    }

    draw(ctx) {
        // To be implemented by subclasses
    }
}
