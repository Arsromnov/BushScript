import * as std from "qjs:std";

export function printUsage() {
  std.printf("[BSH] use --> bsh <yourfile.bsh> \n");
}

export function printVersion() {
  console.log("BushScript 0.95");
  console.log("      developed by arsromnov       ");
  console.log("        USES MIT LICENSE!          ");
}

export function parseArgs(args) {
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
