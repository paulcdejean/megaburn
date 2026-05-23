import type { NS } from "@ns";
import { connectToServer } from "../connectToServer";
import { STORY_BACKDOOR_PORT } from "../constants";

export async function backdoorCSEC(ns: NS): Promise<void> {
	if (!ns.brutessh("CSEC")) {
		throw Error("Failed to open port on CSEC");
	}
	connectToServer(ns, "CSEC");
	await ns.singularity.installBackdoor();

	const port = ns.getPortHandle(STORY_BACKDOOR_PORT);
	if (port.empty()) {
		port.write(["CSEC"]);
	} else {
		const portData: string[] = port.read();
		portData.push("CSEC");
		port.write(portData);
	}

	// Need to always go back to home before returning to the controller!
	ns.singularity.connect("home");
}
