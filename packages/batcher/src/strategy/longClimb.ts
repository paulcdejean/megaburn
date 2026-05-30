import type { NS } from "@ns";
import { basicGrowToMaxMoney } from "../algos/batcherTask/basicGrowToMaxMoney";
import { basicHGW } from "../algos/batcherTask/basicHGW";
import { basicWeakenToMinSecurity } from "../algos/batcherTask/basicWeakenToMinSecurity";
import { fullWeaken } from "../algos/batcherTask/fullWeaken";
import { weakenTimeRoundedUp } from "../algos/cycleTimeAlgo/weakenTimeRoundedUp";
import { smallBites } from "../algos/hackingThreadAlgo/smallBites";
import { pwnAndPurchase } from "../algos/networkBuilderAlgo/pwnNetwork";
import { targetPhantasy } from "../algos/targetSelectionAlgo/targetPhantasy";
import { runBatcherAlgo } from "../runBatcherAlgo";

/**
 * The no augment climb to try and not be poor...
 */
export async function longClimb(ns: NS) {
	ns.tprint("The long climb of hacking phantasy");
	await runBatcherAlgo(ns, {
		buildNetwork: pwnAndPurchase,
		selectTarget: targetPhantasy,
		pickHackThreads: smallBites,
		pickCycleTime: weakenTimeRoundedUp,
		tasks: [
			basicHGW,
			basicWeakenToMinSecurity,
			basicGrowToMaxMoney,
			fullWeaken,
		],
	});
}
