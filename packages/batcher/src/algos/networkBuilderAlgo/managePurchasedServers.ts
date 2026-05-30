import type { NS } from "@ns";
import type { Network, NetworkServer } from "../../types";

export function managePurchasedServers(
	ns: NS,
	network: Network,
	ramLimit: number,
): void {
	const servers = [];
	for (const [server, data] of network) {
		if (data.purchasedByPlayer && server !== "home") {
			servers.push(server);
		}
	}

	while (servers.length < ns.cloud.getServerLimit()) {
		const newServer = purchaseServer(ns, servers.length);
		if (newServer !== "") {
			const serverData = ns.getServer(newServer) as NetworkServer;
			serverData.batcherRam = BigInt(serverData.maxRam * 20);
			network.set(newServer, serverData);
			servers.push(newServer);
			ns.scp(ns.getScriptName(), newServer);
		} else {
			break;
		}
	}

	while (true) {
		let smallestServer = "";
		let leastRam = ramLimit;
		for (const server of servers) {
			if (ns.getServerMaxRam(server) < leastRam) {
				smallestServer = server;
				leastRam = ns.getServerMaxRam(server);
			}
		}
		if (smallestServer === "" || !upgradeServer(ns, smallestServer)) {
			return;
		} else {
			const serverData = network.get(smallestServer);
			if (serverData !== undefined) {
				serverData.maxRam = ns.getServerMaxRam(smallestServer);
				serverData.batcherRam = BigInt(serverData.maxRam * 20);
			}
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

/**
 * Tries to upgrade a server to twice its current size or 64GB which ever is larger.
 */
function upgradeServer(ns: NS, server: string): boolean {
	const currentRam = ns.getServerMaxRam(server);
	let ram = Math.max(64, currentRam * 2);
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
