#!/bin/bash
set -e
cd "$(dirname "$0")"

QJS="${QJS:-/usr/local/quickjs}"

"$QJS/build/qjsc" -e -m -o bsh.c \
    -D std/bfs.js -D std/math.js -D std/str-utils.js -D std/json.js \
    state.js parser.js instr.js main.js

gcc -O2 -ffunction-sections -fdata-sections bsh.c \
    -I"$QJS" -L"$QJS/build" -lqjs-libc -lqjs -lm -lpthread \
    -static -Wl,--gc-sections -s -o bsh

rm -f bsh.c
