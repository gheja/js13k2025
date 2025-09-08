class GameObjectWindow extends GameObject {
    spriteTop: GfxSprite
    spriteWindow: GfxSprite
    spriteBelow: GfxSprite
    targetOpening: number = 0
    currentOpening: number = 0
    possibleTargetSceneIndexes: Array<number>

    constructor(x: number, y: number, possibleTargetSceneIndexes: Array<number>, typeIndex: number) {
        super(x, y, null, 160, 30, 70, 250)
        this.spriteBelow = new GfxSprite(typeIndex == 2 ? GFX_WINDOW_OPEN_V1_2: GFX_WINDOW_OPEN_V1_1)
        this.spriteWindow = new GfxSprite(typeIndex == 1 ? GFX_WINDOW_CLOSED_V1_2 : GFX_WINDOW_CLOSED_V1_1)
        this.spriteTop = new GfxSprite(GFX_WINDOW_FRAME_V1_1)
        this.possibleTargetSceneIndexes = possibleTargetSceneIndexes

        // the exit window should always be open
        if (possibleTargetSceneIndexes[0] == 0)
        {
            this.currentOpening = WINDOW_OPENING_POSITION_MAX
            this.targetOpening = WINDOW_OPENING_POSITION_MAX
        }

        // we don't need this
        this.sprites[0].cleanup()
    }

    removePossibleTargetSceneIndex(n: number) {
        this.possibleTargetSceneIndexes = this.possibleTargetSceneIndexes.filter(a => { return a != n })
    }

    injectCollisionBox()
    {
        if (IS_PROD_BUILD)
        {
            return
        }

        this.injectCollisionBoxSvg(this.spriteTop)
    }

    physicsFrame() {
        if (this.currentOpening < this.targetOpening)
        {
            this.currentOpening += 10
        }
        else if (this.currentOpening > this.targetOpening)
        {
            this.currentOpening -= 10
        }

        this.interaction = (this.currentOpening > WINDOW_OPENING_POSITION_JUMPABLE ? GameObjectInteractionType.OverlapNonBlocking : GameObjectInteractionType.None)
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

    cleanupSprites()
    {
        this.spriteBelow.cleanup()
        this.spriteWindow.cleanup()
        this.spriteTop.cleanup()
    }
}
