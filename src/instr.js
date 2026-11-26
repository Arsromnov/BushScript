import * as std from "qjs:std";
import * as os from "qjs:os";

// Tree-walk interpreter over compiled jump tables.
// Receives a Context; no module-level mutable state leaks out.
export function run(ctx) {
    let index = 0;
    const functionStack = [];

    function returnFromFn() {
        const frame = functionStack.pop();
        ctx.scopes.length = frame.scopeDepth;
        ctx.state.scopeBase = frame.prevBase;
        index = frame.returnIndex;
    }

    function evalCondition(tokens) {
        const leftVal = ctx.getStrType(tokens[1]);
        const op = tokens[2];
        const rightVal = ctx.getStrType(tokens[3]);

        switch (op) {
            case '==': return leftVal == rightVal;
            case '!=': return leftVal != rightVal;
            case '<=': return leftVal <= rightVal;
            case '>=': return leftVal >= rightVal;
            case '<': return leftVal < rightVal;
            case '>': return leftVal > rightVal;
            default:
                std.printf("[BSH] invalid operator on %s\n", index);
                std.exit(1);
        }
    }

    while (index < ctx.lines.length) {
        if (index >= ctx.state.mainLength && functionStack.length === 0) break;

        const entry = ctx.compiled[index];
        if (!entry) {
            index++;
            continue;
        }

        const tokens = entry.tokens;
        if (tokens.length === 0) {
            index++;
            continue;
        }

        const instr = tokens[0];
        let jumped = false;

        switch (instr) {
            case "log": {
                const toLog = tokens.slice(1).map(t => ctx.getStrType(t));
                std.printf("%s\n", toLog.join(" "));
                break;
            }
            // local variable
            case "let":
            case "loc": {
                const isLocal = instr === "loc";
                const locVarName = tokens[1];
                const locOperator = tokens[2];
                const locVarAction = tokens[3];

                if (locOperator !== "=") {
                    std.printf("[BSH] invalid syntax on %s\n", index);
                    std.exit(1);
                }

                if (locVarAction === "readLine") {
                    const toWrite = tokens[4];
                    std.out.puts(ctx.getStrType(toWrite) ?? "");
                    std.out.flush();
                    const input = std.in.getline();
                    ctx.setVar(locVarName, input, isLocal);
                } else if (locVarAction === "getScriptArg") {
                    const num = ctx.getStrType(tokens[4]);
                    if (ctx.args[num] !== undefined && !isNaN(num)) {
                        ctx.setVar(locVarName, ctx.args[num], isLocal);
                    } else {
                        std.printf("[BSH] invalid argument to method on %s\n", index);
                        std.exit(1);
                    }
                } else if (locVarAction === "time.currentISO") {
                    ctx.setVar(locVarName, new Date().toISOString(), isLocal);
                } else if (locVarAction === "time.currentUNIX") {
                    ctx.setVar(locVarName, Date.now(), isLocal);
                } else if (ctx.methods[locVarAction]) {
                    const methodArgs = tokens.slice(4).map(t => ctx.getStrType(t));
                    ctx.setVar(locVarName, ctx.methods[locVarAction](...methodArgs), isLocal);
                } else {
                    ctx.setVar(locVarName, ctx.getStrType(locVarAction), isLocal);
                }
                break;
            }
            // goto command
            case "goto": {
                const lineNumber = ctx.getStrType(tokens[1]);

                if (
                    typeof lineNumber !== "number" ||
                    lineNumber > ctx.lines.length ||
                    lineNumber < 1
                ) {
                    std.printf("[BSH] invalid syntax on %s\n", index);
                    std.exit(1);
                }

                index = lineNumber - 1;
                jumped = true;
                break;
            }

            // wait command
            case "wait": {
                const ms = ctx.getStrType(tokens[1]);

                if (typeof ms !== "number" || ms < 0) {
                    std.printf("[BSH] invalid wait time number on %s\n", index);
                    std.exit(1);
                }

                os.sleep(ms);
                break;
            }

            // if/else conditions
            case 'if': {
                const block = ctx.blocks[index];

                if (!block) {
                    std.printf("[BSH] invalid condition syntax on %s\n", index);
                    std.exit(1);
                }

                if (!evalCondition(tokens)) {
                    index = block.elseIndex !== null
                        ? block.elseIndex + 1
                        : block.endIndex + 1;
                    jumped = true;
                }
                break;
            }
            case 'else': {
                const block = ctx.blocks[index];

                if (!block) {
                    std.printf("[BSH] invalid condition syntax on %s\n", index);
                    std.exit(1);
                }

                index = block.endIndex + 1;
                jumped = true;
                break;
            }
            case 'while': {
                const block = ctx.blocks[index];

                if (!block) {
                    std.printf("[BSH] invalid condition syntax on %s\n", index);
                    std.exit(1);
                }

                if (!evalCondition(tokens)) {
                    index = block.endIndex + 1;
                    jumped = true;
                }
                break;
            }
            case 'end': {
                const top = functionStack[functionStack.length - 1];
                const blk = ctx.blocks[index];

                if (top && top.endIndex === index) {
                    returnFromFn();
                    jumped = true;
                } else if (blk && blk.whileIndex !== undefined) {
                    index = blk.whileIndex;
                    jumped = true;
                }
                break;
            }
            case 'toNumber': {
                const varNum = ctx.getStrType(tokens[1]);
                const varN = tokens[1];
                ctx.setVar(varN, Number(varNum), false);
                break;
            }
            case 'fn':
                index = ctx.blocks[index].endIndex + 1;
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
                if (instr.endsWith("--") || instr.endsWith("++")) {
                    const name = instr.slice(0, -2);
                    const cur = ctx.lookup(name);
                    ctx.setVar(name, instr.endsWith("++") ? cur + 1 : cur - 1, false);
                    break;
                }

                const cmd = ctx.commands[instr];
                if (cmd) {
                    cmd(...tokens.slice(1).map(t => ctx.getStrType(t)));
                    break;
                }

                const func = ctx.functions[instr];
                if (!func) {
                    std.printf("[BSH] unknown syntax on %s\n", index);
                    std.exit(1);
                }

                const argVals = tokens.slice(1).map(t => ctx.getStrType(t));

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
                    scopeDepth: ctx.scopes.length,
                    prevBase: ctx.state.scopeBase
                })

                ctx.scopes.push(frame);
                index = func.startIndex + 1;
                ctx.state.scopeBase = ctx.scopes.length - 1;
                jumped = true;
            }
        }

        if (!jumped) {
            index++;
        }
    }
}
