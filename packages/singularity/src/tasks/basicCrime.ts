import type { NS } from "@ns";

export async function basicCrime(ns: NS): Promise<void> {
	ns.singularity.stopAction();

	const success = ns.singularity.commitCrime("Mug", false);

	if (!success) {
		throw Error("A criminal failure has occured!");
	}

	// This function returns instantly.
}
