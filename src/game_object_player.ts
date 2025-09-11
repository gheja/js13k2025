class GameObjectPlayer extends GameObject {
    currentlyCollidingWith: GameObject
    state: PlayerState = PlayerState.InAir
    wasBittenByMouseCooldownTicks: number = 0 // to prevent catching the mouse that just bit the player
    controlMode: PlayerControlMode = PlayerControlMode.Platform

    lastFootprintX: number = 0

    constructor(x: number, y: number) {
        super(x, y, null, 60, 120, 30, 0)

        this.animations = [
            [ new GfxSprite(GFX_CAT_IDLE_V2_1) ],
            [ new GfxSprite(GFX_CAT_WALK_V2_1), new GfxSprite(GFX_CAT_WALK_V2_2), new GfxSprite(GFX_CAT_WALK_V2_3), new GfxSprite(GFX_CAT_WALK_V2_4) ],
            [ new GfxSprite(GFX_CAT_GRAB_V2_1) ],
            [ new GfxSprite(GFX_CAT_FALL_V1_1) ],
            [ new GfxSprite(GFX_CAT_JUMP_V4_1) ],
        ]

        // we don't need this sprite, but we need to clean it up right now, otherwise we will lose the reference to it and will lead to memory leak
        this.sprites[0].cleanup()

        this.sprites = this.animations[0]
    }

    handleFootprints() {
        var x = Math.round((this.x + 100) / 70) * 70

        // do nothing if not on the floor, or at the same position
        if (this.y < ROOM_FLOOR_POSITION - 120 - 5 || this.lastFootprintX == x)
        {
            return
        }
            
        this.lastFootprintX = x

        for (var obj of game.currentScene.objects) {
            if (obj instanceof GameObjectFootprint) {
                if (obj.x == x) {
                    obj.changeLevel(+1)
                }
            }
        }
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
        var maxVelocityX = 15
        var moving = inputs[InputArrayKey.Up] || inputs[InputArrayKey.Down] || inputs[InputArrayKey.Left] || inputs[InputArrayKey.Right]

        this.wasBittenByMouseCooldownTicks -= 1

        if (this.controlMode == PlayerControlMode.Platform)
        {
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

            this.applyGravity()
        }
        else // if (this.controlMode == PlayerControlMode.Swim)
        {
            if (inputs[InputArrayKey.Up])
            {
                this.velocityY += -1
            }
            else if (inputs[InputArrayKey.Down])
            {
                this.velocityY += +1
            }

            // limit the swimming speed
            maxVelocityX = 4

            // we only need to clamp the speed when swimming
            this.velocityY = dragAndClamp(this.velocityY, -4, 4, moving ? 1 : PLAYER_DRAG_MULTIPLIER, PLAYER_DRAG_CLAMP_TO_ZERO)
        }

        // we need vertical movement both when platforming and when swimming
        if (inputs[InputArrayKey.Left])
        {
            this.velocityX += -1
        }
        else if (inputs[InputArrayKey.Right])
        {
            this.velocityX += +1
        }

        this.velocityX = dragAndClamp(this.velocityX, -maxVelocityX, maxVelocityX, moving ? 1 : PLAYER_DRAG_MULTIPLIER, PLAYER_DRAG_CLAMP_TO_ZERO)

        setDebugMessage(this.velocityX.toFixed(2) + ", " + this.velocityY.toFixed(2))

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

            // only check collisions if the player is still on the screen (they can leave it only on the top side)
            // NOTE, BUG: if the window is tall, then the screen ratio is different, the player can see objects above the top side! fix it?!
            if (this.y > 0 - _gfx_screen_scroll_y)
            {
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
                            if (obj instanceof GameObjectWindow)
                            {
                                game.beginTransition(arrayPick((obj as GameObjectWindow).possibleTargetSceneIndexes))
                            }
                            else if (obj instanceof GameObjectPushable) // also GameObjectBirdAndCage
                            {
                                var n = 10
                                if (this.x >= obj.x)
                                {
                                    n = -10
                                }

                                (obj as GameObjectBirdAndCage).getPushed(n)

                                nextX -= n * 2
                                nextY -= 5
                                this.velocityX = 0
                            }
                            else if (obj instanceof GameObjectBird) {
                                var obj2 = new GameObject(obj.x - 150, obj.y - 50, GFX_TEXT_BUBBLE_YUM_V2_1)
                                game.objects.push(obj2)

                                game.sceneCompleted(SCENE_INDEX_BIRD_CAGE)
                                game.beginTransition(0, 30)

                                game.cleanupObject(obj)
                            }
                            else if (obj instanceof GameObjectMouse) {
                                // because we only handle the first collision this would make the cat let go of the cloth, but make sure
                                if (this.state == PlayerState.Grabbing)
                                {
                                    this.wasBittenByMouseCooldownTicks = 15
                                    ignoreCollidingWith = true
                                    break
                                }
                                else if (this.state == PlayerState.InAir && this.wasBittenByMouseCooldownTicks < 0)
                                {
                                    var obj2 = new GameObject(obj.x - 150, obj.y - 50, GFX_TEXT_BUBBLE_YUM_V2_1)
                                    obj2.autoDeleteTicksLeft = 30
                                    game.objects.push(obj2)
                                    
                                    game.cleanupObject(obj)
                                }
                            }
                            else if (obj.interactionParam1 == InteractionParam.JumpToFishBowlScene) {
                                game.beginTransition(SCENE_INDEX_FISH_BOWL, 0)
                            }
                            else if (obj.interactionParam1 == InteractionParam.InstantFail) {
                                // game.beginTransition(SCENE_INDEX_STREET, 0)
                                game.failedLevel()
                            }
                            else if (obj instanceof GameObjectFish) {
                                var obj2 = new GameObject(obj.x - 150, obj.y - 50, GFX_TEXT_BUBBLE_YUM_V2_1)
                                obj2.autoDeleteTicksLeft = 30
                                game.objects.push(obj2)
                                    
                                game.cleanupObject(obj)
                                game.fishBowlSceneFishEaten()
                            }
                        }
                    }

                    if (collided)
                    {
                        this.currentlyCollidingWith = obj
                        break
                    }
                }
            }

            if (ignoreCollidingWith)
            {
                this.currentlyCollidingWith = null
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

            this.handleFootprints()
        }

        // setDebugMessage(this.wasBittenByMouseCooldownTicks.toString())
    }
}
