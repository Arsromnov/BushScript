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
let x = math.calc <num> + <num>
let x = math.calc 1 + 1
```
> math operations

```text
let x = math.randomInt <minNum> <maxNum>
let x = math.random 0 1000
```
> random

```text
let x = std.getScriptArg 1
```
bsh test.bsh --file
`let x = std.getScriptArg 1` (it be "test.bsh")
> arguments support

```text
let x = std.read <your text>
let x = std.read "pls write your name"
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
toLowerCase <variable>
toLowerCase x

let x = "STR"
toLowerCase x
-- x value : str
```
> to lowercase function

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

## also check 

[how to create library and use it](library.md)
