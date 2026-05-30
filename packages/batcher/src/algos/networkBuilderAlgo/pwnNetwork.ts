import type { NS } from "@ns";
import type { Network } from "../../types";
import { initNetwork, povertyInitNetwork } from "./initNetwork";
import { managePurchasedServers } from "./managePurchasedServers";

export function povertyPwnNetwork(ns: NS): Network {
	const result: Network = povertyInitNetwork(ns);
	for (const [serverName, server] of result) {
		if (!server.hasAdminRights) {
			ns.brutessh(serverName);
			ns.ftpcrack(serverName);
			ns.relaysmtp(serverName);
			ns.httpworm(serverName);
			ns.sqlinject(serverName);
			ns.nuke(serverName);
			if (ns.hasRootAccess(serverName)) {
				server.hasAdminRights = true;
			}
		}
	}
	return result;
}

export function pwnNetwork(ns: NS): Network {
	const result: Network = initNetwork(ns);
	for (const [serverName, server] of result) {
		if (!server.hasAdminRights) {
			ns.brutessh(serverName);
			ns.ftpcrack(serverName);
			ns.relaysmtp(serverName);
			ns.httpworm(serverName);
			ns.sqlinject(serverName);
			ns.nuke(serverName);
			if (ns.hasRootAccess(serverName)) {
				server.hasAdminRights = true;
			}
		}
	}
	return result;
}

export function pwnAndPurchase(ns: NS): Network {
	const result: Network = pwnNetwork(ns);
	managePurchasedServers(ns, result, ns.cloud.getRamLimit());
	return result;
}

export function pwnBuyMini(ns: NS): Network {
	const result: Network = pwnNetwork(ns);
	managePurchasedServers(ns, result, 64);
	return result;
}
