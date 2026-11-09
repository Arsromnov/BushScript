import * as std from "qjs:std";
import * as os from "qjs:os";

/* 
            BushScript 0.1.60, released 9.11.26
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
  std.exit(0);
}
//flags
if (args[1] === "--version") {
  console.log("BushScript 0.1.60, released 9.11.26");
  console.log("      developed by arsromnov       ");
  console.log("        USES MIT LICENSE!          ");
  std.exit(1);
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

//variables, global and local
const storage = {};
const scopes = [] //map for local variables
let scopeBase = 0

//function for variable lookup
function lookup(name) {
  for (let i = scopes.length - 1; i >= scopeBase; i--) {
    //if local
    if (scopes[i].has(name)) { return scopes[i].get(name) }
  }
  return storage[name]
}

function scopeFind(name) {
  for (let i = scopes.length - 1; i >= scopeBase; i--) {
    if (scopes[i].has(name)) { return scopes[i] }
  }
  return null
}

function setVar(name, value, isLocal) {
  if (isLocal) {
    if (scopes.length <= scopeBase) {
      std.printf("[BSH] no local scope to set variable %s\n", name);
      std.exit(1);
    }

    scopes[scopes.length - 1].set(name, value);
    return;
  }
  const s = scopeFind(name);
  if (s) { s.set(name, value) }
  else { storage[name] = value }
}


//functions
const functions = {};
const functionStack = [];

function parseFnHeader(line) {
  const m = line.match(/^fn\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*$/);
  if (!m) { return null }
  return { name: m[1], params: m[2].split(/[\s,]+/).filter(Boolean) }
}

function returnFromFn() {
  const frame = functionStack.pop();
  scopes.length = frame.scopeDepth;
  scopeBase = frame.prevBase;
  index = frame.returnIndex;
}
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
  const v = lookup(token);
  if (v !== undefined) return v;
  //if variable int
  if (token !== "" && !isNaN(token)) return Number(token);
  //else (as string)
  return token;
}

const lines = fileContent.split("\n");
//importing functions from other files
const mainLength = lines.length;
const loadedFiles = new Set([filename]);

function dirOf(path) {
  const i = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return i === -1 ? "." : path.slice(0, i)
}

function addImports(source, basePath) {
  for (const raw of source) {
    const t = parseLine(raw);
    if (t[0] !== "import") continue;

    if (t.length !== 2) {
      std.printf("[BSH] invalid import syntax ");
      std.exit(1);
    }

    const path = dirOf(basePath) + "/" + t[1];
    if (loadedFiles.has(path)) continue;
    loadedFiles.add(path);

    const file = std.open(path, "r")
    if (!file) {
      std.printf("[BSH] cant open file %s\n", path);
      std.exit(1);
    }

    const contentForImport = file.readAsString().split("\n");
    file.close();
    addImports(contentForImport, path);
    lines.push(...contentForImport);
    loadedFiles.add(path);
  }
}

addImports(lines.slice(0, mainLength), filename);
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

  if (tokens[0] === "fn") {
    const fnHeader = parseFnHeader(line)
    if (!fnHeader) {
      std.printf("[BSH] invalid function header on %s\n", i);
      std.exit(1);
    }
    stack.push({ kind: "fn", fnHeader, ifIndex: i, elseIndex: null })
  } else if (tokens[0] === "if") {
    stack.push({ kind: "if", ifIndex: i, elseIndex: null })
  } else if (tokens[0] === "else") {
    const current = stack[stack.length - 1]

    if (!current || current.kind === "fn" || current.elseIndex !== null) {
      std.printf("[BSH] unexpected else on %s\n", i + 1);
      std.exit(1);
    }

    current.elseIndex = i;
  } else if (tokens[0] === "end") {
    const current = stack.pop()

    if (!current) {
      std.printf("[BSH] unexpected end on %s\n", i + 1);
      std.exit(1);
    }

    if (current.kind === "fn") {
      functions[current.fnHeader.name] = {
        params: current.fnHeader.params,
        startIndex: current.ifIndex,
        endIndex: i
      };
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
  std.printf("[BSH] invalid syntax on %s\n", stack[stack.length - 1].ifIndex + 1);
  std.exit(1);
}

while (index < lines.length) {
  if (index >= mainLength && functionStack.length === 0) break;

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
    //local variable
    case "let":
    case "loc":
      const isLocal = instr === "loc";
      const locVarName = tokens[1];
      const locOperator = tokens[2];
      const locVarAction = tokens[3];

      if (locOperator !== "=") {
        std.printf("[BSH] invalid syntax on %s\n", index);
        std.exit(1);
      }

      //readline method
      if (locVarAction === "std.read") {
        const toWrite = tokens[4];
        std.out.puts(getStrType(toWrite) ?? "");
        std.out.flush();
        let input = std.in.getline();
        setVar(locVarName, input, isLocal);
      } else if (locVarAction === "math.randomInt") {
        //generating random int method
        const min = getStrType(tokens[4]);
        const max = getStrType(tokens[5]);
        const result = Math.floor(Math.random() * (max - min + 1)) + min;

        setVar(locVarName, result, isLocal);
      } else if (locVarAction === "math.calc") {
        //calc method
        const intFirst = getStrType(tokens[4]);
        const operationType = tokens[5];
        const intSecond = getStrType(tokens[6]);

        switch (operationType) {
          case "+":
            setVar(locVarName, intFirst + intSecond, isLocal);
            break;
          case "-":
            setVar(locVarName, intFirst - intSecond, isLocal);
            break;
          case "/":
            if (intSecond === 0) {
              std.printf("[BSH] cant`t divide by zero %s\n", index);
              std.exit(1);
            }

            setVar(locVarName, intFirst / intSecond, isLocal);
            break;
          case "*":
            setVar(locVarName, intFirst * intSecond, isLocal);
            break;
          default:
            std.printf("[BSH] cant`t found operator %s\n", index);
            std.exit(1)
            break;
        }
      } else if (locVarAction === "math.random") {
        //random
        const result = Math.random()

        setVar(locVarName, result, isLocal);
      } else if (locVarAction === "std.getScriptArg") {
        const num = getStrType(tokens[4]);
        if (args[num] !== undefined && !isNaN(num)) {
          setVar(locVarName, args[num], isLocal);
        } else {
          std.printf("[BSH] invalid argument to method on %s\n", index);
        }
      } else {
        setVar(locVarName, getStrType(locVarAction), isLocal);
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
      const top = functionStack[functionStack.length - 1];
      if (top && top.endIndex === index) {
        returnFromFn();
        jumped = true
      }
      break;
    case 'toLowerCase':
      const varV = getStrType(tokens[1])
      const varN = tokens[1]
      if (typeof varV === 'string') {
        setVar(varN, varV.toLowerCase(), false)
      } else {
        std.printf("[BSH] invalid variable type for toLowerCase on %s\n", index);
      }
      break;
    case 'toNumber': {
      const varNum = getStrType(tokens[1])
      const varN = tokens[1]
      setVar(varN, Number(varNum), false)
      break;
    }
    case 'fn':
      index = blocks[index].endIndex + 1;
      jumped = true;
      break;
    case 'return':
      if (functionStack.length === 0) {
        std.printf("[BSH] return statement outside of function on %s\n", index);
        std.exit(1);
      }

      returnFromFn();
      jumped = true;
      break;
    case 'import':
      break;
    default: {
      const func = functions[instr];
      if (!func) {
        std.printf("[BSH] unknown syntax on %s\n", index);
        std.exit(1);
      }

      const argVals = tokens.slice(1).map(getStrType);

      if (argVals.length !== func.params.length) {
        std.printf("[BSH] incorrect number of arguments for function '%s' on %s\n", instr, index);
        std.exit(1);
      }

      if (functionStack.length > 1000) {
        std.printf("[BSH] stack overflow %s\n", instr);
        std.exit(1);
      }

      const frame = new Map();
      func.params.forEach((p, i) => frame.set(p, argVals[i]));

      functionStack.push({
        returnIndex: index + 1,
        endIndex: func.endIndex,
        saved: argSaved,
        scopeDepth: scopes.length,
        prevBase: scopeBase
      })

      scopes.push(frame);
      index = func.startIndex + 1;
      scopeBase = scopes.length - 1;
      jumped = true;
    }

  }

  if (!jumped) {
    index++;
  }
}
