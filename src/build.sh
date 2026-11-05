#!/bin/bash
set -e
cd "$(dirname "$0")"

QJS=/c/quickjs

"$QJS/build/qjsc.exe" -e -m -o bsh.c bushscript.js
windres bsh.rc -O coff -o bsh-res.o
gcc -Os bsh.c bsh-res.o -I"$QJS" -L"$QJS/build" -lqjs-libc -lqjs -lm -lpthread -lws2_32 -static -o bsh.exe
rm -f bsh.c bsh-res.o
