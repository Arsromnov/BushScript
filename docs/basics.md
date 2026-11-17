# basics of BushScript

<details>
<summary>variables and methods</summary>

```text
let x = 1
```
> declare the variable x (value: 1)

```text
loc x = 1
```
> declare the local variable x (value: 1)

```text
let x = getScriptArg 1
```
bsh test.bsh --file
`let x = std.getScriptArg 1` (it be "test.bsh")
> arguments support

```text
let x = readLine <text>
let x = readLine "pls write your name"
```
> input

</details>

<details>
<summary>log</summary>

```text
log "some text"
```
> the command print some text to CLI

```text
log x
log "hello" x
```

</details>

<details>
<summary>operators</summary>

```text
goto <line number>
goto 1
```
> goto

```text
if <condition>
  log "true"
else
  log "false"
end
```
> if/else

```text
exit <exiting code>
exit 0
```
> exit

</details>

<details>
<summary>other</summary>

```text
let x = std.read()
-- x = "6"
toNumber x
-- x = 6
```
> to number function

```text
--comment
```
> comments

</details>


<details>
<summary>functions and imports</summary>

```text
fn <name>(<param>,<param>)
  <source>
  return
end --can be used as return
```
> function

```text
import "<dir/filename>"
import "lib/utils.bsh"
```
> import fn from other file

</details>

## official modules

<details> 
<summary>Str-utils</summary>

```import "std/str-utils.js"```

```let x = trim x        --trim method
   let x = toLower x     --to lowercase method
   let x = toUpper x     --to uppercase method
   let x = startsWith x "#"    --method to check starting with char, return true/false
   let x = endsWith x "#"    --method to check ending with char, return true/false
   let x = includes x "#"   --method to check includes char, return true/false



```
</details>

<details>
<summary>Math</summary>

```import "std/math.js"```

```text
let x = math.calc <num> + <num>   --math operations (supported: +  -  /  *)
let x = math.randomInt <minNum> <maxNum> --generating int
let x = math.random --random
```
> random
</details>

<details>
<summary>BushscriptFileSystem (BFS)</summary>

```import "std/bfs.js"```

```text



let x = bfs.readFileAsString hello.txt     -- x: <file value>
let x = bfs.cwd     --x: <current dir>
let x = bfs.realpath <file>  --x: <<file> path>


bfs.addToFile "hello world" -- append the value to file
bfs.writeToFIle "hello world" --changing value of file

bfs.remove "main.txt" --deleting the file/dir(if empty)
bfs.rename "main.txt" "newName.txt" --renaming the file




```
</details>


## also check 

[how to create library and use it](library.md)
