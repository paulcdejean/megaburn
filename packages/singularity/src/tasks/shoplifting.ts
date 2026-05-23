import type { NS } from "@ns";

export async function shoplifting(ns: NS): Promise<void> {
	ns.singularity.stopAction();

	const success = ns.singularity.commitCrime("Shoplift", false);

	if (!success) {
		throw Error("A criminal failure has occured!");
	}

	// This function returns instantly.
}
