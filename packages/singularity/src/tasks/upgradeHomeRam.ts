import type { NS } from "@ns";
import { RAM_UPGRADE_COST_PORT } from "../constants";

export async function upgradeHomeRam(ns: NS): Promise<void> {
	const port = ns.getPortHandle(RAM_UPGRADE_COST_PORT);
	const upgradeCost = ns.singularity.getUpgradeHomeRamCost();
	if (port.empty()) {
		port.write(upgradeCost);
	}

	const result = ns.singularity.upgradeHomeRam();
	if (result) {
		ns.tprint(
			`Upgraded home RAM to ${ns.format.ram(ns.getServerMaxRam("home"))}`,
		);
		port.clear();
		port.write(ns.singularity.getUpgradeHomeRamCost());
	} else {
		ns.tprint(
			`Home RAM not upgraded, $${ns.format.number(upgradeCost)} required`,
		);
	}
}
