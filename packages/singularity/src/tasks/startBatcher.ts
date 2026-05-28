import type { NS } from "@ns";
import { BATCHER_FILENAME } from "../constants";

export async function startBatcher(ns: NS): Promise<void> {
	ns.run(BATCHER_FILENAME, 1, "single");
}
