import type { NS } from "@ns";
import { basicTasks } from "./basicTasks";
import { TIER2_RAM } from "./constants";
import type { Task } from "./task";

export function chooseTask(ns: NS): Task {
	// Attempt to increase your static RAM.
	if (ns.getServerMaxRam("home") === 64) {
		ns.ramOverride(TIER2_RAM); // TODO, lets go super saiyan!
	}

	if (ns.ramOverride() < TIER2_RAM) {
		return basicTasks(ns);
	} else {
		throw Error("Tier 2 functionality not implemented yet!");
	}
}
