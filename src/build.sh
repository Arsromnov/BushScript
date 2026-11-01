#!/bin/bash
set -e
cd "$(dirname "$0")"

QJS=/c/quickjs

$QJS/build/qjsc.exe -e -m -o bsh.c bushscript.js
gcc bsh.c -I$QJS -L$QJS/build -lqjs-libc -lqjs -lm -lpthread -lws2_32 -static -o bsh.exe
rm bsh.c