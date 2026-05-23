import type { NS } from "@ns";
import type { Network } from "../types";

export function wildGuess(ns: NS, network: Network): string {
	if (
		ns.getHackingLevel() < 100 ||
		ns.getServerMoneyAvailable("home") < 10000000
	) {
		return "n00dles";
	} else if (ns.getHackingLevel() < 400) {
		return "joesguns";
	} else if (
		ns.hasRootAccess("phantasy") &&
		ns.cloud.getServerLimit() !== ns.cloud.getServerNames().length
	) {
		return "phantasy";
	} else if (ns.hasRootAccess("omega-net") && ns.getHackingLevel() < 1000) {
		return "omega-net";
	} else if (
		ns.hasRootAccess("rho-construction") &&
		ns.getHackingLevel() < 2500
	) {
		return "rho-construction";
	} else if (ns.hasRootAccess("4sigma")) {
		return "4sigma";
	} else {
		return "joesguns";
	}
}
