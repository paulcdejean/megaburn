import type { NS } from "@ns";

export async function joinCSEC(ns: NS): Promise<void> {
	if (ns.singularity.checkFactionInvitations().includes("CyberSec")) {
		ns.singularity.joinFaction("CyberSec");
	}
}
