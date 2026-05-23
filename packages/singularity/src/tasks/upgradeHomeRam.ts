import type { NS } from "@ns";
import { RAM_UPGRADE_COST_PORT } from "../constants";

export async function upgradeHomeRam(ns: NS): Promise<void> {
	const port = ns.getPortHandle(RAM_UPGRADE_COST_PORT);
	if (port.empty()) {
		port.write(ns.singularity.getUpgradeHomeRamCost());
	}

	const result = ns.singularity.upgradeHomeRam();
	if (result) {
		ns.tprint(
			`Upgraded home RAM to ${ns.format.ram(ns.getServerMaxRam("home"))}`,
		);
		port.clear();
		port.write(ns.singularity.getUpgradeHomeRamCost());
	}
}
