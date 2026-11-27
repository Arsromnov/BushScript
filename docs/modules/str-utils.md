# Str-utils module

Import:

```text
import "std/str-utils.js"
```

## Methods

| Method | Description |
|--------|-------------|
| `lenOf(a)` | Length of `a` as a string |
| `trim(a)` | Trim whitespace from `a` |
| `toLower(a)` | Lowercase `a` |
| `toUpper(a)` | Uppercase `a` |
| `startWith(a, b)` | Whether `a` starts with `b` |
| `endsWith(a, b)` | Whether `a` ends with `b` |
| `includes(a, b)` | Whether `a` includes `b` |
| `slice(a, from, to)` | Slice `a` from index `from` to `to` |
| `repeat(a, n)` | Repeat `a` `n` times |

## Examples

```text
import "std/str-utils.js"
let x = trim "  hello  "
let y = toUpper "hello"
log x   # hello
log y   # HELLO
```
