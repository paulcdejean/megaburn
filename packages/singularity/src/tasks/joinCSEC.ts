import type { NS } from "@ns";

export async function joinCSEC(ns: NS): Promise<void> {
	ns.singularity.joinFaction("CyberSec");
	ns.singularity.stopAction();
}
