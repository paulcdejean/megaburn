import type { NS } from "@ns";

export async function eatFood(ns: NS): Promise<void> {
	ns.singularity.connect("foodnstuff");
	await ns.singularity.manualHack();
	ns.singularity.connect("home");
}
