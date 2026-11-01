import * as std from "qjs:std";

/* 
            BushScript 0.1.10, released 1.11.26
                  developed by arsromnov
                     USE MIT LICENSE!
*/

//arguments
const args = scriptArgs;
//structure check
if (args.length < 2) {
  std.printf("[BSH] use << bsh <yourfile.bsh> >> ");
  std.exit(1);
}
//file
const filename = args[2];
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

const lines = fileContent.split("\n");

for (let index in lines) {
  let line = lines[index].trim();
  if (!line || line.startsWith("--")) continue;

  const tokens = parseLine(line);
  if (tokens.length === 0) continue;

  const instr = tokens[0];

  switch (instr) {
    case "log":
      const toLog = tokens.slice(1).map(getStrType);
      std.printf("%s\n", toLog.join(" "));
      break;
    case "let":
      const varName = tokens[1];
      const varValue = getStrType(tokens[2]);
      storage[varName] = varValue;
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
    default:
      std.printf("[BSH] cant found syntax");
      break;
  }
}
