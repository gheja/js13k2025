var game: Game

var _tick_count = 0

var _gfx_pad_x = 0
var _gfx_pad_y = 0
var _gfx_scale = 1.0

var _gfx_root: HTMLDivElement = null

function init() {
    game = new Game()
    game.init()
    game.start()
}

window.addEventListener("load", init)
