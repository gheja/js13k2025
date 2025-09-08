class Game {
    private gfx: Graphics
    private lastTickTime: number
    private lastPhysicsTickTime: number
    public objects: Array<GameObject> = []
    private keyPressed: Array<boolean> = []
    private transitionOverlayObject: GameObject
    private transitionTargetSceneIndex: number
    private transitionPauseTicksLeft: number

    public scenes: Array<any> = []
    public currentScene: any

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

    beginTransition(targetSceneIndex: number, transitionPauseTicks: number = 0) {
        this.transitionTargetSceneIndex = targetSceneIndex
        this.transitionOverlayObject.y = 1125
        this.transitionPauseTicksLeft = transitionPauseTicks
    }

    prepareCurrentScene(sceneIndex: number) {
        if (sceneIndex == 0)
        {
            // only create the scene once
            if (!this.scenes[SCENE_INDEX_STREET])
            {
                this.scenes[SCENE_INDEX_STREET] = this.createSceneStreet()
            }

            for (var obj2 of this.scenes[SCENE_INDEX_STREET].objects)
            {
                // close all the windows
                if (obj2 instanceof GameObjectWindow)
                {
                    obj2.targetOpening = 0
                    obj2.currentOpening = 0
                    // obj2.removePossibleScene(lastSceneIndex)
                }

                // stop the player (will fall down)
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
            if (this.scenes[SCENE_INDEX_BIRD_CAGE])
            {
                this.wipeObjectsArray(this.scenes[SCENE_INDEX_BIRD_CAGE].objects)
            }

            this.scenes[SCENE_INDEX_BIRD_CAGE] = this.createSceneRoom1()
        }
    }

/*
    switchToRandomScene(sceneIndexes: Array<number>) {

    }
*/

    wipeObjectsArray(objects: Array<GameObject>) {
        for (var i=objects.length-1; i>=0; i--)
        {
            objects[i].cleanupSprites()
            delete objects[i]
        }
    }

    setupBasicRoom(result: any, tablePositions: Array<number>, leftChairPositions: Array<number>, rightChairPositions: Array<number>) {
        var obj: GameObject

        for (var x of tablePositions)
        {
            obj = new GameObject(x, 720, GFX_TABLE_V1_1, 200, 30, 40, 5)
            obj.interaction = GameObjectInteractionType.SitOnTop
            result.objects.push(obj)
        }

        for (var x of leftChairPositions)
        {
            // this is a separate stuff, because the svg can be flipped but the collision boxes can't

            // this only has the collision box for the top part
            obj = new GameObject(x, 650, GFX_CHAIR_V1_FLIPPED_1, 80, 30, 0, 50)
            obj.interaction = GameObjectInteractionType.SitOnTop
            result.objects.push(obj)

            // a separate invisible object for the collision box of the bottom part
            obj = new GameObject(x, 650, null, 200, 50, 50, 200)
            obj.interaction = GameObjectInteractionType.SitOnTop
            result.objects.push(obj)
        }

        for (var x of rightChairPositions)
        {
            // this only has the collision box for the top part
            obj = new GameObject(x, 650, GFX_CHAIR_V1_1, 80, 30, 200, 50)
            obj.interaction = GameObjectInteractionType.SitOnTop
            result.objects.push(obj)

            // a separate invisible object for the collision box of the bottom part
            obj = new GameObject(x, 650, null, 200, 50, 0, 200)
            obj.interaction = GameObjectInteractionType.SitOnTop
            result.objects.push(obj)
        }
    }

    // === scene #0 stuffs ===

    createSceneStreet() {
        var result = {
            objects: [],
            playerObject: null,
            scrollingEnabled: true,
            currentWindow: null,
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
            result.objects.push(new GameObjectWindow(x, 260, [SCENE_INDEX_BIRD_CAGE]))
            result.objects.push(new GameObjectWindow(x, -40, [SCENE_INDEX_BIRD_CAGE]))
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

        for (var obj of this.scenes[SCENE_INDEX_STREET].objects)
        {
            if (obj instanceof GameObjectWindow && obj.possibleTargetSceneIndexes.length > 0)
            {
                a.push(obj)
            }
        }

        if (!IS_PROD_BUILD)
        {
            if (a.length == 0)
            {
                throw "No window can be picked!"
            }
        }

        this.scenes[SCENE_INDEX_STREET].currentWindow = arrayPick(a)
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
            this.scenes[SCENE_INDEX_STREET].currentWindow.targetOpening = WINDOW_OPENING_POSITION_MAX
        }
        else if (a == 130) {
            console.log("throw!")
            // throw something from window
        }
        else if (a == 299)
        {
            // close the window
            this.scenes[SCENE_INDEX_STREET].currentWindow.targetOpening = WINDOW_OPENING_POSITION_MIN
        }
    }


    // === scene #1 stuffs ===

    createSceneRoom1() {
        var result = {
            objects: [],
            scrollingEnabled: false,
            playerObject: null
        }

        var obj

        result.objects.push(new GameObject(0, 0, GFX_ROOM_OVERLAY))
        result.objects.push(new GameObjectWindow(810, 200, [SCENE_INDEX_STREET]))

        obj = new GameObject(0, 1000, null, 1920, 10)
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.canFallThrough = false
        result.objects.push(obj)

        this.setupBasicRoom(result, [510], [260], [810])

        result.objects.push(new GameObjectBirdAndCage(560, 600, result.objects))

        obj = new GameObjectPlayer(910, 500)
        result.objects.push(obj)
        result.playerObject = obj

        this.addDebugToObjects(result.objects)

        return result
    }


    // ===

    sceneCompleted(n: number) {
        for (var obj2 of this.scenes[SCENE_INDEX_STREET].objects)
        {
            if (obj2 instanceof GameObjectWindow)
            {
                obj2.removePossibleTargetSceneIndex(n)
            }
        }
    }

    cleanupObject(obj: GameObject) {
        obj.cleanupSprites()
        for (var i=this.objects.length-1; i>=0; i--) {
            if (this.objects[i] == obj) {
                this.objects.splice(i, 1)
            }
        }
    }

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

        this.prepareCurrentScene(sceneIndex)

        this.currentScene = this.scenes[sceneIndex]
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

    updateScreenScroll() {
        if (!this.currentScene.scrollingEnabled)
        {
            _gfx_screen_scroll_y = 0
            return
        }

        var scrollMin = - ((this.currentScene.playerObject as GameObjectPlayer).y - 200) // top
        var scrollMax = - ((this.currentScene.playerObject as GameObjectPlayer).y - 700) // bottom
        scrollMax = Math.max(scrollMax, 0)

        _gfx_screen_scroll_y = Math.max(Math.min(_gfx_screen_scroll_y, scrollMax), scrollMin)

        setDebugMessage(
            Math.round((this.currentScene.playerObject as GameObjectPlayer).y) + " " +
            Math.round(scrollMin) + " " +
            Math.round(scrollMax) + " " +
            Math.round(_gfx_screen_scroll_y)
        )
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
            // NOTE: this pause is only for giving a minimal time to the player to see a feedback of their interaction, and
            // unfortunately the transition sprite is already on the way (can be seen in the lower left corner), it might
            // worth some time sometime to fix this
            if (this.transitionPauseTicksLeft > 0) {
                this.transitionPauseTicksLeft -= 1
                return
            }

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

        this.objects.forEach(a => { a.processAutoDelete(); a.physicsFrame(); })
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

        this.updateScreenScroll()

        this.objects.forEach(a => a.renderFrame())
        this.transitionOverlayObject.renderFrame()
    }

    start() {
        this.renderFrame()
    }
}
