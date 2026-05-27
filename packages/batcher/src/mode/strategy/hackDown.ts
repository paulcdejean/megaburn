import type { NS } from "@ns";
import { hackTimeRoundedUp } from "../../algos/hackTimeRoundedUp";
import { oneThread } from "../../algos/oneThread";
import { pickHackDownTarget } from "../../algos/pickHackDownTarget";
import { pwnNetwork } from "../../network/pwnNetwork";
import { runBatcherAlgo } from "../../runBatcherAlgo";
import { fullHack } from "../../tasks/fullHack";

/**
 * The theory behind this strategy, is that some bitnodes have a harsh penalty to maximum money.
 * However they don't have that penalty to starting money. So it can be faster to loot servers early than to properly batch on n00dles.
 */
export async function hackDown(ns: NS) {
	ns.tprint("Running a hack down strategy");
	await runBatcherAlgo(ns, {
		buildNetwork: pwnNetwork,
		selectTarget: pickHackDownTarget,
		pickHackThreads: oneThread, // Doesn't matter for hackDownOnly
		pickCycleTime: hackTimeRoundedUp,
		tasks: [fullHack],
	});
}
