class Game {
    private gfx: Graphics
    private lastTickTime: number
    private lastPhysicsTickTime: number
    public objects: Array<GameObject> = []
    private keyPressed: Array<boolean> = []
    private transitionOverlayObject: GameObject
    private transitionTargetSceneIndex: number

    public scenes: Array<any> = []

    constructor(){
        this.lastTickTime = performance.now()
        this.lastPhysicsTickTime = performance.now()
    }

    init() {
        _gfx_root = document.getElementById("c") as HTMLDivElement
        this.gfx = new Graphics()

        this.switchSceneTo(0)

        // must be on top
        this.transitionOverlayObject = new GameObject(0, 2000, GFX_TRANSITION_OVERLAY) // NOTE: anything other than 2000 will result in a transition
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
            if (this.scenes[1])
            {
                this.wipeObjectsArray(this.scenes[1].objects)
            }

            this.scenes[1] = this.createSceneRoom1()
        }
    }

    wipeObjectsArray(objects: Array<GameObject>) {
        for (var i=objects.length-1; i>=0; i--)
        {
            objects[i].cleanupSprites()
            delete objects[i]
        }
    }

    // === scene #0 stuffs ===

    createSceneStreet() {
        var result = {
            objects: [],
            currentWindow: null,
            playerObject: null,
        }

        var obj

        // TODO: check if this needs to be rendered on top of the window masks
        result.objects.push(new GameObject(0, 0, GFX_LANDSCAPE_V1_1))

        obj = new GameObject(0, 1070, null, 1920, 10)
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.canFallThrough = false
        result.objects.push(obj)

        // top of the fence
        obj = new GameObject(0, FENCE_POSITION + 120, null, 1920, 10)
        obj.interaction = GameObjectInteractionType.SitOnTop
        result.objects.push(obj)

        for (var x=0; x<1920; x+=60)
        {
            result.objects.push(new GameObject(x, 670, arrayPick([ GFX_FENCE1_V1_1, GFX_FENCE2_V1_1, GFX_FENCE3_V1_1 ])))
        }




        result.objects.push(new GameObject(280, 800, GFX_TRASH_CAN_SHORT_V2_2))
        
        obj = new GameObject(280, 800, GFX_TRASH_CAN_SHORT_V2_1, 200, 160, 0, 100)
        obj.interaction = GameObjectInteractionType.SitOnTop
        result.objects.push(obj)


        result.objects.push(new GameObject(580, 750, GFX_TRASH_CAN_SHORT_V2_2))

        obj = new GameObject(580, 800, GFX_TRASH_CAN_TALL_V2_1, 200, 210, 0, 50)
        obj.interaction = GameObjectInteractionType.SitOnTop
        result.objects.push(obj)


        for (var x=70; x<1920; x+=370)
        {
            result.objects.push(new GameObjectWindow(x, 260, 1))
            result.objects.push(new GameObjectWindow(x, -40, 1))
        }


        result.objects.push(new GameObjectClothesLine(360, result.objects))
        result.objects.push(new GameObjectClothesLine(40, result.objects))


        obj = new GameObjectPlayer(50, 800)
        result.objects.push(obj)
        result.playerObject = obj

        this.addDebugToObjects(result.objects)

        return result
    }

    pickNewStreetWindow() {
        var a = []

        for (var obj of this.scenes[0].objects)
        {
            if (obj instanceof GameObjectWindow)
            {
                a.push(obj)
            }
        }

        this.scenes[0].currentWindow = arrayPick(a)
    }

    processStreetWindow() {
        // NOTE: although the windows are closed when getting back to this scene, this counter does not stop, so it is possible that
        // a window will open very soon after returning to this scene - maybe the player will even enter this new window! but that's
        // fine and fun, so for now I keep this
        var a = _tick_count % 300

        // TODO: fine-tune the timing, probably based on difficulty level. also, only pick window that is visible on the screen
        if (a == 120)
        {
            this.pickNewStreetWindow()

            // open the window
            this.scenes[0].currentWindow.targetOpening = WINDOW_OPENING_POSITION_MAX
        }
        else if (a == 130) {
            console.log("throw!")
            // throw something from window
        }
        else if (a == 299)
        {
            // close the window
            this.scenes[0].currentWindow.targetOpening = WINDOW_OPENING_POSITION_MIN
        }
    }


    // === scene #1 stuffs ===

    createSceneRoom1() {
        var result = {
            objects: []
        }

        var obj

        result.objects.push(new GameObject(0, 0, GFX_ROOM_OVERLAY))
        result.objects.push(new GameObjectWindow(810, 200, 0))

        obj = new GameObject(0, 1000, null, 1920, 10)
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.canFallThrough = false
        result.objects.push(obj)

        // chair
        {
            // this only has the collision box for the top part
            obj = new GameObject(1110, 650, GFX_CHAIR_V1_1, 80, 30, 200, 50)
            obj.interaction = GameObjectInteractionType.SitOnTop
            result.objects.push(obj)

            // a separate invisible object for the collision box of the bottom part
            obj = new GameObject(1110, 650, null, 200, 50, 0, 200)
            obj.interaction = GameObjectInteractionType.SitOnTop
            result.objects.push(obj)
        }

        // chair
        {
            // this is a separate stuff, because the svg can be flipped but the collision boxes can't

            // this only has the collision box for the top part
            obj = new GameObject(560, 650, GFX_CHAIR_V1_FLIPPED_1, 80, 30, 0, 50)
            obj.interaction = GameObjectInteractionType.SitOnTop
            result.objects.push(obj)

            // a separate invisible object for the collision box of the bottom part
            obj = new GameObject(560, 650, null, 200, 50, 50, 200)
            obj.interaction = GameObjectInteractionType.SitOnTop
            result.objects.push(obj)
        }

        obj = new GameObject(810, 720, GFX_TABLE_V1_1, 200, 30, 40, 5)
        obj.interaction = GameObjectInteractionType.SitOnTop
        result.objects.push(obj)

        result.objects.push(new GameObjectPlayer(910, 500))

        this.addDebugToObjects(result.objects)

        return result
    }


    // ===

    addDebugToObjects(arr: Array<GameObject>)
    {
        if (IS_PROD_BUILD)
        {
            return
        }

        for (var obj of arr)
        {
            obj.injectCollisionBox()
        }
    }

    switchSceneTo(sceneIndex: number) {
        for (var obj of this.objects)
        {
            (obj as GameObject).moveAway()
        }

        // console.log("scene", sceneIndex)

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

        if (true) { // TODO: check scene index
            this.processStreetWindow()
        }

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
