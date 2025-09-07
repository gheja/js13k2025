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

    constructor(x: number, y: number, baseSpriteData: any, boxWidth: number = 0, boxHeight: number = 0, boxOffsetX: number = 0, boxOffsetY: number = 0) {
        // this.sprites = [ new GfxSprite(TEST_GFX_DEFINITION_1) ]
        this.sprites = []
        this.x = x
        this.y = y
        this.boxWidth = boxWidth
        this.boxHeight = boxHeight
        this.boxOffsetX = boxOffsetX
        this.boxOffsetY = boxOffsetY
        this.sprites[0] = new GfxSprite(baseSpriteData || GFX_EMPTY)
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

    cleanupSprites() {
        var a: GfxSprite

        if (this.animations && this.animations.length > 0)
        {
            for (var animation of this.animations)
            {
                for (a of animation)
                {
                    a.cleanup()
                }
            }
        }
        else
        {
            for (a of this.sprites)
            {
                a.cleanup()
            }
        }
    }
}
