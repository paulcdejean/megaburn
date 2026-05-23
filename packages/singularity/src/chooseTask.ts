import type { NS } from "@ns";
import { tier1Tasks } from "./tier1Tasks";

export function chooseTask(ns: NS, tier: number): string {
	// Attempt to increase your static RAM.
	if (tier === 1) {
		return tier1Tasks(ns);
	} else {
		return tier1Tasks(ns);
	}
}
