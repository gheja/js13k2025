class GameObjectEel extends GameObject {
    targetX: number = 0

    constructor(x: number, y: number) {
        super(x, y, null, 110, 25, 0, 0, GameObjectInteractionType.OverlapNonBlocking)

        this.animations = [
            [ new GfxSprite(GFX_ELECTRIC_EEL_V1_1), new GfxSprite(GFX_ELECTRIC_EEL_V1_2), new GfxSprite(GFX_ELECTRIC_EEL_V1_3), new GfxSprite(GFX_ELECTRIC_EEL_V1_4) ],
        ]

        this.setActiveAnimationIndex(0)
        this.activeSpriteIndex = Math.floor(Math.random() * this.sprites.length)
        this.pickDestination()
    }

    pickDestination() {
        this.velocityX = (Math.random() < 0.5 ? -4 : 4)
    }

    physicsFrame() {
        if (_tick_count % 180 == 0) {
            this.pickDestination()
        }

        this.x += this.velocityX

        if (this.x < 200 || this.x > 1920-200) {
            this.velocityX *= -1
        }

        if (_tick_count % 15 == 0)
        {
            this.setActiveSpriteIndex((this.activeSpriteIndex + 1) % this.sprites.length)
        }
    }
}
