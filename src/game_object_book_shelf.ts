class GameObjectBookShelf extends GameObject {
    constructor(x: number, y: number, objectsArray: Array<GameObject>) {
        super(x, y, GFX_BOOK_SHELF_V1_1)
        var obj
        for (var ax=0; ax<3; ax++)
        {
            for (var ay=0; ay<6; ay++)
            {
                objectsArray.push(new GameObject(x + 20 + ax * 100, y + 32 + ay * 100, arrayPick([GFX_BOOKS_V1_1, GFX_BOOKS_V1_1, GFX_BOOKS_V1_2, GFX_BOOKS_V1_2, GFX_BOOKS_V1_3]), 100, 70, 0, 0, GameObjectInteractionType.GrabOnTop))
            }
        }
    }
}
