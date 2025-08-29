class Game {
    private gfx: Graphics

    constructor(){

    }

    init() {
        this.gfx = new Graphics()
    }

    frame() {
        window.requestAnimationFrame(this.frame.bind(this))
        this.gfx.draw()
    }

    start() {
        this.frame()
    }
}
