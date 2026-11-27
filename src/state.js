import * as std from 'qjs:std';


//arguments
export const args = scriptArgs;
//program lines
export const lines = []


export const state = {
  scopeBase: 0,
  mainLength: 0,
}

//variables, global and local
export const storage = Object.create(null);;
export const scopes = [] //map for local variables

//functions and blocks
export const functions = Object.create(null);;
export const blocks = {};

//commands and methods from JS
export const commands = Object.create(null);;
export const methods = Object.create(null);;

export function regCommand(name, fn) {
  commands[name] = fn;
}

export function regMethod(name, fn) {
  methods[name] = fn;
}

export const bsh = {
  regMethod, regCommand, setVar, lookup, getStrType, args
}

//function for variable lookup
export function lookup(name) {
  for (let i = scopes.length - 1; i >= state.scopeBase; i--) {
    //if local
    if (scopes[i].has(name)) { return scopes[i].get(name) }
  }
  return storage[name]
}


export function scopeFind(name) {
  for (let i = scopes.length - 1; i >= state.scopeBase; i--) {
    if (scopes[i].has(name)) { return scopes[i] }
  }
  return null
}

export function setVar(name, value, isLocal) {
  if (isLocal) {
    if (scopes.length <= state.scopeBase) {
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

//variables parsing
export function getStrType(token) {
  if (token === undefined) return undefined;
  //if variable found
  const v = lookup(token);
  if (v !== undefined) return v;
  //if variable int
  if (token !== "" && !isNaN(token)) return Number(token);
  //if in ""
  if (token.length >= 2 && token.startsWith('"') && token.endsWith('"')) return token.slice(1, -1);
  //else (as string)
  return token;
}

