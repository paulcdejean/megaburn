import type { NS } from "@ns";
import { smallBites } from "../../algos/smallBites";
import { targetSushi } from "../../algos/targetSushi";
import { weakenTimeRoundedUp } from "../../algos/weakenTimeRoundedUp";
import { pwnNetwork } from "../../network/pwnNetwork";
import { runBatcherAlgo } from "../../runBatcherAlgo";
import { basicGrowToMaxMoney } from "../../tasks/basicGrowToMaxMoney";
import { basicHGW } from "../../tasks/basicHGW";
import { basicWeakenToMinSecurity } from "../../tasks/basicWeakenToMinSecurity";
import { fullWeaken } from "../../tasks/fullWeaken";

/**
 * The theory behind this strategy, is that harakiri-sushi has a higher growth component than other servers.
 * For severe RAM limited situations this means the growth threads can be 9 or less.
 * This allows fitting grows on to smaller servers, allowing more batches to be run.
 */
export async function eatSushi(ns: NS) {
	ns.tprint("Running a very sushi based strategy");
	await runBatcherAlgo(ns, {
		buildNetwork: pwnNetwork,
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
