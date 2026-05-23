import type { NS } from "@ns";
import { STORY_BACKDOOR_PORT } from "./constants";

export function storyServerBackdoored(ns: NS, server: string): boolean {
	const port = ns.getPortHandle(STORY_BACKDOOR_PORT);
	if (port.empty() || !(port.peek() as [string]).includes(server)) {
		return false;
	} else {
		return true;
	}
}
