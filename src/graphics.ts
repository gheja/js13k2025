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

class GfxSprite {
    originalWidth: number
    originalHeight: number
    svg: SvgInHtml

    constructor(data) {
        this.originalWidth = data[0]
        this.originalHeight = data[1]
        var arr: Array<number>

        var str = ""
        str += `<svg width="${this.originalWidth}" height="${this.originalHeight}" viewBox="0 0 ${this.originalWidth} ${this.originalHeight}" version="1.1" xmlns="http://www.w3.org/2000/svg">`

        for (var j=0; j<data[2].length; j++)
        {
            arr = data[2][j]

            var s = "M "
            // the first element is the style index
            for (var i=1; i<arr.length; i+=2){
                s += (arr[i] / 100 * this.originalWidth) + "," + (arr[i+1] / 100 * this.originalHeight) + " "
            }
            // this closes the shape, we don't need the final move back to the first point
            s += "Z"

            str += '<path style="' + SVG_STYLES[arr[0]] + '" d="' + s + '"/>'
        }

        str += '</svg>'

        var parser = new DOMParser()
        this.svg = parser.parseFromString(str, "image/svg+xml").documentElement as SvgInHtml
        _gfx_root.appendChild(this.svg)

        this.moveAway()
    }

    moveTo(x: number, y: number){
        this.svg.style.left = (x * _gfx_scale + _gfx_pad_x) + "px"
        this.svg.style.top = (y * _gfx_scale + _gfx_pad_y) + "px"
        // TODO: maybe we should only change the width and height when the window was rescaled
        // TODO: now the sprite position and scale is only updated when moveTo() is called
        this.svg.style.width = (this.originalWidth * _gfx_scale) + "px"
        this.svg.style.height = (this.originalHeight * _gfx_scale) + "px"
    }

    moveAway() {
        this.moveTo(10000, 10000)
    }

    cleanup() {
        this.svg.parentNode.removeChild(this.svg)
    }
}
