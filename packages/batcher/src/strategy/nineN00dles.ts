import type { NS } from "@ns";
import { basicGrowToMaxMoney } from "../algos/batcherTask/basicGrowToMaxMoney";
import { basicHGW } from "../algos/batcherTask/basicHGW";
import { basicWeakenToMinSecurity } from "../algos/batcherTask/basicWeakenToMinSecurity";
import { fullWeaken } from "../algos/batcherTask/fullWeaken";
import { weakenTimeRoundedUp } from "../algos/cycleTimeAlgo/weakenTimeRoundedUp";
import { nineThreads } from "../algos/hackingThreadAlgo/nineThreads";
import { pwnNetwork } from "../algos/networkBuilderAlgo/pwnNetwork";
import { targetN00dles } from "../algos/targetSelectionAlgo/targetN00dles";
import { runBatcherAlgo } from "../runBatcherAlgo";

/**
 * The theory behind this strategy, is that 9 hack threads can fit on to a 8GB server.
 * Also with n00dles 1 grow is enough for 9 hack threads, so you want to maximize hack threads.
 */
export async function nineN00dles(ns: NS) {
	ns.tprint("Running a basic n00dle eating strategy");
	await runBatcherAlgo(ns, {
		buildNetwork: pwnNetwork,
		selectTarget: targetN00dles,
		pickHackThreads: nineThreads,
		pickCycleTime: weakenTimeRoundedUp,
		tasks: [
			basicHGW,
			basicWeakenToMinSecurity,
			basicGrowToMaxMoney,
			fullWeaken,
		],
	});
}
