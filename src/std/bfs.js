import * as std from "qjs:std";
import * as os from "qjs:os";

export default function (bsh) {
    bsh.regMethod("bfs.readFile", (filename) => {
        const f = std.open(filename, 'r')
        if (!f) {
            std.printf("[BSH] bfs error -> cant open file");
            std.exit(1);
        }
        const result = f.readAsString()
        f.close()
        return result
    })
    bsh.regMethod("bfs.cwd", () => os.getcwd()[0]);
    bsh.regMethod("bfs.realpath", (p) => os.realpath(p)[0]);

    bsh.regCommand("bfs.append", (filename, content) => {
        const f = std.open(filename, "a");
        if (!f) {
            std.printf("[BSH] bfs error -> cant open file");
            std.exit(1);
        }
        f.puts(content);
        f.close();
    })
    bsh.regCommand("bfs.write", (filename, content) => {
        const f = std.open(filename, "w");
        if (!f) {
            std.printf("[BSH] bfs error -> cant open file");
            std.exit(1);
        }
        f.puts(content);
        f.close();
    })
    bsh.regCommand("bfs.remove", (filename) => {
        const res = os.remove(filename)
        if (res !== 0) {
            std.printf("[BSH] bfs error -> %s\n", res);
            std.exit(1);
        }
    })
    bsh.regCommand("bfs.rename", (oldF, newF) => {
        const res = os.rename(oldF,newF)
        if (res !== 0) {
            std.printf("[BSH] bfs error -> %s\n", res);
            std.exit(1);
        }
    })
    bsh.regCommand("bfs.mkdir", (name) => {
        const res = os.mkdir(name, 0o755)
        if (res !== 0) {
            std.printf("[BSH] bfs error -> %s\n", res);
            std.exit(1);
        }
    })
    
}