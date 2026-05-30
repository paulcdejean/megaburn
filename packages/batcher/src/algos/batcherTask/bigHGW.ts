import type { NS } from "@ns";
import { Action, ActionBatcherRam, HG_SEC, WEAKEN_SEC } from "../../constants";
import type { Farm } from "../../Farm";
import type { Batch, Network } from "../../types";

export function bigHGW(
	ns: NS,
	network: Network,
	target: string,
	hackThreads: number,
	farm: Farm,
): number {
	let result = 0;

	if (
		ns.getServerMinSecurityLevel(target) !==
			ns.getServerSecurityLevel(target) ||
		ns.getServerMaxMoney(target) !== ns.getServerMoneyAvailable(target)
	) {
		return result;
	}

	const amountHacked = ns.hackAnalyze(target) * hackThreads;
	const overGrowth = 1.2;
	const growthRequired = (1 / (1 - amountHacked)) * overGrowth;
	const growThreads = Math.ceil(ns.growthAnalyze(target, growthRequired));
	ns.tprint(`hackThreads = ${hackThreads}`);
	ns.tprint(`growThreads = ${growThreads}`);
	ns.tprint(`amountHacked = ${ns.format.percent(amountHacked)}`);
	const weakenThreads = Math.ceil(
		((hackThreads + growThreads) * HG_SEC) / WEAKEN_SEC,
	);

	const hackBatcherRam = ActionBatcherRam.hack * BigInt(hackThreads);
	const growBatcherRam = ActionBatcherRam.grow * BigInt(growThreads);
	const weakenBatcherRam = ActionBatcherRam.weaken * BigInt(weakenThreads);

	while (true) {
		let hackHost = "invalid";
		let weakenHost = "invalid";
		let growHost = "invalid";

		for (const [serverName, serverData] of network) {
			if (serverData.hasAdminRights) {
				let serverBatcherRam = serverData.batcherRam;

				if (hackHost === "invalid" && serverBatcherRam >= hackBatcherRam) {
					hackHost = serverName;
					serverBatcherRam -= hackBatcherRam;
				}
				if (growHost === "invalid" && serverBatcherRam >= growBatcherRam) {
					growHost = serverName;
					serverBatcherRam -= growBatcherRam;
				}
				if (weakenHost === "invalid" && serverBatcherRam >= weakenBatcherRam) {
					weakenHost = serverName;
				}
			}
		}
		if (
			hackHost === "invalid" ||
			growHost === "invalid" ||
			weakenHost === "invalid"
		) {
			return result;
		} else {
			const batch: Batch = [
				{ host: hackHost, threads: hackThreads, action: Action.hack },
				{ host: growHost, threads: growThreads, action: Action.grow },
				{ host: weakenHost, threads: weakenThreads, action: Action.weaken },
			];
			if (farm.exec(ns, network, target, batch)) {
				result = result + batch.length;
			} else {
				return result;
			}
		}
	}
}
