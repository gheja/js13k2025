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

var _firstInteractionDone = false
function checkFirstInteraction()
{
    if (_firstInteractionDone)
    {
        return
    }

    _firstInteractionDone = true
    startMusic()
}

window.addEventListener("load", init)
window.addEventListener("click", checkFirstInteraction)
