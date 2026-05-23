import type { NS } from "@ns";
import { TOR_ROUTER_COST } from "./constants";
import type { Task } from "./task";

export function basicTasks(ns: NS): Task {
	const player = ns.getPlayer();
	if (player.skills.hacking < 20 && player.city === "Sector-12") {
		return {
			name: "kickstartUni",
			ram: 4.65,
		};
	} else if (player.money > TOR_ROUTER_COST && !ns.hasTorRouter()) {
		return {
			name: "purchaseTorRouter",
			ram: 6.6,
		};
	} else if (player.skills.agility < 10 && player.city === "Sector-12") {
		return {
			name: "basicAgility",
			ram: 6.6,
		};
	} else if (player.skills.dexterity < 10 && player.city === "Sector-12") {
		return {
			name: "basicDexterity",
			ram: 6.6,
		};
	} else if (!ns.singularity.isBusy()) {
		return {
			name: "shoplifting",
			ram: 7.6,
		};
	} else {
		return {
			name: "wait",
			ram: 0, // Actually! Because it just doesn't run anything.
		};
	}
}
