import type { NS } from "@ns";
import { backdoorCSEC } from "./tasks/backdoorCSEC";
import { basicAgility } from "./tasks/basicAgility";
import { basicCrime } from "./tasks/basicCrime";
import { basicDefense } from "./tasks/basicDefense";
import { basicDexterity } from "./tasks/basicDexterity";
import { basicStrength } from "./tasks/basicStrength";
import { joinCSEC } from "./tasks/joinCSEC";
import { kickstartUni } from "./tasks/kickstartUni";
import { purchaseBruteSSH } from "./tasks/purchaseBruteSSH";
import { purchaseFTPCrack } from "./tasks/purchaseFTPCrack";
import { purchaseRelaySMTP } from "./tasks/purchaseRelaySMTP";
import { purchaseTorRouter } from "./tasks/purchaseTorRouter";
import { startBatcher } from "./tasks/startBatcher";
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
	} else if (task === "basicStrength") {
		await basicStrength(ns);
	} else if (task === "basicDefense") {
		await basicDefense(ns);
	} else if (task === "basicCrime") {
		await basicCrime(ns);
	} else if (task === "upgradeHomeRam") {
		await upgradeHomeRam(ns);
	} else if (task === "purchaseBruteSSH") {
		await purchaseBruteSSH(ns);
	} else if (task === "purchaseFTPCrack") {
		await purchaseFTPCrack(ns);
	} else if (task === "purchaseRelaySMTP") {
		await purchaseRelaySMTP(ns);
	} else if (task === "backdoorCSEC") {
		await backdoorCSEC(ns);
	} else if (task === "joinCSEC") {
		await joinCSEC(ns);
	} else if (task === "workCSEC") {
		await workCSEC(ns);
	} else if (task === "startBatcher") {
		await startBatcher(ns);
	} else {
		throw Error(`Unimplemented task: ${task}`);
	}
}
