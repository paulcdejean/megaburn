import type { NS } from "@ns";
import { hardcodedHackThreads } from "./algos/hardcodedHackThreads";
import { weakenTimeRoundedUp } from "./algos/weakenTimeRoundedUp";
import { wildGuess } from "./algos/wildGuess";
import { pwnAndPurchase } from "./network/pwnNetwork";
import { runBatcherAlgo } from "./runBatcherAlgo";
import { basicGrowToMaxMoney } from "./tasks/basicGrowToMaxMoney";
import { basicHWGW } from "./tasks/basicHWGW";
import { basicWeakenToMinSecurity } from "./tasks/basicWeakenToMinSecurity";
import { fullWeaken } from "./tasks/fullWeaken";
import { shareExtra } from "./tasks/shareExtra";

export async function mainMode(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	while (true) {
		await runBatcherAlgo(ns, {
			buildNetwork: pwnAndPurchase,
			selectTarget: wildGuess,
			pickHackThreads: hardcodedHackThreads,
			pickCycleTime: weakenTimeRoundedUp,
			tasks: [
				basicHWGW,
				basicWeakenToMinSecurity,
				basicGrowToMaxMoney,
				shareExtra,
				fullWeaken,
			],
		});
	}
}
