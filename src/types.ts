type SvgInHtml = HTMLElement & SVGElement
enum GameObjectInteractionType {
    None = 1,
    SitOnTop,
    GrabOnTop,
    Player,
    OverlapNonBlocking,
}
enum InputArrayKey {
    Up = 0,
    Right,
    Down,
    Left,
    PrimaryAction,
    SecondaryAction,
}
enum PlayerState {
    OnTheFloor = 0,
    Grabbing,
    InAir,
}
enum BirdCageState {
    Initial = 0,
    Falling,
    Crashed
}
enum PlayerControlMode {
    Platform = 0,
    Swim
}
enum InteractionParam {
    None = 0,
    JumpToFishBowlScene,
    EelBite
}
