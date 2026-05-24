import type { NS } from "@ns";
import { Action } from "./constants";
import { getServerList } from "./getServerList";
import { limitedMode } from "./mode/limitedMode";
import { mainMode } from "./mode/mainMode";
import { remotesMode } from "./mode/remotesMode";

/**
 * This function is NOT the true main. It's just used for setting the static RAM.
 */
async function main(ns: NS): Promise<void> {
	ns.ramOverride(8);
}

/**
 * This function is what is exported as main to bitburner!
 */
export async function realMain(ns: NS): Promise<void> {
	const remoteTypes = new Set(Object.keys(Action));

	if (
		ns.args.length > 0 &&
		typeof ns.args[0] === "string" &&
		remoteTypes.has(ns.args[0])
	) {
		await remotesMode(ns);
	} else {
		ns.atExit(() => {
			for (const server of getServerList(ns)) {
				if (server !== "home") {
					ns.scriptKill(ns.getScriptName(), server);
				}
			}
			ns.scriptKill(ns.getScriptName());
		});
		ns.disableLog("ALL");
		while (true) {
			if (ns.ramOverride() <= 8) {
				// Attempt to upgrade to full functionality, but if we can't launch limitd mode.
				if (ns.getServerMaxRam("home") >= 32) {
					ns.tprint(
						"Home RAM upgraded, switching from limited mode to main mode strategies!",
					);
					ns.ramOverride(20);
				} else {
					await limitedMode(ns);
				}
			} else {
				await mainMode(ns);
			}
		}
	}
}

export { main as notMain, realMain as main };
