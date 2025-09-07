class GameObjectMouse extends GameObject {
    public targetX: number

    constructor(x: number, y: number) {
        super(x, y, null, 70, 70)
        this.interaction = GameObjectInteractionType.OverlapNonBlocking

        this.animations = [
            [ new GfxSprite(GFX_MOUSE_IDLE_V1_1) ],
            [ new GfxSprite(GFX_MOUSE_RUN_V1_1) ]
        ]

        this.setActiveAnimationIndex(0)
    }

    pickDestination() {
        var a = Math.random()
        if (a < 0.5)
        {
            this.targetX = this.x
        }
        else if (a < 0.7)
        {
            this.targetX = this.x + 500
        }
        else if (a < 0.9)
        {
            this.targetX = this.x - 500
        }
    }

    setFree() {
        this.interaction = GameObjectInteractionType.OverlapNonBlocking
        this.setActiveAnimationIndex(1)
        this.pickDestination()
    }

    physicsFrame() {
        if (_tick_count % 60 == 0) {
            this.pickDestination()
        }

        if (this.x < CLOTHES_MIN_X)
        {
            this.x += CLOTHES_MAX_X + -CLOTHES_MIN_X
            this.targetX += CLOTHES_MAX_X + -CLOTHES_MIN_X
        }
        else if (this.x > CLOTHES_MAX_X)
        {
            this.x -= CLOTHES_MAX_X + -CLOTHES_MIN_X
            this.targetX -= CLOTHES_MAX_X + -CLOTHES_MIN_X
        }

        // just the sign is important because of the automatic update of spriteFlipped
        this.velocityX = this.targetX - this.x

        if (this.targetX - this.x > 8)
        {
            this.x += 8
            this.setActiveAnimationIndex(1)
        }
        else if (this.targetX - this.x < -8)
        {
            this.x -= 8
            this.setActiveAnimationIndex(1)
        }
        else
        {
            this.setActiveAnimationIndex(0)
        }
    }
}
