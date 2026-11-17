export default function (bsh) {
    bsh.regMethod("lenOf", (a) => { return String(a).length })
    bsh.regMethod("endsWith", (a, b) => { return String(String(a).endsWith(String(b))) })
    bsh.regMethod("startWith", (a, b) => { return String(String(a)).startsWith(String(b)) })
    bsh.regMethod("includes", (a, b) => { return String(String(a)).includes(String(b)) })
    bsh.regMethod("trim", (a) => { return String(a).trim() })
    bsh.regMethod("toLower", (a) => { return String(a).toLowerCase() })
    bsh.regMethod("toUpper", (a) => { return String(a).toUpperCase() })
    bsh.regMethod("slice", (a, from, to) => { return String(a).slice(from, to) })
    bsh.regMethod("repeat", (a, n) => { return String(a).repeat(n) })
}


