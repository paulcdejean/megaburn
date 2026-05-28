import type { NS } from "@ns";
import {
	Action,
	ActionBatcherRam,
	ActionRam,
	SCRIPT_LIMIT,
	STARTING_PORT,
} from "./constants";
import type { Batch, Network } from "./types";

export class Farm {
	startupPromises: Promise<void>[];
	completionPromises: Promise<true | void>[];
	cycleTime: number;
	port: number;
	scriptLimit: number;

	constructor(cycleTime: number) {
		this.startupPromises = [];
		this.completionPromises = [];
		this.cycleTime = cycleTime;
		this.port = STARTING_PORT;
		this.scriptLimit = SCRIPT_LIMIT;
	}

	exec(ns: NS, network: Network, target: string, batch: Batch): boolean {
		if (this.scriptLimit < batch.length) {
			return false;
		} else {
			// Script limit is immediately updated.
			this.scriptLimit = this.scriptLimit - batch.length;
			// RAM is immediately updated.
			for (const operation of batch) {
				const server = network.get(operation.host);
				if (server !== undefined) {
					server.batcherRam =
						server.batcherRam -
						ActionBatcherRam[operation.action] * BigInt(operation.threads);
					if (server.batcherRam < 0) {
						throw Error(
							`Tried to schedule ${operation.action} on ${operation.host} with ${operation.threads} threads, but insufficent RAM available`,
						);
					}
				}
			}
			this.startupPromises.push(
				new Promise<void>((resolve, reject) => {
					setTimeout(() => {
						try {
							for (const operation of batch) {
								let additionalMsecs = -1;
								let ramOverride = -1;
								if (operation.action === Action.hack) {
									additionalMsecs =
										this.cycleTime - ns.getHackTime(target) + 0.5;
									ramOverride = ActionRam.hack;
								} else if (operation.action === Action.grow) {
									additionalMsecs =
										this.cycleTime - ns.getGrowTime(target) + 0.5;
									ramOverride = ActionRam.grow;
								} else if (operation.action === Action.weaken) {
									additionalMsecs =
										this.cycleTime - ns.getWeakenTime(target) + 0.5;
									ramOverride = ActionRam.weaken;
								} else if (operation.action === Action.share) {
									additionalMsecs = Math.floor(this.cycleTime / 10000);
									ramOverride = ActionRam.share;
								} else {
									reject(new Error("typescript says this is unreachable"));
								}

								if (additionalMsecs < 0) {
									reject(
										new Error(
											`Negative extraMsecs with cycle time ${this.cycleTime} and weaken time ${ns.getWeakenTime(target)} for target ${target}`,
										),
									);
								}

								const runOptions = {
									preventDuplicates: false,
									ramOverride: ramOverride,
									temporary: true,
									threads: operation.threads,
								};

								const actionOptions = {
									additionalMsec: additionalMsecs,
									stock: false,
									threads: operation.threads,
								};

								const execResult = ns.exec(
									ns.getScriptName(),
									operation.host,
									runOptions,
									operation.action,
									target,
									actionOptions.additionalMsec,
									actionOptions.stock,
									actionOptions.threads,
									this.port,
								);

								if (execResult === 0) {
									reject(
										new Error(
											`Failed to exec ${operation.action} on ${operation.host} with ${operation.threads} threads`,
										),
									);
								}
								this.completionPromises.push(
									ns.getPortHandle(this.port).nextWrite(),
								);
								this.port = this.port + 1;
							}
						} catch (error) {
							// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
							reject(error);
						}
						resolve();
					});
				}),
			);
			return true;
		}
	}
}
