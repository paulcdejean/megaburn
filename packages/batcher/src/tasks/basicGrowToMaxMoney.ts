import type { NS } from "@ns";
import { Action, ActionRam } from "../constants";
import type { Farm } from "../Farm";
import type { Batch, Network } from "../types";

export function basicGrowToMaxMoney(
	ns: NS,
	network: Network,
	target: string,
	hackThreads: number,
	farm: Farm,
): number {
	let result = 0;

	if (ns.getServerMoneyAvailable(target) === ns.getServerMaxMoney(target)) {
		return 0;
	}

	let growThreads = 25;
	while (growThreads > 0 && farm.scriptLimit > 100) {
		let weakenThreads = 2;
		if (growThreads <= 12) {
			weakenThreads = 1;
		}
		const growRam = growThreads * ActionRam.grow;
		const weakenRam = weakenThreads * ActionRam.weaken;

		let growHost = "invalid";
		let weakenHost = "invalid";
		for (const [serverName, serverData] of network) {
			const serverRam = serverData.maxRam - serverData.ramUsed;
			if (serverData.hasAdminRights && serverRam >= growRam) {
				growHost = serverName;
				serverData.ramUsed += growRam;
				break;
			}
		}
		if (growHost === "invalid") {
			growThreads = growThreads - 1;
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
				const growWeakenBatch: Batch = [
					{ host: growHost, threads: growThreads, action: Action.grow },
					{ host: weakenHost, threads: weakenThreads, action: Action.weaken },
				];
				if (farm.exec(ns, network, target, growWeakenBatch)) {
					result = result + growWeakenBatch.length;
				} else {
					return result;
				}
			}
		}
	}
	return result;
}
