#!/usr/bin/env node
import { promptOptions } from "./interactive";
import { renameFiles } from "./fileOps";

async function main() {
    try {
        const options = await promptOptions();
        await renameFiles(process.cwd(), options);
    } catch (err: unknown) {
        console.error(
            "Error:",
            err instanceof Error ? err.message : String(err)
        );
        process.exit(1);
    }
}

main();
