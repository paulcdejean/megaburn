import type { NS } from "@ns";
import { nineThreads } from "../algos/nineThreads";
import { targetN00dles } from "../algos/targetN00dles";
import { weakenTimeRoundedUp } from "../algos/weakenTimeRoundedUp";
import { povertyPwnNetwork } from "../network/pwnNetwork";
import { runBatcherAlgo } from "../runBatcherAlgo";
import { basicGrowToMaxMoney } from "../tasks/basicGrowToMaxMoney";
import { basicHGW } from "../tasks/basicHGW";
import { basicWeakenToMinSecurity } from "../tasks/basicWeakenToMinSecurity";
import { fullWeaken } from "../tasks/fullWeaken";

/**
 * This batcher mode is for when you have less than 32GB of home RAM.
 * All these functions are tuned to use very little RAM.
 * Also only n00dles is hacked and it's done with a pretty hardcoded algorithm.
 */
export async function limitedMode(ns: NS): Promise<void> {
	ns.tprint(
		"Batcher running in limited mode. Upgrade your home RAM to 32GB or higher to unlock full functionality.",
	);
	// We can't use ns.getMoneySources due to the RAM requirement in limited mode.
	const batchStartMoney = ns.getServerMoneyAvailable("home");
	await runBatcherAlgo(ns, {
		buildNetwork: povertyPwnNetwork,
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
	const batchFinishMoney = ns.getServerMoneyAvailable("home");
	ns.tprint(
		`$${ns.format.number(batchFinishMoney - batchStartMoney)} money gained from all sources since batch start`,
	);
}
