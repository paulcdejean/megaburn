import type { NS } from "@ns";
import { hardcodedHackThreads } from "./algos/hardcodedHackThreads";
import { targetN00dles } from "./algos/targetN00dles";
import { weakenTimeRoundedUp } from "./algos/weakenTimeRoundedUp";
import { povertyPwnNetwork } from "./network/pwnNetwork";
import { runBatcherAlgo } from "./runBatcherAlgo";
import { basicGrowToMaxMoney } from "./tasks/basicGrowToMaxMoney";
import { basicHGW } from "./tasks/basicHGW";
import { basicWeakenToMinSecurity } from "./tasks/basicWeakenToMinSecurity";
import { fullWeaken } from "./tasks/fullWeaken";

export async function limitedMode(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.tprint(
		"Batcher running in limited mode. Upgrade your home RAM to 32GB or higher to unlock full functionality.",
	);
	await runBatcherAlgo(ns, {
		buildNetwork: povertyPwnNetwork,
		selectTarget: targetN00dles,
		pickHackThreads: hardcodedHackThreads,
		pickCycleTime: weakenTimeRoundedUp,
		tasks: [
			basicHGW,
			basicWeakenToMinSecurity,
			basicGrowToMaxMoney,
			fullWeaken,
		],
	});
}
