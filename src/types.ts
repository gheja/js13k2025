type SvgInHtml = HTMLElement & SVGElement
enum GameObjectInteractionType {
    None = 1,
    SitOnTop,
    GrabOnTop,
    Player,
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
