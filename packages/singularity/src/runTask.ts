import type { NS } from "@ns";
import { basicAgility } from "./tasks/basicAgility";
import { basicDexterity } from "./tasks/basicDexterity";
import { kickstartUni } from "./tasks/kickstartUni";
import { purchaseTorRouter } from "./tasks/purchaseTorRouter";
import { shoplifting } from "./tasks/shoplifting";
import { upgradeHomeRam } from "./tasks/upgradeHomeRam";

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
	} else {
		throw Error(`Unimplemented task: ${task}`);
	}
}
