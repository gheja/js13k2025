class GameObjectBirdAndCage extends GameObjectPushable {
    bird: GameObjectBird

    constructor(x: number, y: number, objectsArray: Array<GameObject>) {
        super(x, y, GFX_BIRD_CAGE_V1_1, 120, 130, 0, 0, GFX_BIRD_CAGE_CRUSHED_V1_1, 50, 50, BIRD_CAGE_CRASH_POSITION)

        this.bird = new GameObjectBird(0, 0)

        objectsArray.push(this.bird)

        // this should be in front of the bird
        this.sprites[0].svg.style.zIndex = "50"
    }

    syncBirdPosition() {
        this.bird.x = this.x + 15
        this.bird.y = this.y + 15
    }

    wasJustBroken() {
        this.bird.setFree()
    }

    physicsFrame() {
        this.handlePushable()

        if (this.state != PushableObjectState.Broken) {
            this.syncBirdPosition()
        }
    }
}
