import { NS } from "@ns";
import { Network } from "./types";

export async function basicHack(ns : NS, target : string, network : Network): Promise<number> {
  // Because we don't have formulas, can't do anything what so ever, until we weaken the target to minimum security
  // Don't use optional chain, because we want it to throw an error rather than evaulting to true
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if ((network.get(target)!.hackDifficulty === network.get(target)!.minDifficulty) && ns.getHackingLevel() > 10) {
    simpleHWGW(ns, target, network)
  } else {
    simpleWeaken(ns, target, network)
  }

  return ns.weaken(target)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function simpleHWGW(ns : NS, target : string, network : Network) : void {
  ns.tprint("Farming not implemented yet")
  return
}


function simpleWeaken(ns : NS, target : string, network : Network) : void {
  const homeReservedRam = 256
  for (const [serverName, serverData] of network) {
    let availableRam = serverData.maxRam
    if (serverName === "home") {
      availableRam = Math.min(0, availableRam - homeReservedRam)
    }
    const scriptRam = ns.getScriptRam("remotes/weaken.js", "home")
    const weakenThreads = Math.floor(availableRam / scriptRam)
    if (weakenThreads > 0) {
      setTimeout(ns.exec.bind(null, "remotes/weaken.js", serverName, {temporary: true, threads: weakenThreads}, target, 0, false, weakenThreads))
    }
  }
  return
}
