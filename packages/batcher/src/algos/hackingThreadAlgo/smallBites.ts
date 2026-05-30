import type { NS } from "@ns";
import type { Network } from "../../types";

/**
 * This is about keeping grow threads at 9 or below, so that they fit on a 8GB server.
 * This allows running more batches early in the game when you only have access to smaller servers.
 */
// oxlint-disable-next-line no-unused-vars
export function smallBites(ns: NS, network: Network, target: string): number {
	let hackThreads = 2;

	while (true) {
		const amountHacked = ns.hackAnalyze(target) * hackThreads;
		const overGrowth = 1.01;
		const growthRequired = (1 / (1 - amountHacked)) * overGrowth;
		const growThreads = Math.ceil(ns.growthAnalyze(target, growthRequired));
		if (growThreads > 9) {
			return hackThreads - 1;
		} else {
			hackThreads = hackThreads + 1;
		}
	}
}
