import type { NS } from "@ns";
import { chooseTask } from "./chooseTask";
import { runTask } from "./runTask";
import type { Task } from "./task";

const SINGULARITY_PORT = 67;

/**
 * This function is NOT the true main. It's just used for setting the static RAM.
 */
async function main(ns: NS): Promise<void> {
	// 1.6 base + 1 run + 0.5 getPlayer + 0.01 getServerRequiredHackingLevel = 4.61
	ns.ramOverride(3.11);
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
		// I am the master.
		while (true) {
			const task: Task = chooseTask(ns);

			if (task.name !== "wait") {
				ns.tprint(`Current task: ${task.name}`);
				ns.run(
					ns.getScriptName(),
					{
						preventDuplicates: false,
						ramOverride: task.ram,
						temporary: true,
						threads: 1,
					},
					task.name,
				);
				await ns.getPortHandle(SINGULARITY_PORT).nextWrite();
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
