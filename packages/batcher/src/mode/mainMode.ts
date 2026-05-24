import type { NS } from "@ns";
import { eatSushi } from "./strategy/eatSushi";
import { nineN00dles } from "./strategy/nineN00dles";

export async function mainMode(ns: NS): Promise<void> {
	const batchStartMoney = ns.getMoneySources().sinceInstall.hacking;

	if (
		!ns.fileExists(ns.enums.ProgramName.bruteSsh, "home") ||
		!ns.fileExists(ns.enums.ProgramName.ftpCrack, "home") ||
		!ns.fileExists(ns.enums.ProgramName.relaySmtp, "home") ||
		ns.getHackingLevel() < 1000
	) {
		await nineN00dles(ns);
	} else {
		await eatSushi(ns);
	}

	const batchFinishMoney = ns.getMoneySources().sinceInstall.hacking;
	ns.tprint(
		`$${ns.format.number(batchFinishMoney - batchStartMoney)} money hacked`,
	);
}
