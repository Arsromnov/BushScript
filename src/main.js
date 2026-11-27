import * as std from "qjs:std";
import { args } from "./state.js";
import { Context } from "./state.js";
import { loadImports, compile, buildBlocks } from "./compiler.js";
import { run } from "./instr.js";

// ---------- CLI ----------

function printUsage() {
  std.printf("[BSH] use --> bsh <yourfile.bsh> \n");
}

function printVersion() {
  console.log("BushScript 0.95, released 27.11.26");
  console.log("      developed by arsromnov       ");
  console.log("        USES MIT LICENSE!          ");
}

function parseArgs() {
  if (args.length < 2) {
    printUsage();
    std.exit(1);
  }

  if (args[1] === "--version") {
    printVersion();
    std.exit(0);
  }

  if (args[1] === "--help") {
    printUsage();
    console.log("  bsh <file.bsh>        run a BushScript file");
    console.log("  bsh --version         show version");
    console.log("  bsh --help            show this help");
    std.exit(0);
  }

  return args[1];
}

// ---------- VM ----------

class VM {
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
    compile(ctx);
    run(ctx);
  }
}

// ---------- entry ----------

const filename = parseArgs();
const vm = new VM();
await vm.run(filename);
