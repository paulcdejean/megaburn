import type { NS } from "@ns";
import { smallBites } from "../../algos/smallBites";
import { targetSushi } from "../../algos/targetSushi";
import { weakenTimeRoundedUp } from "../../algos/weakenTimeRoundedUp";
import { pwnAndPurchase } from "../../network/pwnNetwork";
import { runBatcherAlgo } from "../../runBatcherAlgo";
import { basicGrowToMaxMoney } from "../../tasks/basicGrowToMaxMoney";
import { basicHGW } from "../../tasks/basicHGW";
import { basicWeakenToMinSecurity } from "../../tasks/basicWeakenToMinSecurity";
import { fullWeaken } from "../../tasks/fullWeaken";

/**
 * The no augment climb to try and not be poor...
 */
export async function longClimb(ns: NS) {
	ns.tprint("Running a very sushi based strategy");
	await runBatcherAlgo(ns, {
		buildNetwork: pwnAndPurchase,
		selectTarget: targetSushi,
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
