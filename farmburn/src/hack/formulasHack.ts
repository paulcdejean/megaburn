import { NS } from "@ns";
import { Network } from "../types";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function formulasHack(ns : NS, target : string, network : Network): Promise<number> {

  return ns.weaken(target)
}
