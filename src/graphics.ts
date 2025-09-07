class Graphics {
    constructor() {
        window.addEventListener("resize", this.updateGfxScale.bind(this))
        this.updateGfxScale()
    }

    update() {
    }

    draw() {
    }

    updateGfxScale() {
        if (window.innerWidth / window.innerHeight < 16 / 9) {
            // bars on top and bottom
            _gfx_scale = window.innerWidth / 1920
            _gfx_pad_x = 0
            _gfx_pad_y = Math.floor((window.innerHeight - _gfx_scale * 1080) / 2)
        }
        else {
            // bars on left and right (or exact scale)
            _gfx_scale = window.innerHeight / 1080
            _gfx_pad_x = Math.floor((window.innerWidth - _gfx_scale * 1920) / 2)
            _gfx_pad_y = 0
        }
    }
}
