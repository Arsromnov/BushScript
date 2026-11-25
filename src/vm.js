import * as std from "qjs:std";
import { Context } from "./state.js";
import { loadImports } from "./compiler/imports.js";
import { buildBlocks } from "./compiler/blocks.js";
import { run } from "./instr.js";

export class VM {
  async run(filename) {
    const ctx = new Context();

    const file = std.open(filename, "r");
    if (!file) {
      std.printf("[BSH] cant open file %s\n", filename);
      std.exit(1);
    }

    const fileContent = file.readAsString();
    file.close();

    ctx.lines.push(...fileContent.split("\n"));
    ctx.state.mainLength = ctx.lines.length;

    await loadImports(ctx, filename);
    buildBlocks(ctx);
    run(ctx);
  }
}
