import type { NS } from "@ns";
import { nineThreads } from "../../algos/nineThreads";
import { targetN00dles } from "../../algos/targetN00dles";
import { weakenTimeRoundedUp } from "../../algos/weakenTimeRoundedUp";
import { pwnAndPurchase } from "../../network/pwnNetwork";
import { runBatcherAlgo } from "../../runBatcherAlgo";
import { basicGrowToMaxMoney } from "../../tasks/basicGrowToMaxMoney";
import { basicHGW } from "../../tasks/basicHGW";
import { basicWeakenToMinSecurity } from "../../tasks/basicWeakenToMinSecurity";
import { fullWeaken } from "../../tasks/fullWeaken";

/**
 * The theory behind this strategy, is that 9 hack threads can fit on to a 8GB server.
 * Also with n00dles 1 grow is enough for 9 hack threads, so you want to maximize hack threads.
 */
export async function nineN00dles(ns: NS) {
	ns.tprint("Running a basic n00dle eating strategy");
	await runBatcherAlgo(ns, {
		buildNetwork: pwnAndPurchase,
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
