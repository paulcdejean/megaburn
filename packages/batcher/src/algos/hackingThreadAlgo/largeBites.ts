import type { NS } from "@ns";
import type { Network } from "../../types";

/**
 * This is about lol idk.
 */
// oxlint-disable-next-line no-unused-vars
export function largeBites(ns: NS, network: Network, target: string): number {
	let hackThreads = 603;

	while (ns.hackAnalyze(target) * hackThreads > 0.5 && hackThreads > 1) {
		hackThreads = hackThreads - 1;
	}

	let growThreads;
	while (true) {
		const amountHacked = ns.hackAnalyze(target) * hackThreads;
		const overGrowth = 1.2;
		const growthRequired = (1 / (1 - amountHacked)) * overGrowth;
		growThreads = Math.ceil(ns.growthAnalyze(target, growthRequired));
		if (growThreads < 585) {
			break;
		} else {
			hackThreads = hackThreads - 1;
		}
	}

	return hackThreads;
}
