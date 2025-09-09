class GameObjectBirdAndCage extends GameObject {
    bird: GameObjectBird
    state: BirdCageState = BirdCageState.Initial
    safeMinX: number
    safeMaxX: number

    constructor(x: number, y: number, objectsArray: Array<GameObject>) {
        super(x, y, GFX_BIRD_CAGE_V1_1, 120, 130, 0, 0, GameObjectInteractionType.OverlapNonBlocking)
        this.safeMinX = x - 50
        this.safeMaxX = x + 50

        this.bird = new GameObjectBird(0, 0)

        objectsArray.push(this.bird)

        // this should be in front of the bird
        this.sprites[0].svg.style.zIndex = "50"
    }

    syncBirdPosition() {
        this.bird.x = this.x + 15
        this.bird.y = this.y + 15
    }

    getPushed(x: number) {
        if (this.state != BirdCageState.Initial) {
            return
        }

        this.x += x
    }

    physicsFrame() {
        if (this.state == BirdCageState.Initial) {
            if (this.x < this.safeMinX || this.x > this.safeMaxX) {
                this.state = BirdCageState.Falling
                this.interaction = GameObjectInteractionType.None
            }
        }
        else if (this.state == BirdCageState.Falling) {
            this.applyGravity()

            this.y += this.velocityY

            if (this.y >= BIRD_CAGE_CRASH_POSITION)
            {
                this.state = BirdCageState.Crashed

                this.sprites[0].cleanup()
                this.sprites[0] = new GfxSprite(GFX_BIRD_CAGE_CRUSHED_V1_1)
                this.bird.setFree()
            }
        }

        if (this.state != BirdCageState.Crashed) {
            this.syncBirdPosition()
        }
    }
}
