class GameObjectFootprint extends GameObject {
    level: number = 0

    constructor(x: number, y: number) {
        super(x, y, null, 70, 40, 0, 0, GameObjectInteractionType.None)
        this.animations = [
            [ new GfxSprite(GFX_EMPTY) ],
            [ new GfxSprite(GFX_FOOTPRINT_LEVEL1_V1_1) ],
            [ new GfxSprite(GFX_FOOTPRINT_LEVEL2_V1_1) ],
            [ new GfxSprite(GFX_FOOTPRINT_LEVEL3_V1_1) ],
            [ new GfxSprite(GFX_FOOTPRINT_LEVEL4_V1_1) ],
        ]
    }

    changeLevel(n: number) {
        this.level = Math.min(Math.max(this.level + n, 0), 4)
        this.setActiveAnimationIndex(this.level)
    }
}
