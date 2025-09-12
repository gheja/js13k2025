class GameObjectBroom extends GameObject {
    private currentFootprintObj: GameObjectFootprint

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

        console.log("---")
        for (var obj of game.currentScene.objects) {
            if (obj instanceof GameObjectFootprint) {
                if (obj.level > 0) {
                    distance = quickBroomDistance(this, obj)
                    if (distance < minDistance) {
                        minDistance = distance
                        targetObj = obj
                        this.currentFootprintObj = obj
                    }
                }
            }
        }

        // NOTE: this is not accurate, it considers the axes separately
        this.velocityX = Math.min(Math.max(targetObj.x - (this.x + 30), -5), 5)
        this.velocityY = Math.min(Math.max(targetObj.y - (this.y + 340), -5), 5)
    }

    physicsFrame() {
        if (_tick_count % 10 == 0)
        {
            this.setActiveSpriteIndex((this.activeSpriteIndex + 1) % this.sprites.length)
            this.spriteFlipFlip = (this.activeSpriteIndex > 1)
            this.sprites[this.activeSpriteIndex].svg.style.zIndex = "100"
        }

        if (_tick_count % 10 == 0) {
            this.pickDestination()
        }

        if (_tick_count % 25 == 0) {
            if (this.currentFootprintObj && quickBroomDistance(this, this.currentFootprintObj) < 85) {
                this.currentFootprintObj.changeLevel(-1)
            }
        }

        this.x += this.velocityX
        this.y += this.velocityY
    }
}
