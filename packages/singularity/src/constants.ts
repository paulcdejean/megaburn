/** An arbitrary port number for this script that shouldn't overlap with batcher ports */
export const SINGULARITY_PORT = 67;
/** This port is used to store the price of the next RAM upgrade, to save controller RAM. */
export const RAM_UPGRADE_COST_PORT = 68;
/** This port is used to gather a list of story servers that have been backdoored, to avoid getServer in the controller. */
export const STORY_BACKDOOR_PORT = 69;

/** Higher home RAM values will grow static RAM and unlock broader functionality. */
export const TIER1_HOME_RAM = 32;
export const TIER2_HOME_RAM = 64;

/** The ram allocated to worker scripts is capped based on home ram tiers. */
export const TIER1_WORKER_RAM = 7.6;

/** Constant in the game's source code. */
export const TOR_ROUTER_COST = 200e3;
/** Constant in the game's source code, and getting it dynamically is 0.5GB RAM. */
export const BRUTE_SSH_COST = 500e3;
export const FTP_CRACK_COST = 1500e3;
export const RELAY_SMTP_COST = 5e6;

/** The hardcoded name for our batcher script. */
export const BATCHER_FILENAME = "batcher.js";

/** How much to train at the gym before going off and doing crimes. */
export const GYM_TARGET_SKILL = 15;
