class GameObject {
    sprites: Array<GfxSprite>
    activeSpriteIndex: number = 0
    x: number
    y: number
    velocityX: number = 0
    velocityY: number = 0
    boxWidth: number
    boxHeight: number
    boxOffsetX: number = 0
    boxOffsetY: number = 0
    interaction: GameObjectInteractionType = GameObjectInteractionType.None
    canFallThrough: boolean = true
    // these will limit the vertical movement of the player. different levels might require different values
    minX: number = 0
    maxX: number = 1920 - 200

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

        // flip
        this.sprites[this.activeSpriteIndex].svg.style.transform = (this.velocityX < 0 ? "scaleX(-1)" : "")
    }
}

class GameObjectPlayer extends GameObject {
    velocityX: number = 0
    velocityY: number = 0
    currentlyCollidingWith: GameObject
    state: PlayerState = PlayerState.InAir

    constructor(x: number, y: number) {
        super(x, y)
        this.sprites = [ new GfxSprite(GFX_PLAYER) ]
    }

    physicsFrame() {
        var inputs = game.getInputArray()

        // will disregard this one in this physicsFrame() run
        var ignoreCollidingWith = null


        if (this.currentlyCollidingWith)
        {
            if (this.currentlyCollidingWith.interaction == GameObjectInteractionType.SitOnTop ||
                this.currentlyCollidingWith.interaction == GameObjectInteractionType.GrabOnTop)
            {
                if (inputs[InputArrayKey.Up])
                {
                    // base jump speed + the running speed extra
                    this.velocityY -= PLAYER_JUMP_SPEED + Math.abs(this.velocityX) * PLAYER_JUMP_SPEED_EXTRA_MULTIPLIER
                    ignoreCollidingWith = this.currentlyCollidingWith
                }
                else if (this.currentlyCollidingWith.canFallThrough && inputs[InputArrayKey.Down])
                {
                    ignoreCollidingWith = this.currentlyCollidingWith
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
        this.state = PlayerState.InAir

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

                if (obj == ignoreCollidingWith)
                {
                    continue
                }

                var collided = false

                // NOTE: currently the collision check only works reliably when the player's box is smaller or equal to the other object's box,
                // because otherwise the top points might fall through on both side of the other object's box

                // only check when falling
                if (this.velocityY > 0) {
                    if (obj.interaction == GameObjectInteractionType.SitOnTop)
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
                    else if (obj.interaction == GameObjectInteractionType.GrabOnTop)
                    {
                        collided = boxesCollide(
                            nextX + this.boxOffsetX,
                            nextY + this.boxOffsetY,
                            this.boxWidth,
                            1,
                            obj.x + obj.boxOffsetX,
                            obj.y + obj.boxOffsetY,
                            obj.boxWidth,
                            1
                        )
                    }
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
                    this.state = PlayerState.Grabbing
                    this.velocityX = 0
                    nextX = this.x
                }
                else if (this.currentlyCollidingWith.interaction == GameObjectInteractionType.SitOnTop)
                {
                    this.state = PlayerState.OnTheFloor
                }
                this.velocityY = 0
                nextY = this.y
            }

            // don't leave the screen
            if (nextX < this.minX || nextX > this.maxX)
            {
                this.velocityX = 0
                nextX = this.x
            }

            
            this.x = nextX
            this.y = nextY
        }
    }
}
