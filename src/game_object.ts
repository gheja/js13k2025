class GameObject {
    sprites: Array<GfxSprite>
    activeSpriteIndex: number = 0
    x: number
    y: number
    boxWidth: number
    boxHeight: number
    boxOffsetX: number = 0
    boxOffsetY: number = 0
    interaction: GameObjectInteractionType = GameObjectInteractionType.None

    constructor(x: number, y: number){
        // this.sprites = [ new GfxSprite(TEST_GFX_DEFINITION_1) ]
        this.sprites = []
        this.x = x
        this.y = y
    }

    setActiveSpriteIndex(n: number) {
        this.activeSpriteIndex = n
        for (var sprite of this.sprites) {
            sprite.moveTo(5000, 5000)
        }
        // NOTE: the active sprite will be moved to the correct place by the next renderFrame() call
    }

    physicsFrame() {
        //
    }

    renderFrame() {
        this.sprites[this.activeSpriteIndex].moveTo(this.x, this.y)
    }
}

class GameObjectPlayer extends GameObject {
    velocityX: number = 0
    velocityY: number = 0

    constructor(x: number, y: number) {
        super(x, y)
        this.sprites = [ new GfxSprite(GFX_PLAYER) ]
    }

    physicsFrame() {
        this.velocityY += GRAVITY * 1/TARGET_TICK_INTERVAL_MS

        // collision checks
        // do it in small steps so we won't miss anything
        var steps = Math.max(Math.abs(this.velocityX), Math.abs(this.velocityY)) * 2
        var stepX = this.velocityX / steps
        var stepY = this.velocityY / steps
        var nextX, nextY
        var collidedWithObject = null
        for (var i=0; i<steps; i++)
        {
            nextX = this.x + stepX
            nextY = this.y + stepY

            for (var obj of game.objects)
            {
                if (obj.x + obj.boxOffsetX <= nextX &&
                    obj.x + obj.boxOffsetX + obj.boxWidth >= nextX &&
                    obj.y + obj.boxOffsetY <= nextY &&
                    obj.y + obj.boxOffsetY + obj.boxHeight >= nextY
                )
                {
                    collidedWithObject = obj
                    break
                }
            }

            if (collidedWithObject)
            {
                break
            }

            this.x = nextX
            this.y = nextY
        }

        if (collidedWithObject)
        {
            // console.log("collision", collidedWithObject)
            this.velocityX = 0
            this.velocityY = 0
        }
    }
}
