export const SCRIPT_LIMIT = 400100;
export const STARTING_PORT = 2000;
export const WEAKEN_SEC = 0.05;
export const HG_SEC = 0.004;

// An guess as to whether n00dles are worth...
export const YUMMY_N00DLE_THRESHOLD = 2000;

export enum Action {
	hack = "hack",
	grow = "grow",
	weaken = "weaken",
	share = "share",
}

export const ActionRam = {
	hack: 1.75, // Not actually, but 1.7 leads to rounding errors everywhere...
	grow: 1.75,
	weaken: 1.75,
	share: 4,
};
