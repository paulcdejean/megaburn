import type { NS } from "@ns";
import type { Network } from "../../types";

// oxlint-disable-next-line no-unused-vars
export function bigMoney(ns: NS, network: Network): string {
	let bestServer = "phantasy";
	let bestTime = 360000; // 3 minutes I'm impatient!
	for (const [serverName, serverData] of network) {
		// Selective criteria for a phantasy upgrade.
		if (
			// First criteria: Able to hack.
			serverData.hasAdminRights &&
			// Second criteria: Hacking level more than double required.
			serverData.requiredHackingSkill < ns.getHackingLevel() &&
			// Third criteria: Good server growth.
			serverData.serverGrowth > 60 &&
			// Fourth criteria: Max money more than 10x phantasy max.
			serverData.moneyMax > ns.getServerMaxMoney("phantasy") * 100 &&
			// Fifth criteria: Better weaken time than current best.
			ns.getWeakenTime(serverName) < bestTime
		) {
			bestTime = ns.getWeakenTime(serverName);
			bestServer = serverName;
		}
	}
	return bestServer;
}
