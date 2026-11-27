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

## Repo structure

```
docs/              # just-the-docs GitHub Pages site
  examples/ # Code examples
src/
  main.js # Entry point

  instr.js # Interpirator

  parser.js # tokenizer, import loader, block builder..

  state.js # shared state

  build_windows.sh # Windows build

  build_linux.sh  # Linux build

  std/ # STD Modules

  bin/ # Builded files
bushscript.spec    # RPM spec
            
```

