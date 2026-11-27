# JSON module

Import:

```text
import "std/json.js"
```

## Methods / Commands

| Name | Type | Description |
|------|------|-------------|
| `json.GetParam(file, param)` | Method | Reads a param from a JSON file |
| `json.SetParam(file, param, value)` | Command | Writes a param to a JSON file |

## Examples

```text
import "std/json.js"
let val = json.GetParam "config.json" "port"
log val

json.SetParam "config.json" "port" 8080
```

If the file cannot be opened or the JSON cannot be parsed, the program
exits with an error.
