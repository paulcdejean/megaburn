import type { NS } from "@ns";
import { basicWeakenToMinSecurity } from "../algos/batcherTask/basicWeakenToMinSecurity";
import { bigGrowToMaxMoney } from "../algos/batcherTask/bigGrowToMaxMoney";
import { bigHGW } from "../algos/batcherTask/bigHGW";
import { fullWeaken } from "../algos/batcherTask/fullWeaken";
import { shareExtra } from "../algos/batcherTask/shareExtra";
import { weakenTimeRoundedUp } from "../algos/cycleTimeAlgo/weakenTimeRoundedUp";
import { largeBites } from "../algos/hackingThreadAlgo/largeBites";
import { pwnAndPurchase } from "../algos/networkBuilderAlgo/pwnNetwork";
import { bigMoney } from "../algos/targetSelectionAlgo/bigMoney";
import { runBatcherAlgo } from "../runBatcherAlgo";

/**
 * Nearing the top now!
 */
export async function peak(ns: NS) {
	ns.tprint("Near to the clouds!");
	await runBatcherAlgo(ns, {
		buildNetwork: pwnAndPurchase,
		selectTarget: bigMoney,
		pickHackThreads: largeBites,
		pickCycleTime: weakenTimeRoundedUp,
		tasks: [
			bigHGW,
			basicWeakenToMinSecurity,
			bigGrowToMaxMoney,
			shareExtra,
			fullWeaken,
		],
	});
}
