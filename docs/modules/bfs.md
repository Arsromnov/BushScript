# STD module - BushFileSystem

Import:

```text
import "std/bfs.js"
```

## Methods

| Method | Description |
|--------|-------------|
| `bfs.readFile(filename)` | Read a file's contents as a string |
| `bfs.cwd` | Current working directory |
| `bfs.realpath(path)` | Resolved absolute path |

## Commands

| Command | Description |
|---------|-------------|
| `bfs.append(filename, content)` | Append content to a file |
| `bfs.write(filename, content)` | Write (overwrite) a file |
| `bfs.remove(filename)` | Remove a file or empty directory |
| `bfs.rename(old, new)` | Rename a file |
| `bfs.mkdir(name)` | Create a directory |

## Examples

```text
import "std/bfs.js"
let content = bfs.readFile "hello.txt"
log content

bfs.write "out.txt" "hello world"
bfs.mkdir "newdir"
```

If a filesystem operation fails, the program exits with an error.
