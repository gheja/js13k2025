function pointInBox(ax: number, ay: number, bx1: number, by1: number, bx2: number, by2: number) {
    return (ax >= bx1 && ax <= bx2 && ay >= by1 && ay <= by2)
}

// NOTE: this does not handle well if "b" box is inside of the "a", but we
// start without overlap and physics will step by half pixel increments, so
// we should never see a case where one box just "jumps into" the other
function boxesCollide(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
    return pointInBox(ax,      ay,      bx, by, bx + bw, by + bh) ||
           pointInBox(ax + aw, ay,      bx, by, bx + bw, by + bh) ||
           pointInBox(ax + aw, ay + ah, bx, by, bx + bw, by + bh) ||
           pointInBox(ax,      ay + ah, bx, by, bx + bw, by + bh)
}

function arrayPick(arr: Array<any>) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function dragAndClamp(speed: number, speedMin: number, speedMax: number, dragMultiplier: number, dragClampToZero: number) {
    speed = Math.min(Math.max(speed, speedMin), speedMax) * dragMultiplier
    
    if (Math.abs(speed) < dragClampToZero) {
        return 0
    }

    return speed
}

function quickBroomDistance(broom: GameObject, obj: GameObject) {
    // Manhatten distance, not actual, because it is quicker and shorter
    return Math.abs(obj.x - (broom.x + 30)) + Math.abs(obj.y - (broom.y + 340))
}
