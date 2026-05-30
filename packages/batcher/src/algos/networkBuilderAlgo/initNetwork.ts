import type { NS } from "@ns";
import { HOME_RESERVED_RAM } from "../../constants";
import type { Network, NetworkServer } from "../../types";
import { getServerList } from "../../utils/getServerList";

export function initNetwork(ns: NS): Network {
	const result: Network = new Map();
	for (const server of getServerList(ns)) {
		if (server !== "home") {
			ns.scp(ns.getScriptName(), server);
			const serverData = ns.getServer(server) as NetworkServer;
			serverData.batcherRam = BigInt(serverData.maxRam * 20);
			result.set(server, serverData);
		} else {
			const serverData = ns.getServer(server) as NetworkServer;
			serverData.batcherRam = BigInt(
				(serverData.maxRam - HOME_RESERVED_RAM) * 20,
			);
			result.set(server, serverData);
		}
	}
	return result;
}

export function povertyInitNetwork(ns: NS): Network {
	const result: Network = new Map();
	for (const server of getServerList(ns)) {
		const newServer: NetworkServer = {
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
			batcherRam: BigInt(ns.getServerMaxRam(server) * 20),
		};
		result.set(server, newServer);
		if (server !== "home") {
			ns.scp(ns.getScriptName(), server);
		}
	}
	return result;
}
