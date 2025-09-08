var game: Game

var _tick_count = 0

var _gfx_pad_x = 0
var _gfx_pad_y = 0
var _gfx_scale = 1.0

var _gfx_screen_scroll_y = 0

var _gfx_root: HTMLDivElement = null

    function setDebugMessage(s: string) {
        if (IS_PROD_BUILD) {
            return
        }
        document.getElementById("debug_messages").innerHTML = s
    }

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
