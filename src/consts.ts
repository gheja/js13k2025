// the following will be replaced with true by the build process in prod builds
var IS_PROD_BUILD = false

// used in physics calculation
var TARGET_TICK_INTERVAL_MS = 1000 / 60
var GRAVITY = 11 // pixel/sec/sec
var FALL_GRAVITY = 22 // pixel/sec/sec
var PLAYER_JUMP_SPEED = 15
var PLAYER_JUMP_SPEED_EXTRA_MULTIPLIER = 0.25 // the jump height varies with the running speed. it will be multiplied with this number and added to the jump speed
var PLAYER_DRAG_MULTIPLIER = 0.94
var PLAYER_DRAG_CLAMP_TO_ZERO = 0.66
