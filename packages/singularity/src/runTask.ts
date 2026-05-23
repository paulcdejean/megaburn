import type { NS } from "@ns";
import { backdoorCSEC } from "./tasks/backdoorCSEC";
import { basicAgility } from "./tasks/basicAgility";
import { basicDexterity } from "./tasks/basicDexterity";
import { joinCSEC } from "./tasks/joinCSEC";
import { kickstartUni } from "./tasks/kickstartUni";
import { purchaseBruteSSH } from "./tasks/purchaseBruteSSH";
import { purchaseTorRouter } from "./tasks/purchaseTorRouter";
import { shoplifting } from "./tasks/shoplifting";
import { upgradeHomeRam } from "./tasks/upgradeHomeRam";
import { workCSEC } from "./tasks/workCSEC";

export async function runTask(ns: NS, task: string) {
	if (task === "kickstartUni") {
		await kickstartUni(ns);
	} else if (task === "purchaseTorRouter") {
		await purchaseTorRouter(ns);
	} else if (task === "basicAgility") {
		await basicAgility(ns);
	} else if (task === "basicDexterity") {
		await basicDexterity(ns);
	} else if (task === "shoplifting") {
		await shoplifting(ns);
	} else if (task === "upgradeHomeRam") {
		await upgradeHomeRam(ns);
	} else if (task === "purchaseBruteSSH") {
		await purchaseBruteSSH(ns);
	} else if (task === "backdoorCSEC") {
		await backdoorCSEC(ns);
	} else if (task === "joinCSEC") {
		await joinCSEC(ns);
	} else if (task === "workCSEC") {
		await workCSEC(ns);
	} else {
		throw Error(`Unimplemented task: ${task}`);
	}
}
