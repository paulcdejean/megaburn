import type { NS, Server } from "@ns";
import type { Action } from "./constants";
import type { Farm } from "./Farm";

export interface NetworkServer extends Required<Server> {
	batcherRam: bigint;
}

export type Network = Map<string, NetworkServer>;

export interface Operation {
	host: string;
	threads: number;
	action: Action;
}

export type Batch = Operation[];

export type BatcherTask = (
	ns: NS,
	network: Network,
	target: string,
	hackThreads: number,
	farm: Farm,
) => number;

export type NetworkBuilderAlgo = (ns: NS) => Network;
export type TargetSelectionAlgo = (ns: NS, network: Network) => string;
export type HackingThreadAlgo = (
	ns: NS,
	network: Network,
	target: string,
) => number;
export type CycleTimeAlgo = (ns: NS, network: Network, target: string) => Farm;

export interface BatcherAlgo {
	buildNetwork: NetworkBuilderAlgo;
	selectTarget: TargetSelectionAlgo;
	pickHackThreads: HackingThreadAlgo;
	pickCycleTime: CycleTimeAlgo;
	tasks: BatcherTask[];
}
