import type { NS } from "@ns";
import { YUMMY_N00DLE_THRESHOLD } from "../constants";
import { hackDown } from "./strategy/hackDown";
import { longClimb } from "./strategy/longClimb";
import { nineN00dles } from "./strategy/nineN00dles";

export async function mainMode(ns: NS): Promise<void> {
	const batchStartMoney = ns.getMoneySources().sinceInstall.hacking;

	if (
		!ns.fileExists(ns.enums.ProgramName.bruteSsh, "home") ||
		!ns.fileExists(ns.enums.ProgramName.ftpCrack, "home") ||
		!ns.fileExists(ns.enums.ProgramName.relaySmtp, "home") ||
		ns.getHackingLevel() < 100
	) {
		if (n00dlesYucky(ns) && ns.getServerMaxRam("home") < 4096) {
			await hackDown(ns);
		} else {
			ns.tprint("HERE???");
			await nineN00dles(ns);
		}
	} else {
		await longClimb(ns);
	}

	const batchFinishMoney = ns.getMoneySources().sinceInstall.hacking;
	ns.tprint(
		`$${ns.format.number(batchFinishMoney - batchStartMoney)} money hacked`,
	);
}

function n00dlesYucky(ns: NS): boolean {
	// At the start of BN1.2 n00dleScore is 8373.75
	// At the start of BN4.1 n00dleScore is 188.41
	// We pick a heuristic value of n00dles being yucky.
	const n00dleScore =
		ns.getServerMaxMoney("n00dles") * ns.hackAnalyze("n00dles");
	return n00dleScore < YUMMY_N00DLE_THRESHOLD;
}
