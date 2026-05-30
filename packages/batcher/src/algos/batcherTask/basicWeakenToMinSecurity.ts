import type { NS } from "@ns";
import { Action, ActionBatcherRam, WEAKEN_SEC } from "../../constants";
import type { Farm } from "../../Farm";
import type { Batch, Network } from "../../types";

export function basicWeakenToMinSecurity(
	ns: NS,
	network: Network,
	target: string,
	hackThreads: number,
	farm: Farm,
): number {
	let result = 0;

	if (
		ns.getServerSecurityLevel(target) === ns.getServerMinSecurityLevel(target)
	) {
		return result;
	}

	const weakeningRequired =
		ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);
	let weakenThreadsRequired = Math.ceil(weakeningRequired / WEAKEN_SEC);

	for (const [serverName, serverData] of network) {
		const weakenThreads = Number(
			serverData.batcherRam / ActionBatcherRam.weaken,
		);
		if (serverData.hasAdminRights && weakenThreads > 0) {
			if (weakenThreadsRequired <= 0) {
				return result;
			} else {
				const weakenBatch: Batch = [
					{
						host: serverName,
						threads: Math.min(weakenThreadsRequired, weakenThreads),
						action: Action.weaken,
					},
				];
				if (farm.exec(ns, network, target, weakenBatch)) {
					result = result + weakenBatch.length;
				} else {
					return result;
				}
				weakenThreadsRequired = weakenThreadsRequired - weakenThreads;
			}
		}
	}
	return result;
}
