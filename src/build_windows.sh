#!/bin/bash
set -e
cd "$(dirname "$0")"


QJS="${QJS:-/c/quickjs}"

"$QJS/build/qjsc.exe" -e -m -o bsh.c \
    -D std/bfs.js -D std/math.js -D std/str-utils.js -D std/json.js \
    state.js parser.js instr.js main.js

windres bsh.rc -O coff -o bsh-res.o

gcc -O2 -ffunction-sections -fdata-sections bsh.c bsh-res.o \
    -I"$QJS" -L"$QJS/build" -lqjs-libc -lqjs -lm -lpthread -lws2_32 \
    -static -Wl,--gc-sections -s -o bsh.exe

rm -f bsh.c bsh-res.o
