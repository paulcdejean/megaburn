import type { NS } from "@ns";
import { Farm } from "../../Farm";
import type { Network } from "../../types";

export function hackTimeRoundedUp(
	ns: NS,
	network: Network,
	target: string,
): Farm {
	const hackTime = ns.getHackTime(target);
	const cycleTime = Math.max(Math.ceil(hackTime / 1000) * 1000, 10000);
	return new Farm(cycleTime);
}
