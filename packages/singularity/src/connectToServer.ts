import type { NS } from "@ns";

export function connectToServer(ns: NS, target: string) {
	// A crude depth first search.
	const tree: Set<string>[] = [new Set(["home"]), new Set(ns.scan("home"))];
	let depth = 1;

	// Limiter to prevent logic errors from crashing.
	while (depth < 20) {
		if (tree[depth].has(target)) {
			break;
		}

		const nextDepth: Set<string> = new Set();
		for (const currentLevel of tree[depth]) {
			for (const nextLevel of ns.scan(currentLevel)) {
				if (!tree[depth - 1].has(nextLevel)) {
					nextDepth.add(nextLevel);
				}
			}
		}

		if (nextDepth.size === 0) {
			throw Error(`Couldn't find server ${target}`);
		} else {
			tree.push(nextDepth);
			depth = depth + 1;
		}
	}

	let current = target;
	const path: string[] = [];
	while (depth > 0) {
		depth = depth - 1;
		path.push(current);
		for (const adjacent of ns.scan(current)) {
			if (tree[depth].has(adjacent)) {
				current = adjacent;
				break;
			}
		}
	}
	path.push("home");
	path.reverse();
	for (const server of path) {
		ns.singularity.connect(server);
	}
}
