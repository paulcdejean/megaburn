import type { NS } from "@ns";
import { Action, ActionBatcherRam, HG_SEC, WEAKEN_SEC } from "../../constants";
import type { Farm } from "../../Farm";
import type { Batch, Network } from "../../types";

export function basicHWGW(
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
	const overGrowth = 1.1;
	const growthRequired = (1 / (1 - amountHacked)) * overGrowth;
	const growThreads = Math.ceil(ns.growthAnalyze(target, growthRequired));
	const firstWeakenThreads = Math.ceil((hackThreads * HG_SEC) / WEAKEN_SEC);
	const secondWeakenThreads = Math.ceil((growThreads * HG_SEC) / WEAKEN_SEC);

	const hackBatcherRam = ActionBatcherRam.hack * BigInt(hackThreads);
	const firstWeakenBatcherRam =
		ActionBatcherRam.weaken * BigInt(firstWeakenThreads);
	const growBatcherRam = ActionBatcherRam.grow * BigInt(growThreads);
	const secondWeakenBatcherRam =
		ActionBatcherRam.weaken * BigInt(secondWeakenThreads);

	while (farm.scriptLimit > 100) {
		let hackHost = "invalid";
		let firstWeakenHost = "invalid";
		let growHost = "invalid";
		let secondWeakenHost = "invalid";

		for (const [serverName, serverData] of network) {
			if (serverData.hasAdminRights) {
				let serverBatcherRam = serverData.batcherRam;

				if (hackHost === "invalid" && serverBatcherRam >= hackBatcherRam) {
					hackHost = serverName;
					serverBatcherRam -= hackBatcherRam;
				}
				if (
					firstWeakenHost === "invalid" &&
					serverBatcherRam >= firstWeakenBatcherRam
				) {
					firstWeakenHost = serverName;
					serverBatcherRam -= firstWeakenBatcherRam;
				}
				if (growHost === "invalid" && serverBatcherRam >= growBatcherRam) {
					growHost = serverName;
					serverBatcherRam -= growBatcherRam;
				}
				if (
					secondWeakenHost === "invalid" &&
					serverBatcherRam >= secondWeakenBatcherRam
				) {
					secondWeakenHost = serverName;
				}
			}
		}
		if (
			hackHost === "invalid" ||
			firstWeakenHost === "invalid" ||
			growHost === "invalid" ||
			secondWeakenHost === "invalid"
		) {
			return result;
		} else {
			const batch: Batch = [
				{ host: hackHost, threads: hackThreads, action: Action.hack },
				{
					host: firstWeakenHost,
					threads: firstWeakenThreads,
					action: Action.weaken,
				},
				{ host: growHost, threads: growThreads, action: Action.grow },
				{
					host: secondWeakenHost,
					threads: secondWeakenThreads,
					action: Action.weaken,
				},
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
