import type { NS } from "@ns";
import type { Network } from "../types";

export function pickHackDownTarget(ns: NS, network: Network): string {
	const potentialTargets: string[] = [];
	for (const [serverName, serverData] of network) {
		if (
			serverData.requiredHackingSkill < ns.getHackingLevel() &&
			serverData.backdoorInstalled &&
			serverData.serverGrowth < 40
		) {
			potentialTargets.push(serverName);
		}
	}

	let result = "foodnstuff";
	let bestScore =
		(ns.getServerMoneyAvailable(result) * ns.hackAnalyze(result)) /
		ns.getWeakenTime(result);
	for (const target of potentialTargets) {
		const score =
			(ns.getServerMoneyAvailable(target) * ns.hackAnalyze(target)) /
			ns.getWeakenTime(target);
		if (score > bestScore) {
			bestScore = score;
			result = target;
		}
	}
	return result;
}
