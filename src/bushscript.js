import * as std from "qjs:std";
import * as os from "qjs:os";
import { printf } from "std";

/* 
            BushScript 0.1.30, released 2.11.26
                  developed by arsromnov
                     USES MIT LICENSE!
*/

//arguments
const args = scriptArgs;
//current line
let index = 0;
//structure check
if (args.length < 2) {
  std.printf("[BSH] use << bsh <yourfile.bsh> >> ");
  std.exit(1);
}
//flags
if (args[1] === "--version") {
  console.log("BushScript 0.1.30, released 2.11.26");
  console.log("      developed by arsromnov       ");
  console.log("        USES MIT LICENSE!          ");
  std.exit(1);
}
//file
const filename = args[1];
const file = std.open(filename, "r");

if (!file) {
  std.printf("[BSH] cant open file ");
  std.exit(1);
}

const fileContent = file.readAsString();
file.close();

//storage for variables
const storage = {};

//line parsing
function parseLine(line) {
  const tokens = [];
  const regex = /"[^"\\]*(?:\\.[^"\\]*)*"|\S+/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    let token = match[0];

    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    tokens.push(token);
  }

  return tokens;
}

//variables parsing
function getStrType(token) {
  if (token === undefined) return undefined;
  //if variable found
  if (storage[token] !== undefined) return storage[token];
  //if variable int
  if (token !== "" && !isNaN(token)) return Number(token);
  //else (as string)
  return token;
}

const lines = fileContent.split('\n');

while (index < lines.length) {
  let line = lines[index].trim();
  if (!line || line.startsWith("--")) {
    index++;
    continue;
  }

  const tokens = parseLine(line);
  if (tokens.length === 0) {
    index++;
    continue;
  }

  const instr = tokens[0];
  let jumped = false;

  switch (instr) {
    case "log":
      const toLog = tokens.slice(1).map(getStrType);
      std.printf("%s\n", toLog.join(" "));
      break;
    case "let":
      const varName = tokens[1];
      const operator = tokens[2];
      const varValue = getStrType(tokens[3]);
      if (operator == "=") {
        storage[varName] = varValue;
      } else {
        std.printf("[BSH] invalid syntax")
      }
      break;
    case "math":
      const intFirst = getStrType(tokens[1]);
      const operationType = tokens[2];
      const intSecond = getStrType(tokens[3]);
      const target = tokens[4];

      if (!target) {
        std.printf("[BSH] can`t found target variable ");
        std.exit(1);
      }

      switch (operationType) {
        case "+":
          storage[target] = intFirst + intSecond;
          break;
        case "-":
          storage[target] = intFirst - intSecond;
          break;
        case "/":
          if (intSecond === 0) {
            std.printf("[BSH] can`t divide by zero ");
            std.exit(1);
          }

          storage[target] = intFirst / intSecond;
          break;
        case "*":
          storage[target] = intFirst * intSecond;
          break;
        default:
          std.printf("[BSH] cant found operation");
          break;
      }

      break;
    case "goto":
      const lineNumber = getStrType(tokens[1]);

      if (
        typeof lineNumber !== "number" ||
        lineNumber > lines.length ||
        lineNumber < 0
      ) {
        std.printf("[BSH] invalid goto line number on %s\n", index);
        std.exit(1);
      }

      index = lineNumber - 1;
      jumped = true;
      break;
    case "wait":
      const ms = getStrType(tokens[1]);

      if (typeof ms !== "number" || ms < 0) {
        std.printf("[BSH] invalid wait time number on %s\n", index);
        std.exit(1);
      }

      os.sleep(ms);
      break;
    default:
      std.printf("[BSH] cant found syntax");
      break;
  }

  if (!jumped) {
    index++;
  }
}
