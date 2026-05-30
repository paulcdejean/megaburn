import type { NS } from "@ns";
import { Action, ActionBatcherRam } from "../../constants";
import type { Farm } from "../../Farm";
import type { Batch, Network } from "../../types";

export function fullHack(
	ns: NS,
	network: Network,
	target: string,
	hackThreads: number,
	farm: Farm,
): number {
	let result = 0;
	for (const [serverName, serverData] of network) {
		const threads = Number(serverData.batcherRam / ActionBatcherRam.hack);
		if (serverData.hasAdminRights && threads > 0) {
			const hackBatch: Batch = [
				{ host: serverName, threads: threads, action: Action.hack },
			];
			if (farm.exec(ns, network, target, hackBatch)) {
				result = result + hackBatch.length;
			} else {
				return result;
			}
		}
	}
	return result;
}
