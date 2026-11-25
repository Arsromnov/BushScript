import * as std from 'qjs:std';
import * as os from 'qjs:os';
import { parseLine } from './tokenizer.js';

const isAbs = (p) => /^([A-Za-z]:)?[\\/]/.test(p);
const absPath = (p) =>
  isAbs(p) ? p : os.getcwd()[0].replace(/\\/g, "/") + "/" + p.replace(/^\.\//, "");

export function dirOf(path) {
  const i = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return i === -1 ? "." : path.slice(0, i)
}

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

// loadedFiles is module-private so imports are deduplicated per process.
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
