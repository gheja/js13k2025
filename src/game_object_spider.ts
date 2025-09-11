class GameObjectSpider extends GameObject {
    constructor(x: number, y: number) {
        super(x, y, null, 66, 30, 0, 0, GameObjectInteractionType.OverlapNonBlocking, InteractionParam.InstantFail)
        this. animations = [
            [ new GfxSprite(GFX_SPIDER_CEILING_V2_1) ],
            [ new GfxSprite(GFX_SPIDER_V1_1) ],
        ]
    }

    physicsFrame() {
        var spiderBaseY = 100
        var targetVelocityX = 0
        var playerOffsetX = game.scenes[SCENE_INDEX_SPIDER_ROOM].playerObject.x - this.x

        this.velocityY = 0

        if (playerOffsetX < -10) {
            targetVelocityX = -3
        }
        else if (playerOffsetX > 10) {
            targetVelocityX = 3
        }

        // can only move to left-right when on the ceiling
        if (this.y == spiderBaseY)
        {
            this.velocityX = targetVelocityX
        }
        else
        {
            this.velocityX = 0
        }

        // if it is above the player, it can move up and down
        if (targetVelocityX == 0) {
            this.setActiveAnimationIndex(1)
            this.velocityY = 5
        }
        else if (this.y > spiderBaseY) {
            this.setActiveAnimationIndex(1)
            this.velocityY = -5
        }
        else {
            this.setActiveAnimationIndex(0)
        }

        this.x += this.velocityX
        this.y += this.velocityY
    }
}
