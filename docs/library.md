# Libraries

You can write BushScript libraries in either `.bsh` (BushScript) or `.js`
(JavaScript, extending the language with new methods and commands).

## BushScript libraries

1. Create a folder (e.g. `lib/`) and place your `.bsh` files in it.
2. Define functions in the file — they can then be imported.
3. Import them in your code:

   ```text
   import "lib/utils.bsh"
   ```

## JavaScript libraries

1. Create a `.js` file (e.g. `lib/myutils.js`).
2. Export a default function that receives the `bsh` API:

   ```js
   export default function(bsh) {
     bsh.regMethod("myMethod", (arg) => {
       return arg.toUpperCase();
     });

     bsh.regCommand("myCommand", (arg) => {
       bsh.setVar(arg, "done", false);
     });
   }
   ```

3. Import and use it:

   ```text
   import "lib/myutils.js"
   let x = myMethod "hello"
   ```

## The `bsh` API

Available to JavaScript libraries:

| Method | Description |
|--------|-------------|
| `bsh.regMethod(name, fn)` | Register a method that returns a value (usable in `let x = ...`) |
| `bsh.regCommand(name, fn)` | Register a command (usable as a statement) |
| `setVar(name, value, isLocal)` | Set a variable (global or local) |
| `lookup(name)` | Look up a variable's value |
| `getStrType(token)` | Resolve a token to its value (variable, number, or string) |

See the std modules (`src/std/`) for working examples.
