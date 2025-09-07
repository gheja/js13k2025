class GameObjectBird extends GameObject {
    currentDirection: number
    
    constructor(x: number, y: number) {
        super(x, y, null, 70, 70)
        this.interaction = GameObjectInteractionType.None

        this.animations = [
            [ new GfxSprite(GFX_BIRD_SITTING_V1_1) ],
            [ new GfxSprite(GFX_BIRD_FLYING_V1_1), new GfxSprite(GFX_BIRD_FLYING_V1_2) ]
        ]

        this.setActiveAnimationIndex(0)
    }

    pickDestination() {
        this.currentDirection = Math.random() * 2 * PI
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

        // this check is not really great... the bird can get stuck in the corner
        if (this.x < 200 || this.x > 1920-200 || this.y < 200 || this.y > 1080-50)
        {
            this.currentDirection += PI / 2
        }

        if (_tick_count % 6 == 0)
        {
            this.setActiveSpriteIndex((this.activeSpriteIndex + 1) % this.sprites.length)
        }

        this.x += Math.cos(this.currentDirection) * 10
        this.y += Math.sin(this.currentDirection) * 10
    }
}
