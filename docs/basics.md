# basics of BushScript


<details> 
    <summary> variables and methods </summary>

`let x = 1`

>declare the variable x (value: 1)

`loc x = 1`

>declare the local variable x (value: 1)


`let x = math.calc <num> + <num>`

`let x = math.calc 1 + 1`

>math operations

`let x = math.randomInt <minNum> <maxNum>`

`let x = math.random 0 1000`

>random

`let x = std.getScriptArg 1`

bsh test.bsh --file

`let x = std.getScriptArg 1` (it be "test.bsh")

>arguments support

`let x = std.read <your text>`

`let x = std.read "pls write your name"`

> input
</details>

<details> 
    <summary> log </summary>
    ## chapter 2 :: log and math operations

`log "some text"`

>the command print some text to CLI

`log x`

`log "hello" x`

</details>

<details>
    <summary> operators </summary>

`goto <line number>`
`goto 1`

>goto 

`if <condition> `

`log "true"` if the condition is true

`else `

`log "false"` if the condition is false

`end`
> if/else

`exit <exiting code>`
`exit 0`

> exit
</details>


<details> 
    <summary> other </summary>

`toLowerCase <variable>`

`toLowerCase x`

`let x = "STR"`

`toLowerCase x`

`-- x value : str`

>to lowercase function

`let x = std.read()`

`-- x = "6"`

`toNumber x`

`-- x = 6`

>to number function

`--comment`

> comments

</details>

<details>
    <summary> functions and imports </summary>

`fn <name>(<param>,<param>) `

`   <source>                `

`    return                 `

`end --can be used as return`

> function

`import "<dir/filename>`
`import "lib/utils.bsh`

>import fn from other file

</details>


## also check

[how to create library and use it](library.md)