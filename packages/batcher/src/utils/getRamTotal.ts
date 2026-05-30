import type { NS } from "@ns";
import { getServerList } from "./getServerList";

export function getRamTotal(ns: NS): number {
	let result = 0;
	for (const server of getServerList(ns)) {
		result = result + ns.getServerMaxRam(server);
	}
	return result;
}
