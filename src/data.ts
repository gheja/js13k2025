const SVG_STYLES = [
    "fill:#111;stroke:#333;stroke-width:5",
    "fill:#666",
]
/*
    definition: original_width, original_height, [ shape, shape, ... ]
    shape: [ style index,  x, y,  x, y,  x, y, ...]

    NOTE: the shape will be automatically closed, no need for the last point to match the first one
*/
const TEST_GFX_DEFINITION_1 = [
    300, 245, [
        [ // shape 1
            1, // style index
            6,16, 59,6, 92,33, 38,76, 41,41, 10,41 // coordinates
        ]
    ]
]

// just a box around the screen
const TEST_GFX_DEFINITION_BACKGROUND = [
    1920, 1080, [
        [
            0,
            0,0, 0,100, 100,100, 100,0
        ]
    ]
]

const GFX_PLAYER = [
    200, 50, [
        [
            1,
            0,0, 0,100, 100,100, 100,0
        ]
    ]
]

const GFX_FLOOR = [
    1920, 10, [
        [
            1,
            0,0, 0,100, 100,100, 100,0
        ]
    ]
]

const GFX_TRASH_CAN = [
    200, 300, [
        [
            1,
            0,0, 0,100, 100,100, 100,0
        ]
    ]
]

