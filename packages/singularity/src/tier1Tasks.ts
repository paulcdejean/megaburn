import type { NS } from "@ns";
import {
	BATCHER_FILENAME,
	BRUTE_SSH_COST,
	FTP_CRACK_COST,
	RAM_UPGRADE_COST_PORT,
	RELAY_SMTP_COST,
	TOR_ROUTER_COST,
} from "./constants";
import { storyServerBackdoored } from "./storyServerBackdoored";

export function tier1Tasks(ns: NS): string {
	const player = ns.getPlayer();
	// The highest priority task.
	// This needs to run before the batcher is started so that we're not waiting around to weaken n00dles too long.
	if (player.skills.hacking < 20 && player.city === "Sector-12") {
		return "kickstartUni";
	}
	// We want to launch the batcher only after some university time.
	else if (!ns.isRunning(BATCHER_FILENAME, "home")) {
		return "startBatcher";
	}
	// Since this is basicTasks, it means we only have 32GB of home RAM, so upgrading is a top priority.
	else if (
		ns.getPortHandle(RAM_UPGRADE_COST_PORT).empty() ||
		player.money > ns.getPortHandle(RAM_UPGRADE_COST_PORT).peek()
	) {
		return "upgradeHomeRam";
	}
	// Ways of spending money to increasing hacking are important if we don't have enough to upgrade home RAM.
	else if (player.money > TOR_ROUTER_COST && !ns.hasTorRouter()) {
		return "purchaseTorRouter";
	}
	// Required to have enough ports open to backdoor CSEC.
	else if (
		!ns.fileExists("BruteSSH.exe", "home") &&
		player.money > BRUTE_SSH_COST &&
		ns.hasTorRouter()
	) {
		return "purchaseBruteSSH";
	} else if (
		!ns.fileExists("FTPCrack.exe", "home") &&
		player.money > FTP_CRACK_COST &&
		ns.hasTorRouter()
	) {
		return "purchaseFTPCrack";
	} else if (
		!ns.fileExists("relaySMTP.exe", "home") &&
		player.money > RELAY_SMTP_COST &&
		ns.hasTorRouter()
	) {
		return "purchaseRelaySMTP";
	}
	// Since this is basicTasks we probably haven't reset, so CSEC is a good first faction to work.
	else if (
		!storyServerBackdoored(ns, "CSEC") &&
		player.skills.hacking > ns.getServerRequiredHackingLevel("CSEC")
	) {
		return "backdoorCSEC";
	}
	// Backdooring, joining and working are seperate tasks for maximum RAM dodging...
	else if (
		!player.factions.includes("CyberSec") &&
		storyServerBackdoored(ns, "CSEC")
	) {
		return "joinCSEC";
	}
	// Gym and crime require us to not be busy. This should keep us busy focused and on task.
	// Note that this does not require us to not be busy. So we will stop shoplifting and start work.
	else if (!ns.singularity.isBusy() && player.factions.includes("CyberSec")) {
		return "workCSEC";
	}
	// With lack of anything better to do, we will train to shoplift.
	else if (
		!ns.singularity.isBusy() &&
		player.skills.agility < 15 &&
		player.city === "Sector-12"
	) {
		return "basicAgility";
	}
	// With lack of anything better to do, we will train to shoplift.
	else if (
		!ns.singularity.isBusy() &&
		player.skills.dexterity < 15 &&
		player.city === "Sector-12"
	) {
		return "basicDexterity";
	}
	// The lowest priority job to work.
	else if (!ns.singularity.isBusy()) {
		return "shoplifting";
	}
	// This isn't strictly an idle state. The player will continue to work their job but while looking for a better one.
	else {
		return "wait";
	}
}
