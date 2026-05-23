import type { NS } from "@ns";
import type { Task } from "./task";

export function chooseTask(ns: NS): Task {
	const player = ns.getPlayer();
	if (player.skills.hacking < 20 && player.city === "Sector-12") {
		return {
			name: "kickstartUni",
			ram: 4.65,
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
	} else {
		return {
			name: "bored",
			ram: Infinity,
		};
	}
}
