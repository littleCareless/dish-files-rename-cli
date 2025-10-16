#!/usr/bin/env node
import { promptOptions, confirmExecution } from "./interactive";
import { renameFiles } from "./fileOps";

async function main() {
    try {
        // 1. 获取用户配置并强制进行试运行
        const options = await promptOptions();
        console.log("\n即将进行试运行...");
        await renameFiles(process.cwd(), options);

        // 2. 询问用户是否确认执行
        const proceed = await confirmExecution();

        if (proceed) {
            console.log("\n正在执行重命名...");
            // 3. 用户确认后，执行真正的重命名
            const finalOptions = { ...options, dryRun: false };
            await renameFiles(process.cwd(), finalOptions);
            console.log("\n✅ 重命名操作成功完成!");
        } else {
            console.log("\n操作已取消。");
        }
    } catch (err: unknown) {
        console.error(
            "Error:",
            err instanceof Error ? err.message : String(err)
        );
        process.exit(1);
    }
}

main();
