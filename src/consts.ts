// the following will be replaced with true by the build process in prod builds
const IS_PROD_BUILD = false

// used in physics calculation
const TARGET_TICK_INTERVAL_MS = 1000 / 60
const GRAVITY = 11 // pixel/sec/sec
const FALL_GRAVITY = 22 // pixel/sec/sec
const PLAYER_JUMP_SPEED = 15
const PLAYER_JUMP_SPEED_EXTRA_MULTIPLIER = 0.25 // the jump height varies with the running speed. it will be multiplied with this number and added to the jump speed
const PLAYER_JUMP_BOOST_ABOVE_FENCE = 2 // on the fence and above player needs a bit bigger jump
const PLAYER_JUMP_BOOST_FROM_GRAB = 5 // from grab
const PLAYER_DRAG_MULTIPLIER = 0.85
const PLAYER_DRAG_CLAMP_TO_ZERO = 0.66

// used for checking the jump boost
const FENCE_POSITION = 560

const WINDOW_OPENING_POSITION_MIN = 0
const WINDOW_OPENING_POSITION_JUMPABLE = 60
const WINDOW_OPENING_POSITION_MAX = 180

const CLOTHES_STEP_SIZE = 4
const CLOTHES_STEP_COUNT = 40
const CLOTHES_STEP_CHANCE = 0.02
const CLOTHES_MIN_X = -210
const CLOTHES_MAX_X = 2130

// y coordinate of "floor"
const ROOM_FLOOR_POSITION = 1000
const BIRD_CAGE_CRASH_POSITION = ROOM_FLOOR_POSITION - 80

const PI = 3.14159

const SCENE_INDEX_STREET = 0
const SCENE_INDEX_BIRD_CAGE = 1
const SCENE_INDEX_FISH_ROOM = 2
const SCENE_INDEX_FISH_BOWL = 3
const SCENE_INDEX_SPIDER_ROOM = 4
const SCENE_INDEX_TITLE_SCREEN = 5
