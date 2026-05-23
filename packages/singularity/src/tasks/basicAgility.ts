import type { NS } from "@ns";

export async function basicAgility(ns: NS): Promise<void> {
	ns.singularity.stopAction();

	const success = ns.singularity.gymWorkout(
		ns.enums.LocationName.Sector12PowerhouseGym,
		"agi",
		false,
	);

	if (!success) {
		throw Error("Wandered out of Sector-12?");
	}

	do {
		await ns.asleep(1000);
	} while (ns.getPlayer().skills.agility < 15);

	ns.singularity.stopAction();
}
