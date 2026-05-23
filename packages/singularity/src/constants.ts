/** An arbitrary port number for this script that shouldn't overlap with batcher ports */
export const SINGULARITY_PORT = 67;
/** This port is used to store the price of the next RAM upgrade, to save controller RAM. */
export const RAM_UPGRADE_COST_PORT = 68;
/** This port is used to gather a list of story servers that have been backdoored, to avoid getServer in the controller. */
export const STORY_BACKDOOR_PORT = 69;
/** The amount of static RAM you now have access to in the controller after successfully purchasing a ram upgrade */
export const TIER2_RAM = 32;
/** Constant in the game's source code. */
export const TOR_ROUTER_COST = 200e3;
/** Constant in the game's source code, and getting it dynamically is 0.5GB RAM. */
export const BRUTE_SSH_COST = 500e3;
