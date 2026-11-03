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

## chapter 3 :: operators

`goto <line number>`
`goto 1`

>goto 

### chapter 4 :: other methods

`let x = std.getScriptArg 1`

/bsh test.bsh --file

`let x = std.getScriptArg 1` (it be "test.bsh")

>arguments support
