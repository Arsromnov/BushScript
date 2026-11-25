// Tokenizer — source lines are tokenized once at compile time,
// not re-parsed on every interpreter iteration.
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
