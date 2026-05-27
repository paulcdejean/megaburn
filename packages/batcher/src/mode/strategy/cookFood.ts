import type { NS } from "@ns";
import { oneThread } from "../../algos/oneThread";
import { targetFoodnstuff } from "../../algos/targetFoodnstuff";
import { weakenTimeRoundedUp } from "../../algos/weakenTimeRoundedUp";
import { pwnNetwork } from "../../network/pwnNetwork";
import { runBatcherAlgo } from "../../runBatcherAlgo";
import { basicWeakenToMinSecurity } from "../../tasks/basicWeakenToMinSecurity";
import { fullWeaken } from "../../tasks/fullWeaken";
import { hackDownOnly } from "../../tasks/hackDownOnly";

/**
 * The theory behind this strategy, is that 9 hack threads can fit on to a 8GB server.
 * Also with n00dles 1 grow is enough for 9 hack threads, so you want to maximize hack threads.
 */
export async function cookFood(ns: NS) {
	ns.tprint("Running a food eating strategy n stuff");
	await runBatcherAlgo(ns, {
		buildNetwork: pwnNetwork,
		selectTarget: targetFoodnstuff,
		pickHackThreads: oneThread,
		pickCycleTime: weakenTimeRoundedUp,
		tasks: [basicWeakenToMinSecurity, hackDownOnly, fullWeaken],
	});
}
