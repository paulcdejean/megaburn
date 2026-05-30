import type { NS } from "@ns";
import { bigMoney } from "../../algos/bigMoney";
import { largeBites } from "../../algos/largeBites";
import { weakenTimeRoundedUp } from "../../algos/weakenTimeRoundedUp";
import { pwnAndPurchase } from "../../network/pwnNetwork";
import { runBatcherAlgo } from "../../runBatcherAlgo";
import { basicHGW } from "../../tasks/basicHGW";
import { basicWeakenToMinSecurity } from "../../tasks/basicWeakenToMinSecurity";
import { bigGrowToMaxMoney } from "../../tasks/bigGrowToMaxMoney";
import { fullWeaken } from "../../tasks/fullWeaken";
import { shareExtra } from "../../tasks/shareExtra";

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
			basicHGW,
			basicWeakenToMinSecurity,
			bigGrowToMaxMoney,
			shareExtra,
			fullWeaken,
		],
	});
}
