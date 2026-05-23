import type { NS } from "@ns";

export async function purchaseBruteSSH(ns: NS): Promise<void> {
	ns.singularity.purchaseProgram("BruteSSH.exe");
}
