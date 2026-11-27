import * as std from "qjs:std";
import { args, lines, state } from "./state.js";
import { loadImports, buildBlocks } from "./parser.js";
import { run } from "./instr.js";

/* 
            BushScript 0.95, released 27.11.26
                       by arsromnov
                     USES MIT LICENSE!
*/

//structure check
if (args.length < 2) {
  std.printf("[BSH] use --> bsh <yourfile.bsh> \n");
  std.exit(1);
}
//flags
if (args[1] === "--version") {
  console.log("BushScript 0.95, released 27.11.26");
  console.log("      developed by arsromnov       ");
  console.log("        USES MIT LICENSE!          ");
  std.exit(0);
}
//file
const filename = args[1];
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
