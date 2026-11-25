# Basics

BushScript syntax reference.

## Variables

Declare a global variable:

```text
let x = 1
```

Declare a local variable (inside a function):

```text
loc x = 1
```

Read input:

```text
let x = readLine "write your name"
```

Get a script argument:

```text
let x = getScriptArg 1
```

## Output

Print text to the CLI:

```text
log "hello world"
log x
log "hello" x
```

## Flow control

### `goto`

Jump to a line number:

```text
goto 5
```

### `if` / `else`

```text
if x == 1
  log "true"
else
  log "false"
end
```

### `while`

```text
while x < 10
  log x
  let x = x + 1
end
```

### `exit`

Exit with a code:

```text
exit 0
```

## Other

Convert to number:

```text
toNumber x
```

Time:

```text
let x = time.currentISO
let x = time.currentUNIX
```

Comments:

```text
-- this is a comment
```

Increments (global variables only):

```text
x++     # +1
x--     # -1
```

## Functions

Define a function:

```text
fn greet(name)
  log "hello " name
end
```

Call a function:

```text
greet "world"
```

Return a value (can be used like a method):

```text
fn add(a, b)
  let c = a + b
  return c
end

let r = add 2 3
log r
```

## Imports

Import functions from another `.bsh` file:

```text
import "lib/utils.bsh"
```

Import a JavaScript std module:

```text
import "std/math.js"
```

## Modules

See the module reference:

- [Math](./modules/math.html)
- [Str-utils](./modules/str-utils.html)
- [JSON](./modules/json.html)
- [BFS (filesystem)](./modules/bfs.html)
