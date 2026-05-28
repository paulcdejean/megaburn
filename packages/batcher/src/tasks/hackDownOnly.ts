import type { NS } from "@ns";
import { Action, ActionBatcherRam } from "../constants";
import type { Farm } from "../Farm";
import type { Batch, Network } from "../types";

export function hackDownOnly(
	ns: NS,
	network: Network,
	target: string,
	hackThreads: number,
	farm: Farm,
): number {
	let result = 0;

	if (ns.getServerMoneyAvailable(target) === 0) {
		return 0;
	}

	let threads = 25;
	while (threads > 0 && farm.scriptLimit > 100) {
		let weakenThreads = 2;
		if (threads <= 12) {
			weakenThreads = 1;
		}
		const hackBatcherRam = ActionBatcherRam.hack * BigInt(threads);
		const weakenBatcherRam = ActionBatcherRam.weaken * BigInt(weakenThreads);

		let hackHost = "invalid";
		let weakenHost = "invalid";
		for (const [serverName, serverData] of network) {
			if (
				serverData.hasAdminRights &&
				serverData.batcherRam >= hackBatcherRam
			) {
				hackHost = serverName;
				break;
			}
		}
		if (hackHost === "invalid") {
			threads = threads - 1;
		} else {
			for (const [serverName, serverData] of network) {
				const available =
					serverName === hackHost
						? serverData.batcherRam - hackBatcherRam
						: serverData.batcherRam;
				if (serverData.hasAdminRights && available >= weakenBatcherRam) {
					weakenHost = serverName;
					break;
				}
			}
			if (weakenHost === "invalid") {
				return result;
			} else {
				const hackWeakenBatch: Batch = [
					{ host: hackHost, threads: threads, action: Action.hack },
					{ host: weakenHost, threads: weakenThreads, action: Action.weaken },
				];
				if (farm.exec(ns, network, target, hackWeakenBatch)) {
					result = result + hackWeakenBatch.length;
				} else {
					return result;
				}
			}
		}
	}
	return result;
}
