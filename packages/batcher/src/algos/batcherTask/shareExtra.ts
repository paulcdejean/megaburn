import type { NS } from "@ns";
import { Action, ActionBatcherRam } from "../../constants";
import type { Farm } from "../../Farm";
import type { Batch, Network } from "../../types";

export function shareExtra(
	ns: NS,
	network: Network,
	target: string,
	hackThreads: number,
	farm: Farm,
): number {
	let result = 0;
	for (const [serverName, serverData] of network) {
		const shareThreads = Number(serverData.batcherRam / ActionBatcherRam.share);
		if (serverData.hasAdminRights && shareThreads > 0) {
			const batch: Batch = [
				{ host: serverName, threads: shareThreads, action: Action.share },
			];
			if (farm.exec(ns, network, target, batch)) {
				result = result + batch.length;
			} else {
				return result;
			}
		}
	}
	return result;
}
