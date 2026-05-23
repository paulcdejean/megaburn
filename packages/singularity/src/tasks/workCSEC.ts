import type { NS } from "@ns";

export async function workCSEC(ns: NS): Promise<void> {
	ns.singularity.stopAction();
	ns.singularity.workForFaction("CyberSec", "hacking", false);
}
