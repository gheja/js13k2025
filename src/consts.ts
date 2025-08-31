// used in physics calculation
var TARGET_TICK_INTERVAL_MS = 1000 / 60
var GRAVITY = 5 // pixel/sec/sec
var FALL_GRAVITY = 10 // pixel/sec/sec
var PLAYER_JUMP_SPEED = 15
var PLAYER_JUMP_SPEED_EXTRA_MULTIPLIER = 0.25 // the jump height varies with the running speed. it will be multiplied with this number and added to the jump speed
var PLAYER_DRAG_MULTIPLIER = 0.94
var PLAYER_DRAG_CLAMP_TO_ZERO = 0.66
