import type { NS } from "@ns";
import { Action, ActionRam } from "../constants";
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
		const hackRam = threads * ActionRam.hack;
		const weakenRam = weakenThreads * ActionRam.weaken;

		let hackHost = "invalid";
		let weakenHost = "invalid";
		for (const [serverName, serverData] of network) {
			const serverRam = serverData.maxRam - serverData.ramUsed;
			if (serverData.hasAdminRights && serverRam >= hackRam) {
				hackHost = serverName;
				serverData.ramUsed += hackRam;
				break;
			}
		}
		if (hackHost === "invalid") {
			threads = threads - 1;
		} else {
			for (const [serverName, serverData] of network) {
				const serverRam = serverData.maxRam - serverData.ramUsed;
				if (serverData.hasAdminRights && serverRam >= weakenRam) {
					weakenHost = serverName;
					serverData.ramUsed += weakenRam;
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
