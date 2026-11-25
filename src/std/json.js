import * as std from 'qjs:std';

export default function (bsh) {
    bsh.regMethod("json.GetParam", (file, param) => {
        const fileContent = std.loadFile(file)
        const paramStr = String(param)

        if (fileContent !== null) {
            try {
                const config = JSON.parse(fileContent)

                if (config[paramStr] !== undefined) {
                    return config[paramStr]
                } else {
                    std.printf("[BSH] JSON - cant find param - %s\n", paramStr);
                    std.exit(1);
                }
            } catch (error) {
                std.printf("[BSH] JSON - cant parse JSON on %s\n", file);
                std.exit(1);
            }
        } else {
            std.printf("[BSH] JSON - cant open file  -  %s\n", file);
            std.exit(1);
        }
    })
    bsh.regCommand("json.SetParam", (file, param, value) => {
        const fileContent = std.loadFile(file)
        const paramStr = String(param)
        const valueStr = String(value)

        if (fileContent !== null) {
            try {
                const config = JSON.parse(fileContent)

                config[paramStr] = valueStr;

                const newConfig = JSON.stringify(config, null, 2);

                const fileToWrite = std.open(file, "w")
                if (fileToWrite !== null) {
                    fileToWrite.puts(newConfig)
                    fileToWrite.close()
                } else {
                    std.printf("[BSH] JSON - cant set JSON on %s\n", file);
                    std.exit(1);
                }

            } catch (error) {
                std.printf("[BSH] JSON - cant set JSON on %s\n", file);
                std.exit(1);
            }
        } else {
            std.printf("[BSH] JSON - cant open file  -  %s\n", file);
            std.exit(1);
        }
    })
}