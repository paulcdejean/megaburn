import type { NS } from "@ns";
import { Action, ActionRam } from "../constants";
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
		const serverRam = serverData.maxRam - serverData.ramUsed;
		const weakenThreads = Math.floor(serverRam / ActionRam.weaken);
		if (serverData.hasAdminRights && weakenThreads > 0) {
			const weakenBatch: Batch = [
				{ host: serverName, threads: weakenThreads, action: Action.weaken },
			];
			if (farm.exec(ns, network, "foodnstuff", weakenBatch)) {
				result = result + weakenBatch.length;
			} else {
				return result;
			}
			serverData.ramUsed += weakenThreads * ActionRam.weaken;
		}
	}
	return result;
}
