import type { NS } from "@ns";
import { oneThread } from "../../algos/oneThread";
import { pickHackDownTarget } from "../../algos/pickHackDownTarget";
import { weakenTimeRoundedUp } from "../../algos/weakenTimeRoundedUp";
import { pwnNetwork } from "../../network/pwnNetwork";
import { runBatcherAlgo } from "../../runBatcherAlgo";
import { basicWeakenToMinSecurity } from "../../tasks/basicWeakenToMinSecurity";
import { fullWeaken } from "../../tasks/fullWeaken";
import { hackDownOnly } from "../../tasks/hackDownOnly";

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
		pickCycleTime: weakenTimeRoundedUp,
		tasks: [basicWeakenToMinSecurity, hackDownOnly, fullWeaken],
	});
}
