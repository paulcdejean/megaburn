import type { NS } from "@ns";
import {
	BRUTE_SSH_COST,
	RAM_UPGRADE_COST_PORT,
	TOR_ROUTER_COST,
} from "./constants";
import { storyServerBackdoored } from "./storyServerBackdoored";
import type { Task } from "./task";

export function basicTasks(ns: NS): Task {
	const player = ns.getPlayer();
	// The highest priority task.
	// This needs to run before the batcher is started so that we're not waiting around to weaken n00dles too long.
	if (player.skills.hacking < 20 && player.city === "Sector-12") {
		return {
			name: "kickstartUni",
			ram: 4.65,
		};
	}
	// Since this is basicTasks, it means we only have 32GB of home RAM, so upgrading is a top priority.
	else if (
		ns.getPortHandle(RAM_UPGRADE_COST_PORT).empty() ||
		player.money > ns.getPortHandle(RAM_UPGRADE_COST_PORT).peek()
	) {
		return {
			name: "upgradeHomeRam",
			ram: 6.15,
		};
	}
	// Ways of spending money to increasing hacking are important if we don't have enough to upgrade home RAM.
	else if (player.money > TOR_ROUTER_COST && !ns.hasTorRouter()) {
		return {
			name: "purchaseTorRouter",
			ram: 3.6,
		};
	}
	// Required to have enough ports open to backdoor CSEC.
	else if (
		!ns.fileExists("BruteSSH.exe", "home") &&
		player.money > BRUTE_SSH_COST &&
		ns.hasTorRouter()
	) {
		return {
			name: "purchaseBruteSSH",
			ram: 3.6,
		};
	}
	// Since this is basicTasks we probably haven't reset, so CSEC is a good first faction to work.
	else if (
		!storyServerBackdoored(ns, "CSEC") &&
		player.skills.hacking > ns.getServerRequiredHackingLevel("CSEC")
	) {
		return {
			name: "backdoorCSEC",
			ram: 3.6,
		};
	}
	// Backdooring, joining and working are seperate tasks for maximum RAM dodging...
	else if (
		!player.factions.includes("CyberSec") &&
		storyServerBackdoored(ns, "CSEC")
	) {
		return {
			name: "joinCSEC",
			ram: 3.6,
		};
	}
	// Gym and crime require us to not be busy. This should keep us busy focused and on task.
	// Note that this does not require us to not be busy. So we will stop shoplifting and start work.
	else if (player.factions.includes("CyberSec")) {
		return {
			name: "workCSEC",
			ram: 3.6,
		};
	}
	// With lack of anything better to do, we will train to shoplift.
	else if (
		!ns.singularity.isBusy() &&
		player.skills.agility < 10 &&
		player.city === "Sector-12"
	) {
		return {
			name: "basicAgility",
			ram: 6.6,
		};
	}
	// With lack of anything better to do, we will train to shoplift.
	else if (
		!ns.singularity.isBusy() &&
		player.skills.dexterity < 10 &&
		player.city === "Sector-12"
	) {
		return {
			name: "basicDexterity",
			ram: 6.6,
		};
	}
	// The lowest priority job to work.
	else if (!ns.singularity.isBusy()) {
		return {
			name: "shoplifting",
			ram: 7.6,
		};
	}
	// This isn't strictly an idle state. The player will continue to work their job but while looking for a better one.
	else {
		return {
			name: "wait",
			ram: 0, // Actually! Because it just doesn't run anything.
		};
	}
}
