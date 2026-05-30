import type { NS } from "@ns";
import { shareForLessThan } from "../utils/shareForLessThan";

export async function remotesMode(ns: NS): Promise<void> {
	if (ns.args[0] === "hack") {
		// oxlint-disable-next-line no-unused-vars
		const result = await ns.hack(ns.args[1] as string, {
			additionalMsec: ns.args[2] as number,
			stock: ns.args[3] as boolean,
			threads: ns.args[4] as number,
		});
		// ns.tprint(`Hacked ${ns.format.number(result)} from ${ns.args[1]}`);
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
		await shareForLessThan(ns, ns.args[2] as number);
	} else {
		throw Error(
			"Invalid remotes mode action, valid actions are hack, grow, weaken and share",
		);
	}

	ns.writePort(ns.args[5] as number, 1);
	ns.clearPort(ns.args[5] as number);
}
