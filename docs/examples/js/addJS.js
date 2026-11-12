export default function(bsh) {
    bsh.regMethod("add", (a,b) => a + b);
    bsh.regCommand("add", (a ,c,b) => setVar(a,c + b,false))
}

