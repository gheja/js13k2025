class Game {
    private gfx: Graphics
    private lastTickTime: number
    public triesLeft: number
    private lastPhysicsTickTime: number
    public objects: Array<GameObject> = []
    private keyPressed: Array<boolean> = []
    private transitionOverlayObject: GameObject
    private transitionTargetSceneIndex: number
    private transitionPauseTicksLeft: number

    public scenes: Array<any> = []
    public currentScene: any
    public currentSceneIndex: number
    public currentPaletteIndex: number = 0

    processStreetWindowTicks: number = 0 // to count the interval of the windows opening - will reset to a value if there is no window available

    scrollMinLimit: number = 0 // changes with unlocked levels, [ 0, 700 ]
    scrollMaxLimit: number = 0 // no change

    completedLevelCount: number = 0
    playing: boolean = false // a flag to make sure we don't double-process a level result (I don't have time now to debug why it happens sometime (eg. eel))

    constructor(){
        this.lastTickTime = performance.now()
        this.lastPhysicsTickTime = performance.now()
    }

    init() {
        _gfx_root = document.getElementById("c") as HTMLDivElement
        this.gfx = new Graphics()
        this.triesLeft = 5

        this.switchSceneTo(0)

        // must be on top
        this.transitionOverlayObject = new GameObject(0, 2000, GFX_TRANSITION_OVERLAY) // NOTE: anything other than 2000 will result in a transition
        this.transitionOverlayObject.sprites[0].svg.style.zIndex = "500"

        window.addEventListener("keydown", this.inputEvent.bind(this))
        window.addEventListener("keyup", this.inputEvent.bind(this))
    }

    beginTransition(targetSceneIndex: number, transitionPauseTicks: number = 0) {
        this.playing = false
        this.transitionTargetSceneIndex = targetSceneIndex
        this.transitionOverlayObject.y = 1125
        this.transitionPauseTicksLeft = transitionPauseTicks
    }

    prepareCurrentScene(sceneIndex: number) {
        if (sceneIndex != 0)
        {
            // always re-create the scene
            // BUG, TODO: this might still leave some DOM objects which might lead to memory leak. check if there any is left
            if (this.scenes[sceneIndex])
            {
                this.wipeObjectsArray(this.scenes[sceneIndex].objects)
            }
        }

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

                // respawn the mice on the clothes lines
                if (obj2 instanceof GameObjectClothesLine)
                {
                    obj2.addMice()
                }
            }
        }
        else if (sceneIndex == SCENE_INDEX_BIRD_CAGE)
        {
            this.scenes[SCENE_INDEX_BIRD_CAGE] = this.createSceneRoom1()
        }
        else if (sceneIndex == SCENE_INDEX_FISH_ROOM)
        {
            this.scenes[SCENE_INDEX_FISH_ROOM] = this.createSceneFishRoom()
        }
        else if (sceneIndex == SCENE_INDEX_FISH_BOWL)
        {
            this.scenes[SCENE_INDEX_FISH_BOWL] = this.createSceneFishBowl()
        }
        else if (sceneIndex == SCENE_INDEX_SPIDER_ROOM)
        {
            this.scenes[SCENE_INDEX_SPIDER_ROOM] = this.createSceneSpiderRoom()
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
            result.objects.push(new GameObject(x, 720, GFX_TABLE_V1_1, 200, 30, 40, 5, GameObjectInteractionType.SitOnTop))
        }

        for (var x of leftChairPositions)
        {
            // this is a separate stuff, because the svg can be flipped but the collision boxes can't

            // this only has the collision box for the top part
            result.objects.push(new GameObject(x, 650, GFX_CHAIR_V1_FLIPPED_1, 80, 30, 0, 50, GameObjectInteractionType.SitOnTop))

            // a separate invisible object for the collision box of the bottom part
            result.objects.push(new GameObject(x, 650, null, 200, 50, 50, 200, GameObjectInteractionType.SitOnTop))
        }

        for (var x of rightChairPositions)
        {
            // this only has the collision box for the top part
            result.objects.push(new GameObject(x, 650, GFX_CHAIR_V1_1, 80, 30, 200, 50, GameObjectInteractionType.SitOnTop))

            // a separate invisible object for the collision box of the bottom part
            result.objects.push(new GameObject(x, 650, null, 200, 50, 0, 200, GameObjectInteractionType.SitOnTop))
        }

        // x must be divisible by 70!
        for (var x=210; x<1920-200; x+= 70) {
            obj = new GameObjectFootprint(x, ROOM_FLOOR_POSITION - 20) as GameObjectFootprint
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

        obj = new GameObject(0, 1070, null, 1920, 10, 0, 0, GameObjectInteractionType.SitOnTop)
        obj.canFallThrough = false
        result.objects.push(obj)

        // top of the fence
        result.objects.push(new GameObject(0, FENCE_POSITION + 120, null, 1920, 10, 0, 0, GameObjectInteractionType.SitOnTop))

        for (var x=0; x<1920; x+=60)
        {
            result.objects.push(new GameObject(x, 670, arrayPick([ GFX_FENCE1_V1_1, GFX_FENCE2_V1_1, GFX_FENCE3_V1_1 ])))
        }

        result.objects.push(new GameObject(280, 800, GFX_TRASH_CAN_SHORT_V2_2))
        result.objects.push(new GameObject(280, 800, GFX_TRASH_CAN_SHORT_V2_1, 200, 160, 0, 100, GameObjectInteractionType.SitOnTop))

        result.objects.push(new GameObject(580, 750, GFX_TRASH_CAN_SHORT_V2_2))
        result.objects.push(new GameObject(580, 800, GFX_TRASH_CAN_TALL_V2_1, 200, 210, 0, 50, GameObjectInteractionType.SitOnTop))

        for (var x=70; x<1920; x+=370)
        {
            result.objects.push(new GameObjectWindow(x, 260 - 320*0, [SCENE_INDEX_BIRD_CAGE, SCENE_INDEX_FISH_ROOM], 0))
            result.objects.push(new GameObjectWindow(x, 260 - 320*1, [SCENE_INDEX_BIRD_CAGE, SCENE_INDEX_FISH_ROOM], 0))
            result.objects.push(new GameObjectWindow(x, 260 - 320*2, [SCENE_INDEX_SPIDER_ROOM], 1))
            result.objects.push(new GameObjectWindow(x, 260 - 320*3, [SCENE_INDEX_SPIDER_ROOM], 1))
        }


        result.objects.push(new GameObjectClothesLine(360 - 320*0, result.objects, 0.7, false, 0))
        result.objects.push(new GameObjectClothesLine(360 - 320*1, result.objects, 0.7, false, 0))
        result.objects.push(new GameObjectClothesLine(360 - 320*2, result.objects, 0.4, true, 1))
        result.objects.push(new GameObjectClothesLine(360 - 320*3, result.objects, 0.4, true, 1))


        obj = new GameObjectPlayer(50, 800)
        result.objects.push(obj)
        result.playerObject = obj

        result.objects.push(new GameObject(1920 - 770, 1080 - 860, GFX_STREET_LIGHT_1, 100, 40, 630, 0, GameObjectInteractionType.SitOnTop))

        this.addDebugToObjects(result.objects)

        return result
    }

    pickNewStreetWindow() {
        var a = []

        for (var obj of this.scenes[SCENE_INDEX_STREET].objects)
        {
            // pick a window that has valid targets and is currently visible
            // NOTE: the top left corner counts which is invisible and well above the window - calculate with that
            if (obj instanceof GameObjectWindow &&
                obj.possibleTargetSceneIndexes.length > 0 &&
                obj.y + _gfx_screen_scroll_y + 260 >= 0 &&
                obj.y + _gfx_screen_scroll_y + 260 <= 1080
            )
            {
                a.push(obj)
            }
        }

/*
        if (!IS_PROD_BUILD)
        {
            if (a.length == 0)
            {
                throw "No window can be picked!"
            }
        }
*/

        this.scenes[SCENE_INDEX_STREET].currentWindow = (a.length > 0 ? arrayPick(a) : null)
    }

    processStreetWindow() {
        this.processStreetWindowTicks += 1
        // NOTE: although the windows are closed when getting back to this scene, this counter does not stop, so it is possible that
        // a window will open very soon after returning to this scene - maybe the player will even enter this new window! but that's
        // fine and fun, so for now I keep this

        var a = this.processStreetWindowTicks % 300

        // TODO: fine-tune the timing, probably based on difficulty level. also, only pick window that is visible on the screen
        if (a == 120)
        {
            this.pickNewStreetWindow()

            if (!this.scenes[SCENE_INDEX_STREET].currentWindow)
            {
                // if we could not pick a window, retry it soon
                this.processStreetWindowTicks = 110
                return
            }

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
        result.objects.push(new GameObjectWindow(810, 200, [SCENE_INDEX_STREET], 2))

        obj = new GameObject(0, ROOM_FLOOR_POSITION, null, 1920, 10, 0, 0, GameObjectInteractionType.SitOnTop)
        obj.canFallThrough = false
        result.objects.push(obj)

        this.setupBasicRoom(result, [510], [260], [810])

        result.objects.push(new GameObjectBirdAndCage(560, 600, result.objects))
        result.objects.push(new GameObjectBookShelf(1200, 320, result.objects))

        result.objects.push(new GameObject(400, 100, GFX_CEILING_LAMP_V1_1, 64, 40, 244, 172, GameObjectInteractionType.GrabOnTop))
        result.objects.push(new GameObject(950, 450, GFX_STANDING_LAMP_V1_1, 64, 40, 138, 32, GameObjectInteractionType.GrabOnTop))
        result.objects.push(new GameObject(400, 400, GFX_PICTURE_ON_WALL_V1_1, 156, 100, 0, 60, GameObjectInteractionType.GrabOnTop))

        obj = new GameObjectPlayer(910, 500)
        result.objects.push(obj)
        result.playerObject = obj

        this.addDebugToObjects(result.objects)

        return result
    }


    // === room with the fish bowl ===

    createSceneFishRoom() {
        var result = {
            objects: [],
            scrollingEnabled: false,
            playerObject: null
        }

        var obj

        obj = new GameObject(0, ROOM_FLOOR_POSITION, null, 1920, 10, 0, 0, GameObjectInteractionType.SitOnTop)
        obj.canFallThrough = false
        result.objects.push(obj)

        result.objects.push(new GameObject(0, 0, GFX_ROOM_OVERLAY))
        result.objects.push(new GameObjectWindow(810, 200, [SCENE_INDEX_STREET], 2))

        this.setupBasicRoom(result, [810, 1400], [560], [1110])

        result.objects.push(new GameObject(250, 450, GFX_STANDING_LAMP_V1_1, 64, 40, 138, 32, GameObjectInteractionType.GrabOnTop))
        result.objects.push(new GameObject(1500, 650, GFX_FISH_BOWL_V1_1, 68, 20, 10, 3, GameObjectInteractionType.OverlapNonBlocking, InteractionParam.JumpToFishBowlScene))

        obj = new GameObjectPlayer(910, 500)
        result.objects.push(obj)
        result.playerObject = obj

        this.addDebugToObjects(result.objects)

        return result
    }


    // === fish bowl ===

    createSceneFishBowl() {
        var result = {
            objects: [],
            scrollingEnabled: false,
            playerObject: null,
            backgroundColor: "#4975a9",
        }

        var obj

        result.objects.push(new GameObjectFish(Math.random() * 1100 + 400, 350))
        result.objects.push(new GameObjectFish(Math.random() * 1100 + 400, 550))
        result.objects.push(new GameObjectFish(Math.random() * 1100 + 400, 750))
        result.objects.push(new GameObjectFish(Math.random() * 1100 + 400, 880))
        result.objects.push(new GameObjectFish(Math.random() * 1100 + 400, 910))

        result.objects.push(new GameObjectEel(800, 200))
        result.objects.push(new GameObjectEel(1000, 400))
        result.objects.push(new GameObjectEel(400, 700))
        result.objects.push(new GameObjectEel(1000, 800))
        result.objects.push(new GameObjectEel(600, 900))

        obj = new GameObjectPlayer(910, 40)
        obj.controlMode = PlayerControlMode.Swim
        obj.boxWidth = 50
        obj.boxHeight = 50
        obj.boxOffsetX = 20
        obj.boxOffsetY = 50
        result.objects.push(obj)
        result.playerObject = obj

        this.addDebugToObjects(result.objects)

        return result
    }

    fishBowlSceneFishEaten() {
        var fishCount = 0

        // check if there any fish left
        for (var obj of this.scenes[SCENE_INDEX_FISH_BOWL].objects)
        {
            if (obj instanceof GameObjectFish)
            {
                fishCount += 1
            }
        }

        // won!
        if (fishCount == 0)
        {
            this.sceneCompleted(SCENE_INDEX_FISH_ROOM)
            this.beginTransition(SCENE_INDEX_STREET, 0)
            return
        }

        // add a new eel, close to the player
        this.scenes[SCENE_INDEX_FISH_BOWL].objects.push(new GameObjectEel(Math.random() * 1500 + 200, 
            this.scenes[SCENE_INDEX_FISH_BOWL].playerObject.y + (Math.random() < 0.2 ? -250 : 250)
        ))
    }


    // === spider room
    createSceneSpiderRoom() {
        var result = {
            objects: [],
            scrollingEnabled: false,
            playerObject: null
        }

        var obj

        obj = new GameObject(0, ROOM_FLOOR_POSITION, null, 1920, 10, 0, 0, GameObjectInteractionType.SitOnTop)
        obj.canFallThrough = false
        result.objects.push(obj)

        result.objects.push(new GameObject(0, 0, GFX_ROOM_OVERLAY))
        result.objects.push(new GameObjectWindow(810, 200, [SCENE_INDEX_STREET], 2))


        this.setupBasicRoom(result, [510], [260], [810])

        result.objects.push(new GameObjectBookShelf(1200, 320, result.objects))
        result.objects.push(new GameObjectPushable(1220, 230, GFX_VASE_V1_1, 54, 90, 0, 0, GFX_VASE_BROKEN_V1_1, 2, 2, ROOM_FLOOR_POSITION))
        result.objects.push(new GameObjectPushable(1345, 230, GFX_VASE_V1_1, 54, 90, 0, 0, GFX_VASE_BROKEN_V1_1, 2, 2, ROOM_FLOOR_POSITION))
        result.objects.push(new GameObjectPushable(1470, 230, GFX_VASE_V1_1, 54, 90, 0, 0, GFX_VASE_BROKEN_V1_1, 2, 2, ROOM_FLOOR_POSITION))



        result.objects.push(new GameObject(400, 100, GFX_CEILING_LAMP_V1_1, 64, 40, 244, 172, GameObjectInteractionType.GrabOnTop))
        result.objects.push(new GameObject(400, 400, GFX_PICTURE_ON_WALL_V1_1, 156, 100, 0, 60, GameObjectInteractionType.GrabOnTop))

        obj = new GameObjectPlayer(910, 500)
        result.objects.push(obj)
        result.playerObject = obj

        // the spider should be on top of the cat - eek
        result.objects.push(new GameObjectSpider(1500, 100))

        this.addDebugToObjects(result.objects)

        return result
    }




    // ===

    objectWasJustBroken(obj: GameObject) {
        var left = 0

        if (this.currentSceneIndex == SCENE_INDEX_SPIDER_ROOM) {
            for (var obj of this.objects) {
                if (obj instanceof GameObjectPushable) {
                    if (obj.state != PushableObjectState.Broken) {
                        left += 1
                    }
                }
            }

            if (left == 0) {
                this.sceneCompleted(SCENE_INDEX_SPIDER_ROOM)
                this.beginTransition(SCENE_INDEX_STREET, 0)
            }
        }
    }

    sceneCompleted(n: number) {
        if (!this.playing) {
            return
        }

        for (var obj2 of this.scenes[SCENE_INDEX_STREET].objects)
        {
            if (obj2 instanceof GameObjectWindow)
            {
                obj2.removePossibleTargetSceneIndex(n)
            }
        }

        this.completedLevelCount += 1
    }

    applySceneCompletedChanges() {
        if (this.completedLevelCount == 1)
        {
            this.scrollMinLimit = 700
        }
        else if (this.completedLevelCount == 2)
        {
            this.currentPaletteIndex = 1
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

    updateHud() {
        document.getElementById("s").innerHTML = "Tries: " + this.triesLeft
        document.getElementById("t").innerHTML = "Completed: " + this.completedLevelCount + "/4"
    }

    switchSceneTo(sceneIndex: number) {
        for (var obj of this.objects)
        {
            (obj as GameObject).moveAway()
        }

        this.prepareCurrentScene(sceneIndex)

        this.currentSceneIndex = sceneIndex
        this.currentScene = this.scenes[sceneIndex]
        this.objects = this.scenes[sceneIndex].objects

        // this will unlock scrolling, set palette index, etc.
        this.applySceneCompletedChanges()

        // after updating the palette index, apply it
        this.gfx.applyPalette(this.currentPaletteIndex)

        // the scene might need another background color (i.e. fish bowl)
        if (this.currentScene.backgroundColor) {
            document.body.style.background = this.currentScene.backgroundColor
        }

        this.updateHud()

        this.playing = true
    }

    doTransition() {
        this.switchSceneTo(this.transitionTargetSceneIndex)
    }

    failedLevel() {
        if (!this.playing)
        {
            return
        }
        this.triesLeft -= 1
        this.beginTransition(SCENE_INDEX_STREET, 0)
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
        scrollMin = Math.min(scrollMin, this.scrollMinLimit)
        scrollMax = Math.max(scrollMax, this.scrollMaxLimit)

        _gfx_screen_scroll_y = Math.max(Math.min(_gfx_screen_scroll_y, scrollMax), scrollMin)

/*
        setDebugMessage(
            Math.round((this.currentScene.playerObject as GameObjectPlayer).y) + " " +
            Math.round(scrollMin) + " " +
            Math.round(scrollMax) + " " +
            Math.round(_gfx_screen_scroll_y)
        )
*/
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
