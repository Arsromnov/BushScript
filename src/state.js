import * as std from 'qjs:std';

//arguments (module-level for CLI parsing)
export const args = typeof scriptArgs !== 'undefined' ? scriptArgs : [];

// Encapsulates all mutable program state instead of module-level globals.
// One Context per VM run; nothing leaks between runs.
export class Context {
  constructor() {
    this.args = args;
    this.lines = [];
    this.state = { scopeBase: 0, mainLength: 0 };
    this.storage = Object.create(null);
    this.scopes = [];
    this.functions = Object.create(null);
    this.blocks = {};
    this.commands = Object.create(null);
    this.methods = Object.create(null);
  }

  // API exposed to JS std modules (the `bsh` object)
  get bsh() {
    return {
      regMethod: (name, fn) => { this.methods[name] = fn; },
      regCommand: (name, fn) => { this.commands[name] = fn; },
      setVar: (name, value, isLocal) => this.setVar(name, value, isLocal),
      lookup: (name) => this.lookup(name),
      getStrType: (token) => this.getStrType(token),
      args: this.args
    };
  }

  lookup(name) {
    for (let i = this.scopes.length - 1; i >= this.state.scopeBase; i--) {
      if (this.scopes[i].has(name)) { return this.scopes[i].get(name); }
    }
    return this.storage[name];
  }

  scopeFind(name) {
    for (let i = this.scopes.length - 1; i >= this.state.scopeBase; i--) {
      if (this.scopes[i].has(name)) { return this.scopes[i]; }
    }
    return null;
  }

  setVar(name, value, isLocal) {
    if (isLocal) {
      if (this.scopes.length <= this.state.scopeBase) {
        std.printf("[BSH] no local scope to set variable %s\n", name);
        std.exit(1);
      }
      this.scopes[this.scopes.length - 1].set(name, value);
      return;
    }
    const s = this.scopeFind(name);
    if (s) { s.set(name, value); }
    else { this.storage[name] = value; }
  }

  getStrType(token) {
    if (token === undefined) return undefined;
    const v = this.lookup(token);
    if (v !== undefined) return v;
    if (token !== "" && !isNaN(token)) return Number(token);
    if (token.length >= 2 && token.startsWith('"') && token.endsWith('"')) return token.slice(1, -1);
    return token;
  }
}
