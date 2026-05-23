import type { NS } from "@ns";
import { connectToServer } from "../connectToServer";

export async function backdoorCSEC(ns: NS): Promise<void> {
	connectToServer(ns, "CSEC");
	await ns.singularity.installBackdoor();
	// Need to always go back to home before returning to the controller!
	ns.singularity.connect("home");
}
