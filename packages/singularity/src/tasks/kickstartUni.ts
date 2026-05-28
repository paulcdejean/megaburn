import type { NS } from "@ns";

export async function kickstartUni(ns: NS): Promise<void> {
	ns.singularity.stopAction();

	const success = ns.singularity.universityCourse(
		ns.enums.LocationName.Sector12RothmanUniversity,
		"Algorithms",
		false,
	);

	if (!success) {
		throw Error("Wandered out of Sector-12?");
	}

	let secs = 0;
	do {
		secs = secs + 1;
		await ns.asleep(1000);
	} while (ns.getHackingLevel() < 15 || secs < 5);

	ns.singularity.stopAction();
}
