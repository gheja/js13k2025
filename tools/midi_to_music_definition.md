```
        {
          "deltaTime": 0, // delta time since the last event
          "type": 9,      // 9 == key pressed
          "channel": 0,   // midi instrument
          "data": [
            60,           // key that is pressed
            64            // velocity (=volume)
          ]
        },
        {
          "deltaTime": 53, // delta time
          "type": 8,       // 8 == key released
          "channel": 0,    // midi instrument
          "data": [
            60,            // key that was released
            127            // ignore -- velocity (=volume)
          ]
        },
        {
          "deltaTime": 238,
          "type": 9,
          "channel": 0,
          "data": [
            59,
            64
          ]
        },
        {
          "deltaTime": 54,
          "type": 8,
          "channel": 0,
          "data": [
            59,
            127
          ]
        },
```

->

key on and key off events extracted (without velocity, etc.)

```
deltatimes = [0, 53, 238, 54]
keys = [60, 60, 59, 59]
```

->

simplified structure, similar data grouped for better ZIP compression

```
key_press_deltatimes = [0, 53+238]
keys = [ 60, 59 ]
lengths = [ 53, 54 ]
```

->

might round times a bit (53-54 -> 54), or event quantize to half/quarter notes
