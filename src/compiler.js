import * as std from 'qjs:std';
import * as os from 'qjs:os';

// ---------- tokenizer ----------

export function parseLine(line) {
  const tokens = [];
  const regex = /"[^"\\]*(?:\\.[^"\\]*)*"|\S+/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    tokens.push(match[0]);
  }

  return tokens;
}

export function parseFnHeader(line) {
  const m = line.match(/^fn\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*$/);
  if (!m) { return null }
  return { name: m[1], params: m[2].split(/[\s,]+/).filter(Boolean) }
}

// ---------- paths ----------

const isAbs = (p) => /^([A-Za-z]:)?[\\/]/.test(p);
const absPath = (p) =>
  isAbs(p) ? p : os.getcwd()[0].replace(/\\/g, "/") + "/" + p.replace(/^\.\//, "");

export function dirOf(path) {
  const i = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return i === -1 ? "." : path.slice(0, i)
}

// ---------- imports ----------

async function loadJS(ctx, path, builtin) {
  let mod;

  try {
    if (builtin) {
      try { mod = await import(path) }
      catch (_) { mod = await import(absPath(path)); }
    } else {
      mod = await import(absPath(path));
    }
  } catch (e) {
    std.printf("[BSH] error importing %s: %s\n", path, e.message);
    std.exit(1);
  }

  if (typeof mod.default == "function") {
    mod.default(ctx.bsh);
  }
}

const loadedFiles = new Set();

export async function addImports(ctx, source, basePath) {
  for (const raw of source) {
    const t = parseLine(raw);
    if (t[0] !== "import") continue;

    if (t.length !== 2) {
      std.printf("[BSH] invalid import syntax ");
      std.exit(1);
    }

    const spec = t[1].replace(/^"|"$/g, "");
    const builtin = spec.startsWith("std/");
    const path = builtin ? spec : dirOf(basePath) + "/" + spec;

    if (loadedFiles.has(path)) continue;
    loadedFiles.add(path);

    if (path.endsWith(".js")) {
      await loadJS(ctx, path, builtin);
      continue;
    }

    const file = std.open(path, "r")
    if (!file) {
      std.printf("[BSH] cant open file for import  %s\n", path);
      std.exit(1);
    }

    const contentForImport = file.readAsString().split("\n");
    file.close();
    await addImports(ctx, contentForImport, path);
    ctx.lines.push(...contentForImport);
    loadedFiles.add(path);
  }
}

export async function loadImports(ctx, filename) {
  loadedFiles.add(filename);
  await addImports(ctx, ctx.lines.slice(0, ctx.state.mainLength), filename);
}

// ---------- blocks ----------

export function buildBlocks(ctx) {
  const stack = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i].trim()

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
    } else if (tokens[0] === "while") {
      stack.push({ kind: "while", ifIndex: i, elseIndex: null })
    } else if (tokens[0] === "else") {
      const current = stack[stack.length - 1]

      if (!current || current.kind !== "if" || current.elseIndex !== null) {
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
        ctx.functions[current.fnHeader.name] = {
          params: current.fnHeader.params,
          startIndex: current.ifIndex,
          endIndex: i
        };
      }

      if (current.kind === "while") {
        ctx.blocks[i] = { whileIndex: current.ifIndex }
      }

      ctx.blocks[current.ifIndex] = {
        elseIndex: current.elseIndex,
        endIndex: i
      };

      if (current.elseIndex !== null) {
        ctx.blocks[current.elseIndex] = {
          endIndex: i
        };
      }
    }
  }

  if (stack.length > 0) {
    std.printf("[BSH] invalid syntax on %s\n", stack[stack.length - 1].ifIndex + 1);
    std.exit(1);
  }
}
