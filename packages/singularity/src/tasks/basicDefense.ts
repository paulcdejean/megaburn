import type { NS } from "@ns";
import { GYM_TARGET_SKILL } from "../constants";

export async function basicDefense(ns: NS): Promise<void> {
	ns.singularity.stopAction();

	const success = ns.singularity.gymWorkout(
		ns.enums.LocationName.Sector12PowerhouseGym,
		"def",
		false,
	);

	if (!success) {
		throw Error("Wandered out of Sector-12?");
	}

	do {
		await ns.asleep(1000);
	} while (ns.getPlayer().skills.defense < GYM_TARGET_SKILL);

	ns.singularity.stopAction();
}
