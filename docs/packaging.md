# Packaging

BushScript produces the following distributable artifacts:

## `bsh.exe` (Windows)

Built with `src/build_windows.sh` using QuickJS, compiled to C via
`qjsc.exe`, then linked statically with `gcc` and `windres`.

## `bsh` (Linux)

Built with `src/build_linux.sh` using QuickJS, compiled to C via
`qjsc`, then linked statically with `gcc`.

## RPM

`bushscript.spec` defines the RPM package. It installs:

- `/usr/bin/bsh` — the binary
- `/usr/share/bushscript/std/` — the JavaScript stdlib
- Documentation under `/usr/share/doc/bushscript/`

Build with:

```bash
rpmbuild -ba bushscript.spec
```

## AppImage (optional)

An AppImage build is available if useful for Linux distribution. It is
not built by default — enable it when needed.

> **Note:** Builds are not run automatically here. QuickJS is required
> to compile BushScript; see the build scripts for the expected layout.
