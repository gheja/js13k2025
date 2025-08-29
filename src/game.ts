class Game {
    private gfx: Graphics

    constructor(){

    }

    init() {
        this.gfx = new Graphics()
        window.addEventListener("resize", this.gfx.updateGfxScale.bind(this.gfx))
        this.gfx.updateGfxScale()
    }

    frame() {
        window.requestAnimationFrame(this.frame.bind(this))
        this.gfx.draw()
    }

    start() {
        this.frame()
    }
}
