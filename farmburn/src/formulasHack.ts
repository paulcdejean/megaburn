import { NS } from "@ns";


export async function formulasHack(ns : NS, target : string): Promise<number> {
  return ns.weaken(target)
}