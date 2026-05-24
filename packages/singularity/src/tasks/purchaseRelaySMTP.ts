import type { NS } from "@ns";

export async function purchaseRelaySMTP(ns: NS): Promise<void> {
	ns.singularity.purchaseProgram("relaySMTP.exe");
}
