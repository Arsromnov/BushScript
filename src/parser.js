import * as std from 'qjs:std';
import * as os from 'qjs:os';
import { lines, state, functions, blocks, bsh } from "./state.js";


//load js
async function loadJS(path) {
  const abs = path.startsWith("/")
    ? path
    : os.getcwd()[0] + "/" + path.replace(/^\.\//, "");

  let mod;

  try {
    mod = await import(abs);
  } catch (e) {
    std.printf("[BSH] error importing %s: %s\n", abs, e.message);
    std.exit(1);
  }

  if (typeof mod.default == "function") {
    mod.default(bsh);
  }
}



//line parsing
export function parseLine(line) {
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

export function parseFnHeader(line) {
  const m = line.match(/^fn\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*$/);
  if (!m) { return null }
  return { name: m[1], params: m[2].split(/[\s,]+/).filter(Boolean) }
}


//importing functions from other files
const loadedFiles = new Set();

export function dirOf(path) {
  const i = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return i === -1 ? "." : path.slice(0, i)
}

export async function addImports(source, basePath) {
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

    if (path.endsWith(".js")) {
      await loadJS(path);
      continue;
    }

    const file = std.open(path, "r")
    if (!file) {
      std.printf("[BSH] cant open file %s\n", path);
      std.exit(1);
    }

    const contentForImport = file.readAsString().split("\n");
    file.close();
    await addImports(contentForImport, path);
    lines.push(...contentForImport);
    loadedFiles.add(path);
  }
}

export async function loadImports(filename) {
    loadedFiles.add(filename);
    await addImports(lines.slice(0, state.mainLength), filename);
}

export function buildBlocks() {
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
}
