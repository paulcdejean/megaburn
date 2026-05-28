import type { NS, Server } from "@ns";
import type { Network } from "../types";

export function managePurchasedServers(ns: NS, network: Network): void {
	const servers = [];
	for (const [server, data] of network) {
		if (data.purchasedByPlayer && server !== "home") {
			servers.push(server);
		}
	}

	while (servers.length < ns.cloud.getServerLimit()) {
		const newServer = purchaseServer(ns, servers.length);
		if (newServer !== "") {
			network.set(newServer, ns.getServer(newServer) as Required<Server>);
			servers.push(newServer);
			ns.scp(ns.getScriptName(), newServer);
		} else {
			break;
		}
	}

	while (true) {
		let smallestServer = "";
		let leastRam = ns.cloud.getRamLimit();
		for (const server of servers) {
			if (ns.getServerMaxRam(server) < leastRam) {
				smallestServer = server;
				leastRam = ns.getServerMaxRam(server);
			}
		}
		if (!upgradeServer(ns, smallestServer)) {
			return;
		}
	}
}

/**
 * Purchases a 64GB of smaller server.
 * We only go up to 64GB because that's where the cloud server softcap kicks in.
 * Returns the name of the purchased server, or empty string if we failed to purchase anything.
 */
function purchaseServer(ns: NS, purchasedServerCount: number): string {
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

function upgradeServer(ns: NS, server: string): boolean {
	let ram = ns.cloud.getRamLimit();
	const currentRam = ns.getServerMaxRam(server);
	while (ram > currentRam) {
		if (ns.cloud.upgradeServer(server, ram)) {
			ns.tprint(
				`Upgraded ${server} from ${ns.format.ram(currentRam)} RAM to ${ns.format.ram(ram)} RAM`,
			);
			return true;
		} else {
			ram /= 2;
		}
	}

	const upgradeCost = ns.cloud.getServerUpgradeCost(server, currentRam * 2);
	ns.tprint(
		`Need $${ns.format.number(upgradeCost)} to upgrade cloud server ${server}`,
	);
	return false;
}
