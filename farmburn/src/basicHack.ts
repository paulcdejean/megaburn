import { NS, Server } from "@ns";

type Network = Map<string, Required<Server>>


export async function basicHack(ns : NS, target : string): Promise<number> {
  const network : Network = new Map(Object.entries(JSON.parse(ns.read("data/network.json"))))

  // Because we don't have formulas, can't do anything what so ever, until we weaken the target to minimum security
  // Don't use optional chain, because we want it to throw an error rather than evaulting to true
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (network.get(target)!.hackDifficulty === network.get(target)!.minDifficulty) {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function simpleWeaken(ns : NS, target : string, network : Network) : void {
  ns.tprint("Weaken not implemented yet")
  return
}
