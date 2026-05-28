import type { NS, Server } from "@ns";
import { getServerList } from "../getServerList";
import type { Network } from "../types";

export function initNetwork(ns: NS): Network {
	const result: Network = new Map();
	for (const server of getServerList(ns)) {
		if (server !== "home") {
			ns.scp(ns.getScriptName(), server);
			result.set(server, ns.getServer(server) as Required<Server>);
		} else {
			const home = ns.getServer("home") as Required<Server>;
			// This reserves the first 128GB of home for actually being able to do stuff.
			// Using that RAM for batching is too much of a micro optimization, and leads to great frustration.
			home.maxRam = home.maxRam - 128;
			result.set(server, home);
		}
	}
	return result;
}

export function povertyInitNetwork(ns: NS): Network {
	const result: Network = new Map();
	for (const server of getServerList(ns)) {
		const newServer: Required<Server> = {
			hostname: server,
			ip: "poverty",
			sshPortOpen: false,
			ftpPortOpen: false,
			smtpPortOpen: false,
			httpPortOpen: false,
			sqlPortOpen: false,
			hasAdminRights: ns.hasRootAccess(server),
			cpuCores: 1,
			isConnectedTo: false,
			ramUsed: ns.getServerUsedRam(server),
			maxRam: ns.getServerMaxRam(server),
			organizationName: "poverty",
			purchasedByPlayer: false,
			backdoorInstalled: false,
			baseDifficulty: ns.getServerMinSecurityLevel(server),
			hackDifficulty: ns.getServerSecurityLevel(server),
			minDifficulty: ns.getServerMinSecurityLevel(server),
			moneyAvailable: ns.getServerMoneyAvailable(server),
			moneyMax: ns.getServerMaxMoney(server),
			numOpenPortsRequired: 5,
			openPortCount: 0,
			requiredHackingSkill: 9999,
			serverGrowth: 0.67,
		};
		result.set(server, newServer);
		if (server !== "home") {
			ns.scp(ns.getScriptName(), server);
		}
	}
	return result;
}
