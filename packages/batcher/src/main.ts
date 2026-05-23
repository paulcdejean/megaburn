import type { NS } from "@ns";
import { Action } from "./constants";
import { getServerList } from "./getServerList";
import { limitedMode } from "./limitedMode";
import { mainMode } from "./mainMode";
import { remotesMode } from "./remotesMode";

export async function main(ns: NS): Promise<void> {
	const remoteTypes = new Set(Object.keys(Action));

	if (
		ns.args.length > 0 &&
		typeof ns.args[0] === "string" &&
		remoteTypes.has(ns.args[0])
	) {
		await remotesMode(ns);
	} else if (ns.ramOverride() <= 8) {
		ns.atExit(() => {
			for (const server of getServerList(ns)) {
				if (server !== "home") {
					ns.scriptKill(ns.getScriptName(), server);
				}
			}
			ns.scriptKill(ns.getScriptName());
		});
		await limitedMode(ns);
	} else {
		ns.atExit(() => {
			for (const server of getServerList(ns)) {
				if (server !== "home") {
					ns.scriptKill(ns.getScriptName(), server);
				}
			}
			ns.scriptKill(ns.getScriptName());
		});
		await mainMode(ns);
	}
}
