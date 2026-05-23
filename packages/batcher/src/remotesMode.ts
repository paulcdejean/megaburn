import type { NS } from "@ns";

export async function remotesMode(ns: NS): Promise<void> {
	if (ns.args[0] === "hack") {
		await ns.hack(ns.args[1] as string, {
			additionalMsec: ns.args[2] as number,
			stock: ns.args[3] as boolean,
			threads: ns.args[4] as number,
		});
	} else if (ns.args[0] === "grow") {
		await ns.grow(ns.args[1] as string, {
			additionalMsec: ns.args[2] as number,
			stock: ns.args[3] as boolean,
			threads: ns.args[4] as number,
		});
	} else if (ns.args[0] === "weaken") {
		await ns.weaken(ns.args[1] as string, {
			additionalMsec: ns.args[2] as number,
			stock: ns.args[3] as boolean,
			threads: ns.args[4] as number,
		});
	} else if (ns.args[0] === "share") {
		for (let n = 0; n < (ns.args[2] as number); n++) {
			await ns.share();
		}
	} else {
		throw Error(
			"Invalid remotes mode action, valid actions are hack, grow, weaken and share",
		);
	}

	ns.writePort(ns.args[5] as number, 1);
	ns.clearPort(ns.args[5] as number);
}
