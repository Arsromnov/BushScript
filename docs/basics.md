# basics of BushScript

## chapter 1 :: variables

`let x = 1`

>declare the variable x (value: 1)

## chapter 2 :: log and math operations

`log "some text"`

>the command print some text to CLI

`log x`

`log "hello" x`

> prints variables

`let x = math.calc <num> + <num>`

`let x = math.calc 1 + 1`

>math operations

`let x = math.randomInt <minNum> <maxNum>`

`let x = math.random 0 1000`

>random 

## chapter 3 :: operators

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

### chapter 4 :: other methods

`let x = std.getScriptArg 1`

/bsh test.bsh --file

`let x = std.getScriptArg 1` (it be "test.bsh")

>arguments support

`let x = std.read <your text>`

`let x = std.read "pls write your name"`

>input

`toLowerCase <variable>`

`toLowerCase x`

let x = "STR"
toLowerCase x

-- x value : str

>to lowercase function

let x = "1"
toLowerCase x

-- x value : 1

>to number function