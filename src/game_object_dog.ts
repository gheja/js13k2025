class GameObjectDog extends GameObject {
    constructor(y: number) {
        // start on the side farther away from the player
        var x = (game.currentScene.playerObject.x > 1920/2 ? -200 : 1920)

        super(x, y, null, 180, 140, 100, 80, GameObjectInteractionType.OverlapNonBlocking, InteractionParam.InstantFail)
        this.animations = [
            [ new GfxSprite(GFX_DOG_SNIFFING1_V1_1), new GfxSprite(GFX_DOG_SNIFFING2_V1_1) ]
        ]

        this.velocityX = (x == -200 ? 14 : -14)

        this.setActiveAnimationIndex(0)
    }

    physicsFrame() {
        if (_tick_count % 10 == 0)
        {
            this.setActiveSpriteIndex((this.activeSpriteIndex + 1) % this.sprites.length)
        }

        this.x += this.velocityX
    }
}
