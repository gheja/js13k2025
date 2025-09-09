class GameObjectFish extends GameObject {
    constructor(x: number, y: number) {
        super(x, y, GFX_FISH_V1_1, 60, 40)
        this.interaction = GameObjectInteractionType.OverlapNonBlocking
        this.pickDestination()
    }

    pickDestination() {
        this.velocityX = (Math.random() < 0.5 ? -3 : 3)
    }

    physicsFrame() {
        if (_tick_count % 300 == 0) {
            this.pickDestination()
        }

        this.x += this.velocityX

        if (this.x < 400 || this.x > 1920-400) {
            this.velocityX *= -1
        }
    }
}
