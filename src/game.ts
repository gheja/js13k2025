class Game {
    private gfx: Graphics
    private lastTickTime: number
    private lastPhysicsTickTime: number
    public objects: Array<GameObject> = []
    private keyPressed: Array<boolean> = []
    private transitionOverlayObject: GameObject
    private transitionTargetSceneIndex: number

    private scenes: Array<any> = []

    constructor(){
        this.lastTickTime = performance.now()
        this.lastPhysicsTickTime = performance.now()
    }

    init() {
        _gfx_root = document.getElementById("c") as HTMLDivElement
        this.gfx = new Graphics()

        this.switchSceneTo(0)

        // must be on top
        this.transitionOverlayObject = new GameObject(0, 2000) // NOTE: anything other than 2000 will result in a transition
        this.transitionOverlayObject.sprites.push(new GfxSprite(GFX_TRANSITION_OVERLAY))
        this.transitionOverlayObject.sprites[0].svg.style.zIndex = "500"

        window.addEventListener("keydown", this.inputEvent.bind(this))
        window.addEventListener("keyup", this.inputEvent.bind(this))
    }

    beginTransition(targetSceneIndex) {
        this.transitionTargetSceneIndex = targetSceneIndex
        this.transitionOverlayObject.y = 1125
    }

    prepareCurrentScene(sceneIndex: number) {
        if (sceneIndex == 0)
        {
            // only create the scene once
            if (!this.scenes[0])
            {
                this.scenes[0] = this.createSceneStreet()
            }

            // close all the windows
            for (var obj2 of this.scenes[0].objects)
            {
                if (obj2 instanceof GameObjectWindow)
                {
                    obj2.targetOpening = 0
                    obj2.currentOpening = 0
                }
                if (obj2 instanceof GameObjectPlayer)
                {
                    obj2.velocityX = 0
                    obj2.velocityY = 0
                }
            }
        }
        else
        {
            // always create a new room
            // BUG, TODO: this does not clean up the SVGs in DOM, so effectively this leads to memory leak
            this.scenes[1] = this.createSceneRoom1()
        }
    }

    createSceneStreet() {
        var result = {
            objects: []
        }

        var obj

        // TODO: check if this needs to be rendered on top of the window masks
        obj = new GameObject(0, 0)
        obj.sprites.push(new GfxSprite(GFX_LANDSCAPE_V1_1))
        result.objects.push(obj)

        obj = new GameObject(0, 1070)
        obj.sprites.push(new GfxSprite(GFX_EMPTY))
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.boxWidth = 1920
        obj.boxHeight = 10
        obj.canFallThrough = false
        result.objects.push(obj)

        // top of the fence
        obj = new GameObject(0, FENCE_POSITION + 120)
        obj.sprites.push(new GfxSprite(GFX_EMPTY))
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.boxWidth = 1920
        obj.boxHeight = 10
        result.objects.push(obj)

        for (var x=0; x<1920; x+=60)
        {
            obj = new GameObject(x, 670)
            obj.sprites.push(new GfxSprite(arrayPick([ GFX_FENCE1_V1_1, GFX_FENCE2_V1_1, GFX_FENCE3_V1_1 ])))
            result.objects.push(obj)
        }




        obj = new GameObject(280, 800)
        obj.sprites.push(new GfxSprite(GFX_TRASH_CAN_SHORT_V2_2))
        result.objects.push(obj)

        obj = new GameObject(280, 800)
        obj.sprites.push(new GfxSprite(GFX_TRASH_CAN_SHORT_V2_1))
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.boxOffsetY = 100
        obj.boxWidth = 200
        obj.boxHeight = 160
        result.objects.push(obj)


        obj = new GameObject(580, 750)
        obj.sprites.push(new GfxSprite(GFX_TRASH_CAN_SHORT_V2_2))
        result.objects.push(obj)

        obj = new GameObject(580, 800)
        obj.sprites.push(new GfxSprite(GFX_TRASH_CAN_TALL_V2_1))
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.boxOffsetY = 50
        obj.boxWidth = 200
        obj.boxHeight = 210
        result.objects.push(obj)


        for (var x=70; x<1920; x+=370)
        {
            obj = new GameObjectWindow(x, 260)
            obj.boxWidth = 160
            obj.boxHeight = 30
            obj.boxOffsetX = 70
            obj.boxOffsetY = 250
            obj.targetSceneIndex = 1
            obj.debug1()
            result.objects.push(obj)

            obj = new GameObjectWindow(x, -40)
            obj.boxWidth = 160
            obj.boxHeight = 30
            obj.boxOffsetX = 70
            obj.boxOffsetY = 250
            obj.targetSceneIndex = 1
            obj.debug1()
            result.objects.push(obj)
        }


        obj = new GameObject(580, 360)
        obj.sprites.push(new GfxSprite(GFX_CLOTH_SMALL1_V1_1))
        obj.interaction = GameObjectInteractionType.GrabOnTop
        obj.boxWidth = 70
        obj.boxHeight = 70
        result.objects.push(obj)

        obj = new GameObject(680, 360)
        obj.sprites.push(new GfxSprite(GFX_CLOTH_SMALL1_V1_1))
        obj.interaction = GameObjectInteractionType.GrabOnTop
        obj.boxWidth = 70
        obj.boxHeight = 70
        result.objects.push(obj)

        obj = new GameObject(750, 360)
        obj.sprites.push(new GfxSprite(GFX_CLOTH_SMALL1_V1_1))
        obj.interaction = GameObjectInteractionType.GrabOnTop
        obj.boxWidth = 70
        obj.boxHeight = 70
        result.objects.push(obj)


        obj = new GameObject(750, 40)
        obj.sprites.push(new GfxSprite(GFX_CLOTH_SMALL1_V1_1))
        obj.interaction = GameObjectInteractionType.GrabOnTop
        obj.boxWidth = 70
        obj.boxHeight = 70
        result.objects.push(obj)


        obj = new GameObjectPlayer(50, 800)
        result.objects.push(obj)

        return result
    }

    createSceneRoom1() {
        var result = {
            objects: []
        }

        var obj

        obj = new GameObject(0, 0)
        obj.sprites.push(new GfxSprite(GFX_ROOM_OVERLAY))
        result.objects.push(obj)

        obj = new GameObject(0, 1000)
        obj.sprites.push(new GfxSprite(GFX_EMPTY))
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.boxWidth = 1920
        obj.boxHeight = 10
        obj.canFallThrough = false
        result.objects.push(obj)

        obj = new GameObjectWindow(900, 200)
        obj.boxWidth = 160
        obj.boxHeight = 30
        obj.boxOffsetX = 70
        obj.boxOffsetY = 250
        obj.targetSceneIndex = 0
        obj.debug1()
        result.objects.push(obj)


        {
            obj = new GameObject(1200, 650)
            obj.sprites.push(new GfxSprite(GFX_CHAIR_V1_1))
            obj.interaction = GameObjectInteractionType.SitOnTop
            obj.boxWidth = 80
            obj.boxHeight = 30
            obj.boxOffsetX = 200
            obj.boxOffsetY = 50
            result.objects.push(obj)

            obj = new GameObject(1200, 650)
            obj.sprites.push(new GfxSprite(GFX_EMPTY))
            obj.interaction = GameObjectInteractionType.SitOnTop
            obj.boxWidth = 200
            obj.boxHeight = 50
            obj.boxOffsetY = 200
            result.objects.push(obj)
        }

        obj = new GameObjectPlayer(1000, 500)
        result.objects.push(obj)

        return result
    }

    switchSceneTo(sceneIndex: number) {
        for (var obj of this.objects)
        {
            (obj as GameObject).moveAway()
        }

        console.log("scene", sceneIndex)

        this.prepareCurrentScene(sceneIndex)

        this.objects = this.scenes[sceneIndex].objects
    }

    doTransition() {
        this.switchSceneTo(this.transitionTargetSceneIndex)
    }

    getInputArray() {
        return [
            this.keyPressed["aarrowup"] || this.keyPressed['akeyw'],
            this.keyPressed["aarrowright"] || this.keyPressed['akeyd'],
            this.keyPressed["aarrowdown"] || this.keyPressed['akeys'],
            this.keyPressed["aarrowleft"] || this.keyPressed['akeya'],
            this.keyPressed["aspace"],
            this.keyPressed["akeyq"],
        ]
    }

    inputEvent(e: KeyboardEvent) {
        // "keys" is a function on Array, so let's prefix it, so "KeyS".toLowerCase() won't be misinterpreted
        this.keyPressed["a" + e.code.toLowerCase()] = (e.type == "keydown")
    }

    physicsFrame(){
        _tick_count += 1
        this.gfx.update()

        // this will be the only thing done during this run
        if (this.transitionOverlayObject.y != 2000)
        {
            this.transitionOverlayObject.y -= 125
            this.transitionOverlayObject.physicsFrame()

            if (this.transitionOverlayObject.y == -1000)
            {
                this.doTransition()
            }

            if (this.transitionOverlayObject.y < -3080)
            {
                this.transitionOverlayObject.y = 2000
            }

            return
        }

        this.objects.forEach(a => a.physicsFrame())
    }

    renderFrame() {
        let now = performance.now()

        // NOTE: this is not actually needed, as the physics frames are guarenteed to be happening at a known rate
        // let dt = Math.min(now - this.lastTickTime, 1000) / 1000 // don't jump more than 1 second

        this.lastTickTime = now

        while (this.lastPhysicsTickTime + TARGET_TICK_INTERVAL_MS < now)
        {
            this.physicsFrame()
            this.lastPhysicsTickTime += TARGET_TICK_INTERVAL_MS
        }

        window.requestAnimationFrame(this.renderFrame.bind(this))

        this.objects.forEach(a => a.renderFrame())
        this.transitionOverlayObject.renderFrame()
    }

    start() {
        this.renderFrame()
    }
}
