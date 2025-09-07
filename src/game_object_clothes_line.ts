class GameObjectClothesLine extends GameObject {
    clothes: Array<GameObject> = []
    mice: Array<GameObjectMouse> = []
    moveLeft: number = 0

    constructor(y: number, objectsArray: Array<GameObject>, chance: number=0.4) {
        var obj
        super(0, y, GFX_CLOTHES_LINE_V1_1)
        for (var x=CLOTHES_MIN_X; x<CLOTHES_MAX_X; x+=70)
        {
            if (Math.random() <= chance)
            {
                obj = new GameObject(x, y, arrayPick([
                    GFX_CLOTH_SMALL1_V1_1, GFX_CLOTH_SMALL1_V1_1,
                    GFX_CLOTH_SMALL2_V1_1,
                    GFX_CLOTH_SMALL3_V1_1,
                    GFX_CLOTH_SMALL4_V1_1,
                    GFX_CLOTH_SMALL5_V1_1, GFX_CLOTH_SMALL5_V1_1,
                    GFX_CLOTH_SMALL6_V1_1, GFX_CLOTH_SMALL6_V1_1,
                ]) , 70, 70)
                obj.interaction = GameObjectInteractionType.GrabOnTop

                this.clothes.push(obj)
                objectsArray.push(obj)
            }
        }
        obj = new GameObjectMouse(1000, y - 38)
        // obj.interaction = GameObjectInteractionType.GrabOnTop

        this.mice.push(obj)
        objectsArray.push(obj)
    }

    physicsFrame() {
        var n = 0

        if (this.moveLeft < 0)
        {
            n = CLOTHES_STEP_SIZE
        }
        else if (this.moveLeft > 0)
        {
            n = -CLOTHES_STEP_SIZE
        }
        else
        {
            if (Math.random() < CLOTHES_STEP_CHANCE)
            {
                this.moveLeft = ((Math.random() < 0.5) ? -1 : 1) * (CLOTHES_STEP_SIZE * CLOTHES_STEP_COUNT)
            }
        }

        this.moveLeft += n

        var player = (game.scenes[0].playerObject as GameObjectPlayer)

        this.x += n

        if (this.x < -300 || this.x > -100)
        {
            this.x = -200
        }

        for (var obj of this.clothes)
        {
            obj.x += n

            // if player is grabbing this cloth, and is not too close to the edge of the screen, then pull them along!
            if (player.currentlyCollidingWith == obj &&
                ((n < 0 && player.x > player.minX + 5) || (n > 0 && player.x < player.maxX - 5)))
            {
                player.x += n
            }

            if (obj.x < CLOTHES_MIN_X)
            {
                obj.x += CLOTHES_MAX_X + -CLOTHES_MIN_X
            }
            else if (obj.x > CLOTHES_MAX_X)
            {
                obj.x -= CLOTHES_MAX_X + -CLOTHES_MIN_X
            }
        }

        for (var obj2 of this.mice)
        {
            obj2.x += n
            obj2.targetX += n
        }
    }
}
