# BushScript

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
bsh --help      # show help
```

## Documentation

- [Basics / syntax](./basics.html) — variables, log, if/else, while, goto, functions, imports
- [Modules](./modules/math.html) — stdlib reference (math, str-utils, json, bfs)
- [Creating libraries](./library.html) — how to write `.bsh` and `.js` libraries
- [Packaging](./packaging.html) — how builds and packages are produced
- [Contributing](./contributing.html) — how to submit fixes and modules

## License

[MIT](./LICENSE)
