export const SCRIPT_LIMIT = 400100;
export const STARTING_PORT = 2000;
export const WEAKEN_SEC = 0.05;
export const HG_SEC = 0.004;

// An guess as to whether n00dles are worth...
export const YUMMY_N00DLE_THRESHOLD = 2000;

// The amount of home RAM that shouldn't be used by the batcher.
export const HOME_RESERVED_RAM = 128;

export enum Action {
	hack = "hack",
	grow = "grow",
	weaken = "weaken",
	share = "share",
}

export const ActionRam = {
	hack: 1.7,
	grow: 1.75,
	weaken: 1.75,
	share: 4,
};

export const ActionBatcherRam = {
	hack: 34n,
	grow: 35n,
	weaken: 35n,
	share: 80n,
};
