import * as std from "qjs:std";
import * as os from "qjs:os";
import {
    args, lines, state, scopes, functions, blocks,
    setVar, getStrType, commands, methods
} from "./state.js";
import { parseLine } from "./parser.js";


let index = 0;
const functionStack = [];

function returnFromFn() {
    const frame = functionStack.pop();
    scopes.length = frame.scopeDepth;
    state.scopeBase = frame.prevBase;
    index = frame.returnIndex;
}

export function run() {
    while (index < lines.length) {
        if (index >= state.mainLength && functionStack.length === 0) break;

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
                } else if (methods[locVarAction]) {
                    const methodArgs = tokens.slice(4).map(getStrType);
                    setVar(locVarName, methods[locVarAction](...methodArgs), isLocal);
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
                const cmd = commands[instr];
                if (cmd) {
                    cmd(...tokens.slice(1).map(getStrType));
                    break;
                }

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
                    scopeDepth: scopes.length,
                    prevBase: state.scopeBase
                })

                scopes.push(frame);
                index = func.startIndex + 1;
                state.scopeBase = scopes.length - 1;
                jumped = true;
            }

        }

        if (!jumped) {
            index++;
        }
    }

}