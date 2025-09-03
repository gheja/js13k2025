class Game {
    private gfx: Graphics
    private lastTickTime: number
    private lastPhysicsTickTime: number
    public objects: Array<GameObject>
    private keyPressed: Array<boolean> = []

    constructor(){
        this.lastTickTime = performance.now()
        this.lastPhysicsTickTime = performance.now()
    }

    init() {
        _gfx_root = document.getElementById("c") as HTMLDivElement
        this.gfx = new Graphics()

        this.objects = []

        var obj

        obj = new GameObject(0, 0)
        obj.sprites.push(new GfxSprite(GFX_LANDSCAPE_V1_1))
        this.objects.push(obj)


        obj = new GameObject(0, 1070)
        obj.sprites.push(new GfxSprite(GFX_EMPTY))
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.boxWidth = 1920
        obj.boxHeight = 10
        obj.canFallThrough = false
        this.objects.push(obj)

        // top of the fence
        obj = new GameObject(0, 680)
        obj.sprites.push(new GfxSprite(GFX_EMPTY))
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.boxWidth = 1920
        obj.boxHeight = 10
        this.objects.push(obj)

        for (var x=0; x<1920; x+=60)
        {
            obj = new GameObject(x, 670)
            obj.sprites.push(new GfxSprite(arrayPick([ GFX_FENCE1_V1_1, GFX_FENCE2_V1_1, GFX_FENCE3_V1_1 ])))
            this.objects.push(obj)
        }




        obj = new GameObject(280, 800)
        obj.sprites.push(new GfxSprite(GFX_TRASH_CAN_SHORT_V2_2))
        this.objects.push(obj)

        obj = new GameObject(280, 800)
        obj.sprites.push(new GfxSprite(GFX_TRASH_CAN_SHORT_V2_1))
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.boxOffsetY = 100
        obj.boxWidth = 200
        obj.boxHeight = 160
        this.objects.push(obj)


        obj = new GameObject(580, 750)
        obj.sprites.push(new GfxSprite(GFX_TRASH_CAN_SHORT_V2_2))
        this.objects.push(obj)

        obj = new GameObject(580, 800)
        obj.sprites.push(new GfxSprite(GFX_TRASH_CAN_TALL_V2_1))
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.boxOffsetY = 50
        obj.boxWidth = 200
        obj.boxHeight = 210
        this.objects.push(obj)

        obj = new GameObject(580, 450)
        obj.sprites.push(new GfxSprite(GFX_CLOTH_SMALL1_V1_1))
        obj.interaction = GameObjectInteractionType.GrabOnTop
        obj.boxWidth = 70
        obj.boxHeight = 70
        this.objects.push(obj)

        obj = new GameObject(680, 450)
        obj.sprites.push(new GfxSprite(GFX_CLOTH_SMALL1_V1_1))
        obj.interaction = GameObjectInteractionType.GrabOnTop
        obj.boxWidth = 70
        obj.boxHeight = 70
        this.objects.push(obj)

        obj = new GameObject(750, 450)
        obj.sprites.push(new GfxSprite(GFX_CLOTH_SMALL1_V1_1))
        obj.interaction = GameObjectInteractionType.GrabOnTop
        obj.boxWidth = 70
        obj.boxHeight = 70
        this.objects.push(obj)

        obj = new GameObjectPlayer(50, 800)
        this.objects.push(obj)

        if (!IS_PROD_BUILD)
        {
            for (var obj2 of this.objects) {
                obj2.injectCollisionBox()
            }
        }

        window.addEventListener("keydown", this.inputEvent.bind(this))
        window.addEventListener("keyup", this.inputEvent.bind(this))
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
    }

    start() {
        this.renderFrame()
    }
}
