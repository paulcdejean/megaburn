import type { NS } from "@ns";
import { Farm } from "../Farm";
import type { Network } from "../types";

export function weakenTimeRoundedUp(
	ns: NS,
	network: Network,
	target: string,
): Farm {
	const weakenTime = ns.getWeakenTime(target);
	const cycleTime = Math.max(Math.ceil(weakenTime / 1000) * 1000, 10000);
	return new Farm(cycleTime);
}
