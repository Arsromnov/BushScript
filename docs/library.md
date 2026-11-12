# library in bushscript


## 1. how to install?

### if library written in bushscript

1. create a 'lib' folder(other name`s supported)

2. place the library files into the created directory

3. include the library files in your code

### if library written in javascript

1. create a 'lib' folder(other name supported)

2. place the library files into the created directory

3. include the library files in your code

4. run use 'bsh yourcode.bsh --jsAllow'

## 2. how to create

### if you use bushscript

1.Just create functions in the file; they can then be imported.

### if you use javascript

1.create a '.js' file 

2.define the function

`export function default(bsh) { }`

3.use bsh api in it
-->
    `bsh.setVar(name,value,IsLocal?) --add variable`
    --
    `bsh.getStrValue(token) --return stroke type (variable,number,string)`
    --
    `bsh.regMethod(fn,value => <for returning>)`
    --
    `bsh.regMethod(fn,value => <task>)`

4.import and use

### examples

[addJS module](js/addJs.js)

### also check

[basics](basics.md)


