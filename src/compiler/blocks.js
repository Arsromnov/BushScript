import * as std from 'qjs:std';
import { parseLine, parseFnHeader } from './tokenizer.js';

// Builds jump tables (functions, if/else, while blocks) from source lines.
// Writes results into ctx.functions and ctx.blocks.
export function buildBlocks(ctx) {
  const stack = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i].trim()

    if (!line || line.startsWith("--")) {
      continue;
    }

    const tokens = parseLine(line)
    if (tokens.length === 0) {
      continue;
    }

    if (tokens[0] === "fn") {
      const fnHeader = parseFnHeader(line)
      if (!fnHeader) {
        std.printf("[BSH] invalid function header on %s\n", i);
        std.exit(1);
      }
      stack.push({ kind: "fn", fnHeader, ifIndex: i, elseIndex: null })
    } else if (tokens[0] === "if") {
      stack.push({ kind: "if", ifIndex: i, elseIndex: null })
    } else if (tokens[0] === "while") {
      stack.push({ kind: "while", ifIndex: i, elseIndex: null })
    } else if (tokens[0] === "else") {
      const current = stack[stack.length - 1]

      if (!current || current.kind !== "if" || current.elseIndex !== null) {
        std.printf("[BSH] unexpected else on %s\n", i + 1);
        std.exit(1);
      }

      current.elseIndex = i;
    } else if (tokens[0] === "end") {
      const current = stack.pop()

      if (!current) {
        std.printf("[BSH] unexpected end on %s\n", i + 1);
        std.exit(1);
      }

      if (current.kind === "fn") {
        ctx.functions[current.fnHeader.name] = {
          params: current.fnHeader.params,
          startIndex: current.ifIndex,
          endIndex: i
        };
      }

      if (current.kind === "while") {
        ctx.blocks[i] = { whileIndex: current.ifIndex }
      }

      ctx.blocks[current.ifIndex] = {
        elseIndex: current.elseIndex,
        endIndex: i
      };

      if (current.elseIndex !== null) {
        ctx.blocks[current.elseIndex] = {
          endIndex: i
        };
      }
    }
  }

  if (stack.length > 0) {
    std.printf("[BSH] invalid syntax on %s\n", stack[stack.length - 1].ifIndex + 1);
    std.exit(1);
  }
}
