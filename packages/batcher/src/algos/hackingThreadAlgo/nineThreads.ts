import type { NS } from "@ns";
import type { Network } from "../../types";

// oxlint-disable-next-line no-unused-vars
export function nineThreads(ns: NS, network: Network, target: string): number {
	let threads = 9;
	while (threads * ns.hackAnalyze(target) > 0.8) {
		threads = threads - 1;
	}
	return threads;
}
