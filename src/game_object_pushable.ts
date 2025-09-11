class GameObjectPushable extends GameObject {
    bird: GameObjectBird
    state: PushableObjectState = PushableObjectState.Initial
    safeMinX: number
    safeMaxX: number
    breakPosition: number
    brokenSpriteData: any

    constructor(x: number, y: number, baseSpriteData: any, boxWidth: number, boxHeight: number, boxOffsetX: number, boxOffsetY: number,
        brokenSpriteData: any, safeLeft: number, safeRight: number, breakPosition: number
    ){
        super(x, y, baseSpriteData, boxWidth, boxHeight, boxOffsetX, boxOffsetY, GameObjectInteractionType.OverlapNonBlocking)

        this.safeMinX = x - safeLeft
        this.safeMaxX = x + safeRight
        this.brokenSpriteData = brokenSpriteData
        this.breakPosition = breakPosition
    }

    getPushed(x: number) {
        if (this.state != PushableObjectState.Initial) {
            return
        }

        this.x += x
    }

    wasJustBroken() {
        //
    }

    handlePushable() {
        if (this.state == PushableObjectState.Initial) {
            if (this.x < this.safeMinX || this.x > this.safeMaxX) {
                this.state = PushableObjectState.Falling
                this.interaction = GameObjectInteractionType.None
            }
        }
        else if (this.state == PushableObjectState.Falling) {
            this.applyGravity()

            this.y += this.velocityY

            if (this.y >= this.breakPosition)
            {
                this.state = PushableObjectState.Broken

                this.sprites[0].cleanup()
                this.sprites[0] = new GfxSprite(this.brokenSpriteData)
                this.wasJustBroken()
            }
        }
    }

    physicsFrame() {
        this.handlePushable()
    }
}
