class GameObjectTrashCat extends GameObject {
    startY: number
    stopY: number
    stepSize: number = 2

    constructor(x: number, y: number) {
        super(x, y, GFX_TRASH_CAT_V1_1, 70, 20, 0, 5, GameObjectInteractionType.OverlapNonBlocking, InteractionParam.TrashCatPush)
        this.startY = y
        this.stopY = y - this.stepSize * 20
    }

    popUp() {
        this.velocityY = -this.stepSize
        this.y += this.velocityY
    }

    physicsFrame() {

        if (this.y < this.stopY) {
            this.velocityY *= -1
        }

        if (this.y >= this.startY) {
            this.velocityY = 0
        }
        
        this.y += this.velocityY
    }
}
