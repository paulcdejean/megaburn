import type { NS } from "@ns";

/**
 * A more reliable way to share for less than msecs.
 */
export async function shareForLessThan(ns: NS, msecs: number) {
	if (msecs < 10000) {
		return;
	}

	let done = false;
	const snooze = new Promise<void>((resolve, _reject) => {
		setTimeout(
			() => {
				done = true;
				resolve();
			},
			Math.max(msecs - 10000, 0),
		);
	});

	while (true) {
		const share = ns.share();
		await Promise.any([snooze, share]);
		if (done) {
			await Promise.all([snooze, share]);
			break;
		}
	}
}
