class GameObject {
    sprites: Array<GfxSprite>
    activeSpriteIndex: number = 0
    x: number
    y: number
    velocityX: number = 0
    velocityY: number = 0
    boxWidth: number
    boxHeight: number
    boxOffsetX: number
    boxOffsetY: number
    interaction: GameObjectInteractionType = GameObjectInteractionType.None
    canFallThrough: boolean = true
    // these will limit the vertical movement of the player. different levels might require different values
    minX: number = 0
    maxX: number = 1920 - 120
    animations: Array<any>
    activeAnimationIndex: number = -1

    constructor(x: number, y: number, boxWidth: number = 0, boxHeight: number = 0, boxOffsetX: number = 0, boxOffsetY: number = 0) {
        // this.sprites = [ new GfxSprite(TEST_GFX_DEFINITION_1) ]
        this.sprites = []
        this.x = x
        this.y = y
        this.boxWidth = boxWidth
        this.boxHeight = boxHeight
        this.boxOffsetX = boxOffsetX
        this.boxOffsetY = boxOffsetY
    }

    injectCollisionBoxSvg(sprite: GfxSprite)
    {
        if (IS_PROD_BUILD)
        {
            return
        }

        var s = '<path style="fill:#0ff2;stroke:#0ffa;stroke-width:4" d="M ' +
            (this.boxOffsetX)                 + ',' + (this.boxOffsetY)                  + ' ' +
            (this.boxOffsetX + this.boxWidth) + ',' + (this.boxOffsetY)                  + ' ' +
            (this.boxOffsetX + this.boxWidth) + ',' + (this.boxOffsetY + this.boxHeight) + ' ' +
            (this.boxOffsetX)                 + ',' + (this.boxOffsetY + this.boxHeight) + ' ' +
            ' Z"/>'

        sprite.svg.innerHTML += s
    }

    injectCollisionBox()
    {
        // NOTE: this is only accurate in non-flipped sprites
        // NOTE: this might be cut of if the sprite is smaller than the box

        if (IS_PROD_BUILD)
        {
            return
        }

        if (this.animations && this.animations.length > 0)
        {
            for (var animation of this.animations)
            {
                for (var b of animation)
                {
                    this.injectCollisionBoxSvg(b)
                }
            }
        }
        else
        {
            for (var a of this.sprites)
            {
                this.injectCollisionBoxSvg(a)
            }
        }
    }

    setActiveSpriteIndex(n: number) {
        this.activeSpriteIndex = n
        for (var sprite of this.sprites) {
            sprite.moveAway()
        }
        // NOTE: the active sprite will be moved to the correct place by the next renderFrame() call
    }

    setActiveAnimationIndex(n: number)
    {
        if (this.activeAnimationIndex != n)
        {
            this.setActiveSpriteIndex(-1)
            this.sprites = this.animations[n]
            this.setActiveSpriteIndex(0)
            this.activeAnimationIndex = n
        }
    }

    physicsFrame() {
        //
    }

    renderFrame() {
        this.sprites[this.activeSpriteIndex].moveTo(this.x, this.y)

        // flip
        this.sprites[this.activeSpriteIndex].svg.style.transform = (this.velocityX < 0 ? "scaleX(-1)" : "")
    }

    moveAway() {
        if (this.sprites.length > this.activeSpriteIndex)
        {
            this.sprites[this.activeSpriteIndex].moveAway()
        }
    }
}

class GameObjectPlayer extends GameObject {
    currentlyCollidingWith: GameObject
    state: PlayerState = PlayerState.InAir

    constructor(x: number, y: number) {
        super(x, y, 60, 120, 30, 0)

        this.animations = [
            [ new GfxSprite(GFX_CAT_IDLE_V2_1) ],
            [ new GfxSprite(GFX_CAT_WALK_V2_1), new GfxSprite(GFX_CAT_WALK_V2_2), new GfxSprite(GFX_CAT_WALK_V2_3), new GfxSprite(GFX_CAT_WALK_V2_4) ],
            [ new GfxSprite(GFX_CAT_GRAB_V2_1) ],
            [ new GfxSprite(GFX_CAT_FALL_V1_1) ],
            [ new GfxSprite(GFX_CAT_JUMP_V4_1) ],
        ]
        this.sprites = this.animations[0]
    }

    physicsFrame() {
        if (this.state == PlayerState.Grabbing)
        {
            // grab
            this.setActiveAnimationIndex(2)
        }
        else if (this.state == PlayerState.InAir)
        {
            if (this.velocityY < 0)
            {
                if (Math.abs(this.velocityX) > 1)
                {
                    // jump
                    this.setActiveAnimationIndex(4)
                }
                else
                {
                    // grab
                    this.setActiveAnimationIndex(2)
                }
            }
            else
            {
                // fall
                this.setActiveAnimationIndex(3)
            }
        }
        else if (Math.abs(this.velocityX) > 0.9)
        {
            // walk
            this.setActiveAnimationIndex(1)
        }
        else
        {
            // idle (sitting)
            this.setActiveAnimationIndex(0)
        }

        if (_tick_count % 6 == 0)
        {
            this.setActiveSpriteIndex((this.activeSpriteIndex + 1) % this.sprites.length)
        }

        var inputs = game.getInputArray()

        // if set, will disregard all collison objects on this physicsFrame() run
        // (WAS: will disregard this one in this physicsFrame() run)
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
                    if (this.y < FENCE_POSITION)
                    {
                        this.velocityY -= PLAYER_JUMP_BOOST_ABOVE_FENCE
                    }
                    if (this.state == PlayerState.Grabbing)
                    {
                        this.velocityY -= PLAYER_JUMP_BOOST_FROM_GRAB
                    }
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

                // NOTE: this caused problem when there were multiple collisions on the same line (i.e. two clothes on clothesline, one under the left paw, one under the right)
                // if (obj == ignoreCollidingWith)

                if (ignoreCollidingWith)
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

                // check in any state, but only if there was no other collision
                if (!collided && obj.interaction == GameObjectInteractionType.OverlapNonBlocking)
                {
                    collided = boxesCollide(
                        nextX + this.boxOffsetX,
                        nextY + this.boxOffsetY,
                        this.boxWidth,
                        this.boxHeight,
                        obj.x + obj.boxOffsetX,
                        obj.y + obj.boxOffsetY,
                        obj.boxWidth,
                        obj.boxHeight
                    )

                    if (collided)
                    {
                        game.beginTransition((obj as GameObjectWindow).targetSceneIndex)
                        // console.log(_tick_count, "!")
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

            if (this.currentlyCollidingWith && this.currentlyCollidingWith.interaction != GameObjectInteractionType.OverlapNonBlocking)
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

class GameObjectWindow extends GameObject {
    spriteTop: GfxSprite
    spriteWindow: GfxSprite
    spriteBelow: GfxSprite
    targetOpening: number = 0
    currentOpening: number = 0
    targetSceneIndex: number

    constructor(x: number, y: number, targetSceneIndex: number = 0) {
        super(x, y, 160, 30, 70, 250)
        this.spriteBelow = new GfxSprite(GFX_WINDOW_OPEN_V1_1)
        this.spriteWindow = new GfxSprite(GFX_WINDOW_CLOSED_V1_1)
        this.spriteTop = new GfxSprite(GFX_WINDOW_FRAME_V1_1)
        this.targetSceneIndex = targetSceneIndex
    }

    debug1()
    {
        this.injectCollisionBoxSvg(this.spriteTop)
    }

    physicsFrame() {
        if (Math.random() < 0.02)
        {
            if (this.targetOpening == 0)
            {
                this.targetOpening = 180
            }
            else
            {
                this.targetOpening = 0
            }
        }

        if (this.currentOpening < this.targetOpening)
        {
            this.currentOpening += 10
        }
        else if (this.currentOpening > this.targetOpening)
        {
            this.currentOpening -= 10
        }

        this.interaction = (this.currentOpening > 60 ? GameObjectInteractionType.OverlapNonBlocking : GameObjectInteractionType.None)
    }

    moveAway() {
        this.spriteBelow.moveAway()
        this.spriteWindow.moveAway()
        this.spriteTop.moveAway()
    }

    renderFrame() {
        this.spriteBelow.moveTo(this.x, this.y)
        this.spriteWindow.moveTo(this.x, this.y - this.currentOpening)
        this.spriteTop.moveTo(this.x, this.y)
    }
}
