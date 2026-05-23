import type { NS } from "@ns";
import { basicAgility } from "./tasks/basicAgility";
import { basicDexterity } from "./tasks/basicDexterity";
import { kickstartUni } from "./tasks/kickstartUni";
import { shoplifting } from "./tasks/shoplifting";

export async function runTask(ns: NS, task: string) {
	if (task === "kickstartUni") {
		await kickstartUni(ns);
	} else if (task === "basicAgility") {
		await basicAgility(ns);
	} else if (task === "basicDexterity") {
		await basicDexterity(ns);
	} else if (task === "shoplifting") {
		await shoplifting(ns);
	} else {
		throw Error(`Unimplemented task: ${task}`);
	}
}
