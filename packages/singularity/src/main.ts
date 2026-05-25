import type { NS } from "@ns";
import { chooseTask } from "./chooseTask";
import { SINGULARITY_PORT } from "./constants";
import { runTask } from "./runTask";
import { getTier } from "./tier";

/**
 * This function is NOT the true main. It's just used for setting the static RAM.
 */
async function main(ns: NS): Promise<void> {
	// [getServerMaxRam, getPlayer, fileExists, getServerRequiredHackingLevel, isBusy, run, hasTorRouter]
	ns.ramOverride(4);
}

/**
 * This function is what is exported as main to bitburner!
 */
async function realMain(ns: NS): Promise<void> {
	if (ns.args.length > 0) {
		// I am a task runner.
		await runTask(ns, ns.args[0] as string);
		ns.getPortHandle(SINGULARITY_PORT).write("done");
		ns.getPortHandle(SINGULARITY_PORT).clear();
	} else {
		// I am the controller.

		// Temp timing.
		const startTime = performance.now();
		let smtpSplit = false;

		while (true) {
			const tier = getTier(ns);

			const task: string = chooseTask(ns, tier.tier);

			if (task !== "wait") {
				if (task === "purchaseRelaySMTP" && !smtpSplit) {
					ns.tprint(`===== SPLIT =====`);
					ns.tprint(
						`Purchased relaySMTP.exe: ${ns.format.time(performance.now() - startTime)}`,
					);
					ns.tprint(`===== SPLIT =====`);
					smtpSplit = true;
				}
				ns.tprint(`Singularity task: ${task}`);
				const result = ns.run(
					ns.getScriptName(),
					{
						preventDuplicates: false,
						ramOverride: tier.workerRam,
						temporary: true,
						threads: 1,
					},
					task,
				);
				if (result === 0) {
					throw Error(`Failed to run task ${task} with ram ${tier.workerRam}`);
				}
				await ns.getPortHandle(SINGULARITY_PORT).nextWrite();
				await ns.asleep(0);
			} else {
				await ns.asleep(1000);

				ns.print("waiting...");
			}
		}
	}
}

export { main as notMain, realMain as main };

// if (
// 	!ns
// 		.ps()
// 		.map((x) => x.filename)
// 		.includes("batcher.js")
// ) {
// 	ns.run("batcher.js", 1);
// }
