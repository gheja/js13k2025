class GameObjectBroom extends GameObject {
    constructor(x: number, y: number) {
        super(x, y, null, 70, 70, 25, 305, GameObjectInteractionType.OverlapNonBlocking, InteractionParam.BroomKick)
        this.animations = [
//            [ new GfxSprite(GFX_BROOM_MIDDLE_V1_1) ],
            [ new GfxSprite(GFX_BROOM_MIDDLE_V1_1), new GfxSprite(GFX_BROOM_MOVING_V1_1), new GfxSprite(GFX_BROOM_MIDDLE_V1_1), new GfxSprite(GFX_BROOM_MOVING_V1_1) ],
        ]
        this.pickDestination()
        this.setActiveAnimationIndex(0)
    }

    pickDestination() {
        var distance
        var minDistance = 10000
        var targetObj = game.currentScene.playerObject

        function distQuick(a: GameObject, b: GameObject) {
            // Manhatten distance, not actual, because it is quicker and shorter
            return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
        }

        for (var obj of game.currentScene.objects) {
            if (obj instanceof GameObjectFootprint) {
                if (obj.level > 0) {
                    distance = distQuick(this, obj)
                    if (distance < minDistance) {
                        minDistance = distance
                        targetObj = obj
                    }
                }
            }
        }

        // NOTE: this is not accurate, it considers the axes separately
        this.velocityX = Math.min(Math.max(targetObj.x - 30 - this.x, -5), 5)
        this.velocityY = Math.min(Math.max(targetObj.y - 340 - this.y, -5), 5)
    }

    physicsFrame() {
        if (_tick_count % 10 == 0)
        {
            this.setActiveSpriteIndex((this.activeSpriteIndex + 1) % this.sprites.length)
            this.spriteFlipFlip = (this.activeSpriteIndex > 1)
        }

        if (_tick_count % 10 == 0) {
            this.pickDestination()
        }

        this.x += this.velocityX
        this.y += this.velocityY
    }
}
