import type { NS, Server } from "@ns";
import type { Network } from "../types";

export function managePurchasedServers(ns: NS, network: Network): void {
	let purchasedServerCount = 0;
	for (const [server, data] of network) {
		if (data.purchasedByPlayer && server !== "home") {
			purchasedServerCount++;
		}
	}

	while (purchasedServerCount < ns.cloud.getServerLimit()) {
		const newServer = purchaseServer(ns, purchasedServerCount);
		if (newServer !== null) {
			network.set(newServer, ns.getServer(newServer) as Required<Server>);
			purchasedServerCount++;
			ns.scp(ns.getScriptName(), newServer);
		} else {
			break;
		}
	}
}

/**
 * Purchases a 64GB of smaller server.
 * We only go up to 64GB because that's where the cloud server softcap kicks in.
 * Returns the name of the purchased server, or null if we failed to purchase anything.
 */
function purchaseServer(ns: NS, purchasedServerCount: number): string | null {
	const name = `purchased-${String(purchasedServerCount).padStart(2, "0")}`;

	let ram = 64;
	const minimumRam = 2;
	let result = "";

	while (ram >= minimumRam) {
		result = ns.cloud.purchaseServer(name, ram);
		if (result !== "") {
			ns.tprint(
				`Purchased cloud server ${result} with ${ns.format.ram(ram)} of RAM`,
			);
			break;
		} else {
			ram /= 2;
		}
	}
	return result;
}

function upgradeServer(ns: NS, server: string): void {
	let ram = ns.cloud.getRamLimit();
	const currentRam = ns.getServerMaxRam(server);
	while (ram > currentRam) {
		if (ns.cloud.upgradeServer(server, ram)) {
			ns.tprint(
				`Upgraded ${server} from ${ns.format.ram(currentRam)} RAM to ${ns.format.ram(ram)} RAM`,
			);
			return;
		} else {
			ram /= 2;
		}
	}

	const upgradeCost = ns.cloud.getServerUpgradeCost(server, currentRam * 2);
	ns.tprint(
		`Need $${ns.format.number(upgradeCost)} to upgrade cloud server ${server}`,
	);
}
