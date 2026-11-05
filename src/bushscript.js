import * as std from "qjs:std";
import * as os from "qjs:os";

/* 
            BushScript 0.1.50, released 5.11.26
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
  console.log("BushScript 0.1.50, released 5.11.26");
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

const lines = fileContent.split("\n");
//parsing for conditions and more in future
const blocks = {};
const stack = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim()

  if (!line || line.startsWith("--")) {
    continue;
  }

  const tokens = parseLine(line)
  if (tokens.length === 0) {
    continue;
  }

  if (tokens[0] === "if") {
    stack.push({ ifIndex: i, elseIndex: null })
  } else if (tokens[0] === "else") {
    const current = stack[stack.length - 1]

    if (!current || current.elseIndex !== null) {
      std.printf("[BSH] unexpected else on %s\n", index);
      std.exit(1);
    }

    current.elseIndex = i;
  } else if (tokens[0] === "end") {
    const current = stack.pop()

    if (!current) {
      std.printf("[BSH] unexpected end on %s\n", index);
      std.exit(1);
    }

    blocks[current.ifIndex] = {
      elseIndex: current.elseIndex,
      endIndex: i
    };

    if (current.elseIndex !== null) {
      blocks[current.elseIndex] = {
        endIndex: i
      };
    }
  }
}

if (stack.length > 0) {
  std.printf("[BSH] invalid syntax on %s\n", stack[stack.length - 1].ifIndex + 1
);
  std.exit(1);
}

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

    //variable declaration command
    case "let":
      const varName = tokens[1];
      const operator = tokens[2];
      const varAction = tokens[3];

      if (operator !== "=") {
        std.printf("[BSH] invalid syntax on %s\n", index);
        std.exit(1);
      }

      //readline method
      if (varAction === "std.read") {
        const toWrite = tokens[4];
        std.out.puts(getStrType(toWrite));
        std.out.flush();
        let input = std.in.getline();
        storage[varName] = input;
      } else if (varAction === "math.randomInt") {
        //generating random int method
        const min = getStrType(tokens[4]);
        const max = getStrType(tokens[5]);
        const result = Math.floor(Math.random() * (max - min + 1)) + min;

        storage[varName] = result;
      } else if (varAction === "math.calc") {
        //calc method
        const intFirst = getStrType(tokens[4]);
        const operationType = tokens[5];
        const intSecond = getStrType(tokens[6]);

        switch (operationType) {
          case "+":
            storage[varName] = intFirst + intSecond;
            break;
          case "-":
            storage[varName] = intFirst - intSecond;
            break;
          case "/":
            if (intSecond === 0) {
              std.printf("[BSH] cant`t divide by zero %s\n", index);
              std.exit(1);
            }

            storage[varName] = intFirst / intSecond;
            break;
          case "*":
            storage[varName] = intFirst * intSecond;
            break;
          default:
            std.printf("[BSH] cant`t found operator %s\n", index);
            break;
        }
      } else if (varAction === "math.random") {
        //random
        const result = Math.random()

        storage[varName] = result;
      } else if (varAction === "std.getScriptArg") {
        const num = getStrType(tokens[4]);
        if (args[num] !== undefined && !isNaN(num)) {
          storage[varName] = args[num];
        } else {
          std.printf("[BSH] invalid argument to method on %s\n", index);
        }
      } else {
        storage[varName] = getStrType(varAction);
      }


      break;

    //goto command
    case "goto":
      const lineNumber = getStrType(tokens[1]);

      if (
        typeof lineNumber !== "number" ||
        lineNumber > lines.length ||
        lineNumber < 0
      ) {
        std.printf("[BSH] invalid syntax on %s\n", index);
        std.exit(1);
      }

      index = lineNumber - 1;
      jumped = true;
      break;
    //wait command
    case "wait":
      const ms = getStrType(tokens[1]);

      if (typeof ms !== "number" || ms < 0) {
        std.printf("[BSH] invalid wait time number on %s\n", index);
        std.exit(1);
      }

      os.sleep(ms);
      break;

    //if/else conditions
    case 'if':
      const leftVal = getStrType(tokens[1])
      const op = tokens[2]
      const rightVal = getStrType(tokens[3])

      let conditionMet = false

      switch (op) {
        case '==': conditionMet = (leftVal == rightVal); break;
        case '!=': conditionMet = (leftVal != rightVal); break;
        case '<=': conditionMet = (leftVal <= rightVal); break;
        case '>=': conditionMet = (leftVal >= rightVal); break;
        case '<': conditionMet = (leftVal < rightVal); break;
        case '>': conditionMet = (leftVal > rightVal); break;
        default:
          std.printf("[BSH] invalid operator on %s\n", index);
          std.exit(1);
      }

      const block = blocks[index]

      if (!block) {
        std.printf("[BSH] invalid condition syntax on %s\n", index);
        std.exit(1);
      }

      if (!conditionMet) {
        index = block.elseIndex !== null
          ? block.elseIndex + 1
          : block.endIndex + 1;
        jumped = true
      }

      break;
    case 'else': {
      const block = blocks[index];

      if (!block) {
        std.printf("[BSH] invalid condition syntax on %s\n", index);
        std.exit(1);
      }

      index = block.endIndex + 1;
      jumped = true;
      break;
    }
    case 'end':
      break;
    case 'toLowerCase':
      const valueN = getStrType(tokens[1])
      if (isNaN(valueN)) {
        storage[valueN] = valueN?.toLowerCase()
      } else {
        std.printf("[BSH] invalid syntax on %s\n", index);
      }
      break;
    case 'toNumber':
      const valueNum = getStrType(tokens[1])  
      storage[valueN] = Number(valueNum)
    default:
      std.printf("[BSH] unknown syntax on %s\n", index);
      break;
  }

  if (!jumped) {
    index++;
  }
}
