import * as std from "qjs:std"

export default function (bsh) {
    bsh.regMethod("math.random", () => {
        //random
        const result = Math.random()
        return result
    })
    bsh.regMethod("math.randomInt", (min, max) => {
        //generating random int method
        const result = Math.floor(Math.random() * (max - min + 1)) + min;

        return result
    })
    bsh.regMethod("math.calc", (intFirst, operationType, intSecond) => {
        switch (operationType) {
            case "+":
                return intFirst + intSecond
            case "-":
                return intFirst - intSecond
            case "/":
                if (intSecond === 0) {
                    std.printf("[BSH] cant`t divide by zero ");
                    std.exit(1);
                }

                return intFirst / intSecond
            case "*":
                return intFirst * intSecond
            default:
                std.printf("[BSH] cant`t found operator %s");
                std.exit(1)
                return 
        }
    })
}