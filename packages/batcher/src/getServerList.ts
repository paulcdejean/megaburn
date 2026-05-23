import type { NS } from "@ns";

export function getServerList(ns: NS): Set<string> {
	const unscannedServers: string[] = ["home"];
	const result = new Set<string>();
	while (unscannedServers.length > 0) {
		const serverToScan: string = unscannedServers.pop()!;
		result.add(serverToScan);
		for (const server of ns.scan(serverToScan)) {
			if (!result.has(server)) {
				unscannedServers.push(server);
			}
		}
	}
	return result;
}
