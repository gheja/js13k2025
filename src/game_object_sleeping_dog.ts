class GameObjectSleepingDog extends GameObject {
    overlaySprites: Array<GfxSprite>
    bowlOverlaySprites: Array<GfxSprite>
    bowlTicksLeft: number = 360
    dogTicksUntilAwake: number = 210
    lastCollisionTickNumber: number = 0

    constructor(x: number, y: number) {
        super(x, y, GFX_DOG_SLEEPING_YOSHI_V3_1, 80, 120, 300, 0, GameObjectInteractionType.OverlapNonBlocking, InteractionParam.SleepingDogBowl)

        this.overlaySprites = [
            new GfxSprite(GFX_DOG_SLEEPING_YOSHI_V3_OVERLAY1_V1_1),
            new GfxSprite(GFX_DOG_SLEEPING_YOSHI_V3_OVERLAY2_V1_1),
            new GfxSprite(GFX_DOG_SLEEPING_YOSHI_V3_OVERLAY3_V1_1),
        ]

        this.bowlOverlaySprites = [
            new GfxSprite(GFX_DOG_BOWL_FOOD1_V1_1),
            new GfxSprite(GFX_DOG_BOWL_FOOD2_V1_1),
            new GfxSprite(GFX_DOG_BOWL_FOOD3_V1_1),
        ]
    }

    colliding() {
        // this might be called more than once per frame
        if (this.lastCollisionTickNumber == _tick_count) {
            return
        }

        this.lastCollisionTickNumber = _tick_count
        this.bowlTicksLeft -= 1
        this.dogTicksUntilAwake -= 2 // will increase in next physicsFrame() call
    }

    physicsFrame() {
        this.overlaySprites[0].moveAway()
        this.overlaySprites[1].moveAway()
        this.overlaySprites[2].moveAway()

        if (this.dogTicksUntilAwake > 120) {
            this.overlaySprites[0].moveTo(this.x, this.y)
        }
        else if (this.dogTicksUntilAwake > 60) {
            this.overlaySprites[1].moveTo(this.x, this.y)
        }
        else if (this.dogTicksUntilAwake > 0) {
            this.overlaySprites[2].moveTo(this.x, this.y)
        }



        this.bowlOverlaySprites[0].moveAway()
        this.bowlOverlaySprites[1].moveAway()
        this.bowlOverlaySprites[2].moveAway()

        if (this.bowlTicksLeft > 280) {
            this.bowlOverlaySprites[0].moveTo(this.x + 296, this.y + 56)
        }
        else if (this.bowlTicksLeft > 140) {
            this.bowlOverlaySprites[1].moveTo(this.x + 296, this.y + 56)
        }
        else if (this.bowlTicksLeft > 0) {
            this.bowlOverlaySprites[2].moveTo(this.x + 296, this.y + 56)
        }

        this.dogTicksUntilAwake = Math.max(Math.min(this.dogTicksUntilAwake + 1, 210), 0)
    }

    cleanupSprites() {
        for (var sprite of this.sprites.concat(this.overlaySprites).concat(this.bowlOverlaySprites)) {
            sprite.cleanup()
        }
    }
}
