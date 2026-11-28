# BushScript - index docs page

A lightweight, embeddable scripting language with a simple syntax:
variables, `if`/`else`, `while` loops, `goto`, functions, and imports.
The standard library is written in JavaScript and can be extended.

## How to use

```bash
bsh yourfile.bsh
```

Flags:

```bash
bsh --version   # show version
```

## Documentation

- [Basics / syntax](./basics.md) — variables, log, if/else, while, goto, functions, imports
- [Modules](./modules/math.md) — stdlib reference (math, str-utils, json, bfs)
- [Creating libraries](./library.md) — how to write `.bsh` and `.js` libraries
- [Packaging](./packaging.md) — how builds and packages are produced
- [Contributing](./contributing.md) — how to submit fixes and modules

## License

[MIT](../LICENSE)
