import * as std from "qjs:std";
import { args, lines, state } from "./state.js";
import { loadImports, buildBlocks } from "./parser.js";
import { run } from "./instr.js";

export class VM {
  async run(filename) {
    const file = std.open(filename, "r");
    if (!file) {
      std.printf("[BSH] cant open file %s\n", filename);
      std.exit(1);
    }

    const fileContent = file.readAsString();
    file.close();

    lines.push(...fileContent.split("\n"));
    state.mainLength = lines.length;

    await loadImports(filename);
    buildBlocks();
    run();
  }
}
