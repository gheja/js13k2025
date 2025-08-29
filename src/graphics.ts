class Graphics {
    root: HTMLDivElement
    sprites: Array<GfxSprite>

    n: number

    constructor() {
        this.root = document.getElementById("c") as HTMLDivElement
        this.sprites = []
        this.sprites.push(new GfxSprite(this.root))
        this.n = 0
    }

    draw() {
        this.n += 1
        this.sprites[0].moveTo(500, 500 + Math.sin(this.n / 100) * 300)
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

class GfxSprite {
    svg: SVGElement

    constructor(root: HTMLDivElement) {
        // var str = '<?xml version="1.0" standalone="no"?><svg width="1920" height="1080" viewBox="0 0 1920 1080" version="1.1" xmlns="http://www.w3.org/2000/svg">' + 
        var str = '<svg width="1920" height="1080" viewBox="0 0 1920 1080" version="1.1" xmlns="http://www.w3.org/2000/svg">' + 
            TEST_SVG_SPRITE + 
            '</svg>'

        var parser = new DOMParser()
        this.svg = parser.parseFromString(str, "image/svg+xml").documentElement
        root.appendChild(this.svg)
        // root.innerHTML += "<g id=\"g1234\">" + TEST_SVG_SPRITE + "</g>"
    }

    moveTo(x: number, y: number){
        this.svg.style.left = (x * _gfx_scale + _gfx_pad_x) + "px"
        this.svg.style.top = (y * _gfx_scale + _gfx_pad_y) + "px"
        this.svg.style.width = (1920 * _gfx_scale) + "px"
        this.svg.style.height = (1080 * _gfx_scale) + "px"
    }
}
