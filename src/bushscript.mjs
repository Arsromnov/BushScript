import * as std from 'qjs:std';

/* 
            BushScript 0.1.00, released 31.10.26
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
    case "def":
      const varName = tokens[1]  
      const varValue = getStrType(tokens[2])
      storage[varName] = varValue
      break;
    default:
      std.printf("[BSH] cant found syntax")
      break;
  }
}
