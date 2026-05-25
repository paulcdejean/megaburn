import type { NS } from "@ns";
import { Action, ActionRam, HG_SEC, WEAKEN_SEC } from "../constants";
import type { Farm } from "../Farm";
import type { Batch, Network } from "../types";

export function basicHGW(
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
	const overGrowth = 1.01;
	const growthRequired = (1 / (1 - amountHacked)) * overGrowth;
	const growThreads = Math.ceil(ns.growthAnalyze(target, growthRequired));
	ns.tprint(`hackThreads = ${hackThreads}`);
	ns.tprint(`growThreads = ${growThreads}`);
	ns.tprint(`amountHacked = ${ns.format.percent(amountHacked)}`);
	const weakenThreads = Math.ceil(
		((hackThreads + growThreads) * HG_SEC) / WEAKEN_SEC,
	);

	while (true) {
		let hackHost = "invalid";
		let weakenHost = "invalid";
		let growHost = "invalid";

		for (const [serverName, serverData] of network) {
			if (serverData.hasAdminRights) {
				let serverRam = serverData.maxRam - serverData.ramUsed;

				if (
					hackHost === "invalid" &&
					Math.floor(serverRam / ActionRam.hack) >= hackThreads
				) {
					hackHost = serverName;
					serverRam = serverRam - ActionRam.hack * hackThreads;
				}
				if (
					growHost === "invalid" &&
					Math.floor(serverRam / ActionRam.grow) >= growThreads
				) {
					growHost = serverName;
					serverRam = serverRam - ActionRam.hack * growThreads;
				}
				if (
					weakenHost === "invalid" &&
					Math.floor(serverRam / ActionRam.weaken) >= weakenThreads
				) {
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
			network.get(hackHost)!.ramUsed += ActionRam.hack * hackThreads;
			network.get(growHost)!.ramUsed += ActionRam.grow * growThreads;
			network.get(weakenHost)!.ramUsed += ActionRam.weaken * weakenThreads;
		}
	}
}
