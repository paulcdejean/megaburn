import type { NS } from "@ns";
import type { BatcherAlgo } from "./types";

export async function runBatcherAlgo(ns: NS, algo: BatcherAlgo): Promise<void> {
	const network = algo.buildNetwork(ns);

	// Is this needed so purchased servers "appear" ???
	await ns.asleep(0);

	const target = algo.selectTarget(ns, network);
	const hackThreads = algo.pickHackThreads(ns, network, target);
	ns.tprint(
		`Batcher target is: ${target} with hack percentage ${ns.format.percent(ns.hackAnalyze(target) * hackThreads)}`,
	);
	const farm = algo.pickCycleTime(ns, network, target);
	ns.tprint(
		`Batch will take approximately ${ns.format.time(farm.cycleTime, false)}`,
	);

	for (const task of algo.tasks) {
		const scriptsLaunched = task(ns, network, target, hackThreads, farm);
		ns.tprint(
			`Executed task ${task.name} launching ${scriptsLaunched} scripts`,
		);
	}
	const batchStartTime = performance.now();

	await Promise.all(farm.startupPromises);
	const scriptLaunchTime = performance.now();
	ns.tprint(
		`Scripts launched in ${ns.format.time(scriptLaunchTime - batchStartTime, true)}`,
	);

	await Promise.all(farm.completionPromises);
	const batchFinishTime = performance.now();

	ns.tprint(
		`Batch finished in ${ns.format.time(batchFinishTime - scriptLaunchTime, true)}`,
	);
	ns.tprint(
		`Target ${target} security ${ns.format.number(ns.getServerSecurityLevel(target))} / ${ns.getServerMinSecurityLevel(target)}, ` +
			`money $${ns.format.number(ns.getServerMoneyAvailable(target))} / $${ns.format.number(ns.getServerMaxMoney(target))}`,
	);
}
