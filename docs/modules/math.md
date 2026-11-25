# Math module

Import:

```text
import "std/math.js"
```

## Methods

| Method | Description |
|--------|-------------|
| `math.random` | Returns a random float between 0 and 1 |
| `math.randomInt(min, max)` | Returns a random integer between `min` and `max` (inclusive) |
| `math.calc(a, op, b)` | Performs `a op b` where `op` is `+`, `-`, `*`, or `/` |

## Examples

```text
let x = math.random
let y = math.randomInt 1 10
let z = math.calc 10 + 5
log z   # 15
```

Division by zero exits with an error. Unknown operators exit with an error.
