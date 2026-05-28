import type { NS } from "@ns";
import { Action, ActionBatcherRam } from "../constants";
import type { Farm } from "../Farm";
import type { Batch, Network } from "../types";

export function fullWeaken(
	ns: NS,
	network: Network,
	target: string,
	hackThreads: number,
	farm: Farm,
): number {
	let result = 0;
	for (const [serverName, serverData] of network) {
		const weakenThreads = Number(
			serverData.batcherRam / ActionBatcherRam.weaken,
		);
		if (serverData.hasAdminRights && weakenThreads > 0) {
			const weakenBatch: Batch = [
				{ host: serverName, threads: weakenThreads, action: Action.weaken },
			];
			if (farm.exec(ns, network, target, weakenBatch)) {
				result = result + weakenBatch.length;
			} else {
				return result;
			}
		}
	}
	return result;
}
