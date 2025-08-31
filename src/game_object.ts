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
    currentlyCollidingWith: GameObject

    constructor(x: number, y: number) {
        super(x, y)
        this.sprites = [ new GfxSprite(GFX_PLAYER) ]
    }

    physicsFrame() {
        var inputs = game.getInputArray()

        if (this.currentlyCollidingWith)
        {
            if (this.currentlyCollidingWith.interaction == GameObjectInteractionType.SitOnTop)
            {
                if (inputs[InputArrayKey.Up])
                {
                    // base jump speed + the running speed extra
                    this.velocityY -= PLAYER_JUMP_SPEED + Math.abs(this.velocityX) * PLAYER_JUMP_SPEED_EXTRA_MULTIPLIER
                }
            }
        }

        var a = this.velocityX

        if (inputs[InputArrayKey.Left])
        {
            a += -1
        }
        else if (inputs[InputArrayKey.Right])
        {
            a += +1
        }

        a = Math.min(Math.max(a, -15), 15)
        a = a * PLAYER_DRAG_MULTIPLIER
        if (Math.abs(a) <= PLAYER_DRAG_CLAMP_TO_ZERO)
        {
            a = 0
        }

        this.velocityX = a

        if (this.velocityY < 0) {
            this.velocityY += GRAVITY * 1/TARGET_TICK_INTERVAL_MS
        }
        else {
            this.velocityY += FALL_GRAVITY * 1/TARGET_TICK_INTERVAL_MS
        }

        // collision checks
        // do it in small steps so we won't miss anything
        var steps = Math.max(Math.abs(this.velocityX), Math.abs(this.velocityY)) * 2
        var stepX = this.velocityX / steps
        var stepY = this.velocityY / steps
        var nextX, nextY
        this.currentlyCollidingWith = null
        for (var i=0; i<steps; i++)
        {
            nextX = this.x + stepX
            nextY = this.y + stepY

            for (var obj of game.objects)
            {
                if (obj == this)
                {
                    continue
                }

                var collided = false

                // falling
                if (obj.interaction == GameObjectInteractionType.SitOnTop && this.velocityY > 0)
                {
                    collided = boxesCollide(
                        nextX + this.boxOffsetX,
                        nextY + this.boxOffsetY + this.boxHeight - 1,
                        this.boxWidth,
                        1,
                        obj.x + obj.boxOffsetX,
                        obj.y + obj.boxOffsetY,
                        obj.boxWidth,
                        1
                    )
                }

                if (collided)
                {
                    this.currentlyCollidingWith = obj
                    break
                }
            }

            // if (this.currentlyCollidingWith)
            // {
            //     break
            // }

            if (this.currentlyCollidingWith)
            {
                if (this.currentlyCollidingWith.interaction == GameObjectInteractionType.GrabOnTop)
                {
                    this.velocityX = 0
                    nextX = this.x
                }
                else if (this.currentlyCollidingWith.interaction == GameObjectInteractionType.SitOnTop)
                {
                    //
                }
                this.velocityY = 0
                nextY = this.y
            }
            
            this.x = nextX
            this.y = nextY
        }
    }
}
