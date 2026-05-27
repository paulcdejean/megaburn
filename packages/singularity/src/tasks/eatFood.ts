import type { NS } from "@ns";

export async function eatFood(ns: NS): Promise<void> {
	ns.singularity.connect("foodnstuff");
	const result = await ns.singularity.manualHack();
	ns.tprint(`Manually hacked $${ns.format.number(result)}`);
	ns.singularity.connect("home");
}
