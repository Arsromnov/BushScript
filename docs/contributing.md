# Contributing

BushScript is developed with small, reviewable commits. Every distinct
change gets its own commit — no "version dump" commits.

## Commit style

Use prefixes so the history is readable:

- `Implement:` — new feature
- `FIX:` — bug fix
- `Refactor:` — internal restructure, no behavior change
- `Optimize:` — performance improvement
- `Build:` — build script or packaging change
- `Docs:` — documentation change
- `Release:` — tagging / release notes

## How to contribute

1. Fork the repository.
2. Create a branch from `main`.
3. Make your change in small, reviewable commits.
4. Open a pull request.

## Code structure

```
src/
  cli.js           # argument parsing, --version, --help
  vm.js            # VM lifecycle: load -> compile -> run
  main.js          # slim entry point
  state.js         # Context class (all mutable state)
  compiler/
    tokenizer.js   # parseLine, parseFnHeader
    imports.js     # loadJS, addImports, loadImports
    blocks.js      # buildBlocks (jump tables)
    index.js       # barrel export
  instr.js         # tree-walk interpreter (run(ctx))
  std/             # JavaScript standard library modules
  adapter/         # IO shim (future portability)
build_windows.sh   # Windows build
build_linux.sh     # Linux build
bushscript.spec    # RPM spec
docs/              # just-the-docs GitHub Pages site
```

## Syntax freeze

The `.bsh` language syntax does not change. Only internals, packaging,
and docs are reworked.
