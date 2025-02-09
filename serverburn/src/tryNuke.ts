import { NS } from "@ns";

export function tryNuke(ns : NS, server : string) : boolean {
  ns.brutessh(server)
  ns.ftpcrack(server)
  ns.relaysmtp(server)
  ns.httpworm(server)
  ns.sqlinject(server)
  ns.nuke(server)
  return ns.hasRootAccess(server)
}
