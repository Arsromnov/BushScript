import { args } from "./state.js";
import { parseArgs } from "./cli.js";
import { VM } from "./vm.js";

const filename = parseArgs(args);
const vm = new VM();
await vm.run(filename);
