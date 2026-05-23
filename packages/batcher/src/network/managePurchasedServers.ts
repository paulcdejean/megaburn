import type { NS, Server } from "@ns";
import type { Network } from "../types";

export function managePurchasedServers(ns: NS, network: Network): void {
	let upgradableServer: string | null = null;
	let purchasedServerCount = 0;
	for (const [server, data] of network) {
		if (data.purchasedByPlayer && server !== "home") {
			purchasedServerCount++;
			if (data.maxRam < ns.cloud.getRamLimit()) {
				upgradableServer = server;
			}
		}
	}

	if (upgradableServer !== null) {
		upgradeServer(ns, upgradableServer);
		network.get(upgradableServer)!.maxRam =
			ns.getServerMaxRam(upgradableServer);
	} else if (purchasedServerCount < ns.cloud.getServerLimit()) {
		do {
			const newServer = purchaseServer(ns, purchasedServerCount);
			if (newServer !== "") {
				network.set(newServer, ns.getServer(newServer) as Required<Server>);
				purchasedServerCount++;
				ns.scp(ns.getScriptName(), newServer);
			}
		} while (
			ns.getServerMoneyAvailable("home") >
				ns.cloud.getServerCost(ns.cloud.getRamLimit()) &&
			purchasedServerCount < ns.cloud.getServerLimit()
		);
	}
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

function purchaseServer(ns: NS, purchasedServerCount: number): string {
	const name = `purchased-${String(purchasedServerCount).padStart(2, "0")}`;
	let ram = ns.cloud.getRamLimit();
	let result = "";
	while (ram >= 2) {
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
