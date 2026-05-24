import type { NS } from "@ns";

export interface Tier {
	tier: number;
	workerRam: number;
	controllerRam: number;
	homeRam: number;
}

export const TIER_ONE: Tier = {
	tier: 1,
	workerRam: 7.6,
	controllerRam: 3.95,
	homeRam: 32,
};

export function getTier(ns: NS): Tier {
	if (ns.getServerMaxRam("home") === TIER_ONE.homeRam) {
		return TIER_ONE;
	} else {
		return TIER_ONE;
	}
}
