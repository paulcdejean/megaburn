import type { NS } from "@ns";

export async function anyLengthShare(ns: NS, msecs: number) {
	let done = false;
	const snooze = new Promise<void>((resolve, _reject) => {
		setTimeout(() => {
			done = true;
			resolve();
		}, msecs);
	});

	while (true) {
		const share = ns.share();
		await Promise.any([snooze, share]);
		if (done) break;
	}
}
