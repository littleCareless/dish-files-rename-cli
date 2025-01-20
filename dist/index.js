#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interactive_1 = require("./interactive");
const fileOps_1 = require("./fileOps");
async function main() {
    try {
        const options = await (0, interactive_1.promptOptions)();
        await (0, fileOps_1.renameFiles)(process.cwd(), options);
    }
    catch (err) {
        console.error("Error:", err instanceof Error ? err.message : String(err));
        process.exit(1);
    }
}
main();
