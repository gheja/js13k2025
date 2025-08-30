class Game {
    private gfx: Graphics
    private lastTickTime: number
    private lastPhysicsTickTime: number
    public objects: Array<GameObject>

    constructor(){
        this.lastTickTime = performance.now()
        this.lastPhysicsTickTime = performance.now()
    }

    init() {
        _gfx_root = document.getElementById("c") as HTMLDivElement
        this.gfx = new Graphics()

        this.objects = []

        var obj

        obj = new GameObjectPlayer(100, 100)
        this.objects.push(obj)

        obj = new GameObject(0, 1070)
        obj.sprites.push(new GfxSprite(GFX_FLOOR))
        obj.interaction = GameObjectInteractionType.SitOnTop
        obj.boxWidth = 1920
        obj.boxHeight = 10
        this.objects.push(obj)

        obj = new GameObject(600, 600)
        obj.sprites.push(new GfxSprite(GFX_TRASH_CAN))
        obj.interaction = GameObjectInteractionType.SitOnTop
        this.objects.push(obj)
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
